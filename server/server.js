import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const botToken = process.env.BOT_TOKEN;
const databaseUrl = process.env.DATABASE_URL;
if (!botToken || !databaseUrl) {
  console.error('BOT_TOKEN and DATABASE_URL are required.');
}
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://softpasha6-cpu.github.io')
  .split(',').map(x => x.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Telegram-Init-Data']
}));

function verifyTelegramInitData(initData) {
  if (!botToken || typeof initData !== 'string' || !initData || initData.length > 8192) {
    throw Object.assign(new Error('Telegram authorization required'), { status: 401 });
  }
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) {
    throw Object.assign(new Error('Invalid Telegram initData'), { status: 401 });
  }
  const pairs = [];
  for (const [key, value] of params.entries()) if (key !== 'hash') pairs.push([key, value]);
  pairs.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([key, value]) => key + '=' + value).join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculated = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest();
  const supplied = Buffer.from(hash, 'hex');
  if (supplied.length !== calculated.length || !crypto.timingSafeEqual(supplied, calculated)) {
    throw Object.assign(new Error('Telegram signature verification failed'), { status: 401 });
  }
  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate > now + 60 || now - authDate > 86400) {
    throw Object.assign(new Error('Telegram authorization expired. Reopen the app.'), { status: 401 });
  }
  let user;
  try { user = JSON.parse(params.get('user') || 'null'); } catch {}
  if (!user || !Number.isSafeInteger(Number(user.id)) || Number(user.id) <= 0) {
    throw Object.assign(new Error('Telegram user is missing'), { status: 401 });
  }
  return {
    id: String(user.id),
    username: typeof user.username === 'string' ? user.username.slice(0, 64) : null,
    firstName: typeof user.first_name === 'string' ? user.first_name.slice(0, 128) : ''
  };
}

async function requireUser(req, res, next) {
  try {
    const initData = req.get('X-Telegram-Init-Data');
    const user = verifyTelegramInitData(initData);
    const result = await pool.query(
      `INSERT INTO players (telegram_id, username, first_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (telegram_id) DO UPDATE SET
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         updated_at = NOW()
       RETURNING telegram_id, username, first_name, balance, created_at`,
      [user.id, user.username, user.firstName]
    );
    req.player = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'connected' }); }
  catch { res.status(503).json({ ok: false, database: 'unavailable' }); }
});

app.get('/api/me', requireUser, async (req, res) => {
  const history = await pool.query(
    'SELECT id, game, bet, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 ORDER BY created_at DESC LIMIT 20',
    [req.player.telegram_id]
  );
  res.json({
    player: {
      telegramId: String(req.player.telegram_id),
      username: req.player.username,
      firstName: req.player.first_name,
      balance: Number(req.player.balance)
    },
    history: history.rows.map(row => ({
      id: String(row.id), game: row.game, bet: Number(row.bet), payout: Number(row.payout),
      balanceAfter: Number(row.balance_after), outcome: row.outcome, createdAt: row.created_at
    }))
  });
});

const MAX_BET = 100000;
const SYMBOLS = ['⭐', '7️⃣', '💎', '🚀', '🌙', '👑'];
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const randInt = (max) => crypto.randomInt(0, max);
function card() { return randInt(13) + 1; }
function cardValue(c) { return Math.min(c, 10); }
function blackjackHand() { return [card(), card()]; }
function handTotal(hand) { return hand.reduce((sum, c) => sum + cardValue(c), 0); }

function playRound(game, bet, choice) {
  if (game === 'slots') {
    const reels = [SYMBOLS[randInt(SYMBOLS.length)], SYMBOLS[randInt(SYMBOLS.length)], SYMBOLS[randInt(SYMBOLS.length)]];
    let multiplier = 0;
    if (reels.every(s => s === reels[0])) multiplier = reels[0] === '7️⃣' ? 10 : reels[0] === '👑' ? 8 : 5;
    else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) multiplier = 1.5;
    return { payout: Math.floor(bet * multiplier), outcome: { reels, multiplier, message: multiplier >= 5 ? 'Джекпот!' : multiplier > 0 ? 'Есть выигрыш!' : 'Попробуй ещё раз' } };
  }
  if (game === 'dice') {
    const roll = randInt(6) + 1;
    const won = roll >= 4;
    return { payout: won ? bet * 2 : 0, outcome: { roll, won, message: won ? 'Выпало 4–6: выигрыш!' : 'Выпало 1–3: ставка проиграна' } };
  }
  if (game === 'roulette') {
    if (!['red','black'].includes(choice)) throw Object.assign(new Error('Для рулетки выбери red или black'), { status: 400 });
    const number = randInt(37);
    const color = number === 0 ? 'green' : RED_NUMBERS.has(number) ? 'red' : 'black';
    const won = color === choice;
    return { payout: won ? bet * 2 : 0, outcome: { number, color, choice, won, message: won ? 'Поздравляем! Ты выиграл.' : 'В этот раз не повезло.' } };
  }
  if (game === 'blackjack') {
    const player = blackjackHand();
    const dealer = blackjackHand();
    while (handTotal(dealer) < 17) dealer.push(card());
    const p = handTotal(player), d = handTotal(dealer);
    const playerNatural = p === 21 && player.length === 2;
    const dealerNatural = d === 21 && dealer.length === 2;
    let payout = 0, result = 'loss';
    if (playerNatural && !dealerNatural) { payout = Math.floor(bet * 2.5); result = 'blackjack'; }
    else if (p <= 21 && (d > 21 || p > d)) { payout = bet * 2; result = 'win'; }
    else if (p <= 21 && p === d) { payout = bet; result = 'push'; }
    return { payout, outcome: { player, dealer, playerTotal: p, dealerTotal: d, result, message: result === 'blackjack' ? 'Блэкджек! Выплата 2,5×.' : result === 'win' ? 'Ты победил дилера!' : result === 'push' ? 'Ничья — ставка возвращена.' : 'Дилер победил.' } };
  }
  throw Object.assign(new Error('Unknown game'), { status: 400 });
}

app.post('/api/bonus-wheel', requireUser, async (req, res, next) => {
  const requestId = req.body?.requestId;
  if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) {
    return res.status(400).json({ error: 'Некорректный идентификатор вращения.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE', [req.player.telegram_id]);
    const prior = await client.query(
      "SELECT id, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 AND idempotency_key=$2",
      [req.player.telegram_id, requestId]
    );
    if (prior.rowCount) {
      const row=prior.rows[0];
      await client.query('COMMIT');
      return res.json({transactionId:String(row.id),payout:Number(row.payout),balance:Number(row.balance_after),outcome:row.outcome,createdAt:row.created_at,replayed:true});
    }
    const claimed = await client.query('SELECT reward FROM bonus_wheel_claims WHERE telegram_id=$1 AND claim_date=CURRENT_DATE', [req.player.telegram_id]);
    if (claimed.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({error:'Бонусную рулетку можно крутить один раз в день.'});
    }
    const roll=randInt(100);
    let reward=0, label='Ничего — попробуй завтра';
    if(roll<55){reward=0;label='Пусто';}
    else if(roll<80){reward=25;label='+25 кредитов';}
    else if(roll<95){reward=50;label='+50 кредитов';}
    else if(roll<99){reward=100;label='+100 кредитов';}
    else {reward=250;label='+250 кредитов';}
    const balanceAfter=Number(locked.rows[0].balance)+reward;
    await client.query('UPDATE players SET balance=$2, updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,balanceAfter]);
    const inserted=await client.query(
      "INSERT INTO game_transactions (telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES ($1,'bonus_wheel',0,$2,$3,$4::jsonb,$5) RETURNING id,created_at",
      [req.player.telegram_id,reward,balanceAfter,JSON.stringify({reward,label,roll:roll+1,message:label}),requestId]
    );
    await client.query('INSERT INTO bonus_wheel_claims (telegram_id,claim_date,reward) VALUES ($1,CURRENT_DATE,$2)',[req.player.telegram_id,reward]);
    await client.query('COMMIT');
    res.json({transactionId:String(inserted.rows[0].id),payout:reward,balance:balanceAfter,outcome:{reward,label,message:label},createdAt:inserted.rows[0].created_at});
  } catch(error) {
    await client.query('ROLLBACK').catch(()=>{});
    if(error.code==='23505') return res.status(409).json({error:'Бонус уже получен сегодня.'});
    next(error);
  } finally { client.release(); }
});

app.post('/api/game', requireUser, async (req, res, next) => {
  const { game, choice } = req.body || {};
  const bet = Number(req.body?.bet);
  const requestId = req.body?.requestId;
  if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) {
    return res.status(400).json({ error: 'Нужен корректный идентификатор раунда. Обнови приложение и попробуй снова.' });
  }
  if (!Number.isSafeInteger(bet) || bet < 1 || bet > MAX_BET) {
    return res.status(400).json({ error: 'Ставка должна быть целым числом от 1 до 100 000 виртуальных кредитов.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prior = await client.query(
      'SELECT id, game, bet, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 AND idempotency_key=$2',
      [req.player.telegram_id, requestId]
    );
    if (prior.rowCount) {
      const row = prior.rows[0];
      await client.query('COMMIT');
      return res.json({
        transactionId: String(row.id), game: row.game, bet: Number(row.bet),
        payout: Number(row.payout), balance: Number(row.balance_after),
        outcome: row.outcome, createdAt: row.created_at, replayed: true
      });
    }
    const locked = await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE', [req.player.telegram_id]);
    // Re-check after acquiring the player lock: simultaneous retries may have waited here.
    const retry = await client.query(
      'SELECT id, game, bet, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 AND idempotency_key=$2',
      [req.player.telegram_id, requestId]
    );
    if (retry.rowCount) {
      const row = retry.rows[0];
      await client.query('COMMIT');
      return res.json({
        transactionId: String(row.id), game: row.game, bet: Number(row.bet),
        payout: Number(row.payout), balance: Number(row.balance_after),
        outcome: row.outcome, createdAt: row.created_at, replayed: true
      });
    }
    const balance = Number(locked.rows[0].balance);
    if (balance < bet) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Недостаточно виртуальных кредитов.' });
    }
    const round = playRound(game, bet, choice);
    const balanceAfter = balance - bet + round.payout;
    await client.query('UPDATE players SET balance=$2, updated_at=NOW() WHERE telegram_id=$1', [req.player.telegram_id, balanceAfter]);
    const inserted = await client.query(
      'INSERT INTO game_transactions (telegram_id, game, bet, payout, balance_after, outcome, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7) RETURNING id, created_at',
      [req.player.telegram_id, game, bet, round.payout, balanceAfter, JSON.stringify(round.outcome), requestId]
    );
    await client.query('COMMIT');
    res.json({
      transactionId: String(inserted.rows[0].id), game, bet, payout: round.payout,
      balance: balanceAfter, outcome: round.outcome, createdAt: inserted.rows[0].created_at
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

app.use((err, _req, res, _next) => {
  const status = Number(err.status) || (err.message === 'Origin not allowed' ? 403 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Внутренняя ошибка сервера' : err.message });
});

const port = Number(process.env.PORT || 3000);
try {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(schema);
  app.listen(port, () => console.log('Cosmic Fortune API listening on port ' + port));
} catch (error) {
  console.error('Startup failed: database schema could not be initialized.', error);
  process.exit(1);
}
