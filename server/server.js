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


const SUITS = ['♠','♥','♦','♣'];
function drawPlayingCard() {
  const rank = randInt(13) + 1;
  return { rank, suit: SUITS[randInt(SUITS.length)], value: rank === 1 ? 11 : Math.min(rank,10) };
}
function scoreHand(hand) {
  let total=hand.reduce((n,c)=>n+c.value,0), aces=hand.filter(c=>c.rank===1).length;
  while(total>21 && aces>0){total-=10;aces--;}
  return total;
}
function natural(hand){return hand.length===2 && scoreHand(hand)===21;}
function publicRoom(room, players, viewerId) {
  const state={...(room.state||{})};
  if(room.status==='playing' && Array.isArray(state.dealerHand) && state.dealerHand.length>1) state.dealerHand=[state.dealerHand[0],{hidden:true}];
  return {id:room.id,inviteCode:room.invite_code,status:room.status,bet:Number(room.bet),hostTelegramId:String(room.host_telegram_id),
    players:players.map(p=>({telegramId:String(p.telegram_id),username:p.username,firstName:p.first_name,seat:Number(p.seat),hand:p.hand,status:p.status,bet:Number(p.bet),payout:Number(p.payout),doubled:p.doubled,ready:Boolean(p.ready),score:p.hand?.length?scoreHand(p.hand):null,isMe:String(p.telegram_id)===String(viewerId)})),
    roundNumber:Number(room.round_number||1),state,createdAt:room.created_at};
}
async function getRoom(roomId, client=pool, lock=false) {
  const q=await client.query('SELECT * FROM blackjack_rooms WHERE id=$1'+(lock?' FOR UPDATE':''),[roomId]);
  if(!q.rowCount)throw Object.assign(new Error('Комната не найдена'),{status:404});
  const p=await client.query(`SELECT rp.*,pl.username,pl.first_name FROM blackjack_room_players rp JOIN players pl USING(telegram_id) WHERE rp.room_id=$1 ORDER BY rp.seat`,[roomId]);
  return {room:q.rows[0],players:p.rows};
}
async function settleBlackjackRoom(client, roomId) {
  let {room,players}=await getRoom(roomId,client,true);
  if(room.status!=='playing' || players.some(p=>p.status==='playing')) return {room,players};
  const state=room.state||{};
  let dealer=Array.isArray(state.dealerHand)?state.dealerHand:[];
  while(scoreHand(dealer)<17)dealer.push(drawPlayingCard());
  const dealerScore=scoreHand(dealer), dealerNatural=natural(dealer);
  for(const p of players){
    const total=scoreHand(p.hand);
    let payout=0;
    if(p.status==='busted')payout=0;
    else if(natural(p.hand)&&!dealerNatural)payout=Math.floor(Number(p.bet)*2.5);
    else if(dealerScore>21 || total>dealerScore)payout=Number(p.bet)*2;
    else if(total===dealerScore)payout=Number(p.bet);
    await client.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1',[p.telegram_id,payout]);
    await client.query("UPDATE blackjack_room_players SET payout=$3,status='finished' WHERE room_id=$1 AND telegram_id=$2",[roomId,p.telegram_id,payout]);
  }
  state.dealerHand=dealer;state.dealerScore=dealerScore;state.result='finished';
  await client.query("UPDATE blackjack_rooms SET status='finished',state=$2::jsonb,updated_at=NOW() WHERE id=$1",[roomId,JSON.stringify(state)]);
  return getRoom(roomId,client);
}
app.post('/api/blackjack/rooms', requireUser, async (req,res,next)=>{
  const bet=Number(req.body?.bet);
  if(!Number.isSafeInteger(bet)||bet<1||bet>MAX_BET)return res.status(400).json({error:'Ставка должна быть от 1 до 100 000.'});
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    // Clean up this user's previous solo waiting tables before creating another.
    // Refund their reserved stakes; preserve rooms with other actual participants.
    const oldSoloRooms=await client.query(`SELECT r.id,r.bet
      FROM blackjack_rooms r
      WHERE r.status='waiting' AND r.host_telegram_id=$1
        AND (SELECT count(*) FROM blackjack_room_players p WHERE p.room_id=r.id)=1
        AND EXISTS (SELECT 1 FROM blackjack_room_players p WHERE p.room_id=r.id AND p.telegram_id=$1)
      FOR UPDATE`,[req.player.telegram_id]);
    if(oldSoloRooms.rowCount){
      const refund=oldSoloRooms.rows.reduce((sum,r)=>sum+Number(r.bet),0);
      await client.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,refund]);
      const ids=oldSoloRooms.rows.map(r=>r.id);
      await client.query('DELETE FROM blackjack_room_players WHERE room_id=ANY($1)',[ids]);
      await client.query('DELETE FROM blackjack_rooms WHERE id=ANY($1)',[ids]);
    }
    const player=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
    if(Number(player.rows[0].balance)<bet){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно кредитов.'});}
    const code=crypto.randomBytes(4).toString('hex').toUpperCase();
    const room=await client.query("INSERT INTO blackjack_rooms(host_telegram_id,invite_code,bet) VALUES($1,$2,$3) RETURNING *",[req.player.telegram_id,code,bet]);
    await client.query('UPDATE players SET balance=balance-$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,bet]);
    await client.query("INSERT INTO blackjack_room_players(room_id,telegram_id,seat,bet,hand,status) VALUES($1,$2,1,$3,'[]'::jsonb,'waiting')",[room.rows[0].id,req.player.telegram_id,bet]);
    const result=await getRoom(room.rows[0].id,client);
    await client.query('COMMIT');
    res.status(201).json({room:publicRoom(result.room,result.players,req.player.telegram_id),balance:Number(player.rows[0].balance)-bet});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/blackjack/rooms/join', requireUser, async(req,res,next)=>{
  const code=String(req.body?.inviteCode||'').trim().toUpperCase();
  if(!/^[A-F0-9]{8}$/.test(code))return res.status(400).json({error:'Введи корректный код приглашения.'});
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const found=await client.query("SELECT * FROM blackjack_rooms WHERE invite_code=$1 FOR UPDATE",[code]);
    if(!found.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Комната по этому коду не найдена.'})}
    const room=found.rows[0];
    if(room.status!=='waiting'){await client.query('ROLLBACK');return res.status(409).json({error:'Игра уже началась или завершена.'})}
    const count=await client.query('SELECT count(*)::int AS n FROM blackjack_room_players WHERE room_id=$1',[room.id]);
    if(count.rows[0].n>=5){await client.query('ROLLBACK');return res.status(409).json({error:'В комнате максимум 5 игроков.'})}
    const existing=await client.query('SELECT 1 FROM blackjack_room_players WHERE room_id=$1 AND telegram_id=$2',[room.id,req.player.telegram_id]);
    if(existing.rowCount){await client.query('ROLLBACK');return res.status(409).json({error:'Ты уже в этой комнате.'})}
    const bet=Number(room.bet);
    const player=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
    if(Number(player.rows[0].balance)<bet){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно кредитов для входа.'})}
    await client.query('UPDATE players SET balance=balance-$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,bet]);
    await client.query("INSERT INTO blackjack_room_players(room_id,telegram_id,seat,bet,hand,status) VALUES($1,$2,$3,$4,'[]'::jsonb,'waiting')",[room.id,req.player.telegram_id,count.rows[0].n+1,bet]);
    const result=await getRoom(room.id,client);await client.query('COMMIT');
    res.json({room:publicRoom(result.room,result.players,req.player.telegram_id),balance:Number(player.rows[0].balance)-bet});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.get('/api/blackjack/rooms/:id',requireUser,async(req,res,next)=>{
  try{
    const result=await getRoom(req.params.id);
    if(!result.players.some(p=>String(p.telegram_id)===String(req.player.telegram_id)))return res.status(403).json({error:'Ты не участник этой комнаты.'});
    if(result.room.status==='waiting') await pool.query('UPDATE blackjack_rooms SET updated_at=NOW() WHERE id=$1',[req.params.id]);
    res.json({room:publicRoom(result.room,result.players,req.player.telegram_id)});
  }catch(e){next(e)}
});

app.post('/api/blackjack/rooms/:id/leave',requireUser,async(req,res,next)=>{
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const room=await client.query('SELECT id,status FROM blackjack_rooms WHERE id=$1 FOR UPDATE',[req.params.id]);
    if(!room.rowCount){await client.query('COMMIT');return res.json({left:true,deleted:true})}
    await client.query('DELETE FROM blackjack_room_players WHERE room_id=$1 AND telegram_id=$2',[req.params.id,req.player.telegram_id]);
    const remaining=await client.query('SELECT count(*)::int AS n FROM blackjack_room_players WHERE room_id=$1',[req.params.id]);
    if(remaining.rows[0].n===0){
      await client.query('UPDATE blackjack_rooms SET updated_at=NOW() WHERE id=$1',[req.params.id]);
    }
    await client.query('COMMIT');
    res.json({left:true,deleted:remaining.rows[0].n===0,remainingPlayers:remaining.rows[0].n});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});

app.get('/api/blackjack/rooms',requireUser,async(req,res,next)=>{
  try{
    // Waiting tables are visible as long as their creator is still seated.
    // Delete only truly abandoned/empty tables; a solo host must be able to wait for friends.
    await pool.query(`DELETE FROM blackjack_rooms r
      WHERE r.status='waiting'
      AND (r.updated_at < NOW() - INTERVAL '3 seconds'
        OR NOT EXISTS (SELECT 1 FROM blackjack_room_players p WHERE p.room_id=r.id))`);
    const result=await pool.query(`SELECT r.id,r.invite_code,r.bet,r.created_at,r.updated_at,r.round_number,
      count(p.telegram_id)::int AS player_count,
      count(p.telegram_id) FILTER (WHERE p.ready)::int AS ready_count,
      max(pl.first_name) FILTER (WHERE p.seat=1) AS host_name,
      json_agg(json_build_object('name',COALESCE(pl.first_name,pl.username,'Игрок'),'ready',p.ready,'seat',p.seat) ORDER BY p.seat) AS players
      FROM blackjack_rooms r JOIN blackjack_room_players p ON p.room_id=r.id
      JOIN players pl ON pl.telegram_id=p.telegram_id
      WHERE r.status='waiting'
      GROUP BY r.id
      HAVING count(p.telegram_id) >= 1
      ORDER BY r.created_at DESC LIMIT 50`);
    res.json({rooms:result.rows.map(r=>({id:r.id,inviteCode:r.invite_code,bet:Number(r.bet),playerCount:r.player_count,readyCount:r.ready_count,hostName:r.host_name||'Игрок',players:r.players,createdAt:r.created_at,roundNumber:Number(r.round_number||1)}))});
  }catch(e){next(e)}
});
app.post('/api/blackjack/rooms/:id/ready',requireUser,async(req,res,next)=>{
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const result=await getRoom(req.params.id,client,true);
    const wasRematch=result.room.status==='finished';
    const me=result.players.find(p=>String(p.telegram_id)===String(req.player.telegram_id));
    if(!me){await client.query('ROLLBACK');return res.status(403).json({error:'Ты не участник этого стола.'})}
    if(result.room.status==='playing'){await client.query('ROLLBACK');return res.status(409).json({error:'Раунд уже идёт.'})}
    await client.query('UPDATE blackjack_room_players SET ready=$3 WHERE room_id=$1 AND telegram_id=$2',[req.params.id,req.player.telegram_id,Boolean(req.body?.ready)]);
    let updated=await getRoom(req.params.id,client);
    const allReady=updated.players.length>=2&&updated.players.every(p=>p.ready);
    if(allReady){
      const bet=Number(updated.room.bet);
      if(wasRematch){
        for(const p of updated.players){
          const bal=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[p.telegram_id]);
          if(Number(bal.rows[0].balance)<bet){await client.query('ROLLBACK');return res.status(400).json({error:'У одного из игроков недостаточно кредитов для нового раунда.'})}
        }
        for(const p of updated.players){
          await client.query('UPDATE players SET balance=balance-$2,updated_at=NOW() WHERE telegram_id=$1',[p.telegram_id,bet]);
          await client.query("UPDATE blackjack_room_players SET hand='[]'::jsonb,status='waiting',bet=$3,payout=0,doubled=FALSE,ready=FALSE WHERE room_id=$1 AND telegram_id=$2",[req.params.id,p.telegram_id,bet]);
        }
      }
      const state={dealerHand:[drawPlayingCard(),drawPlayingCard()],turn:0,result:'playing'};
      for(const p of updated.players){
        const hand=[drawPlayingCard(),drawPlayingCard()];
        await client.query("UPDATE blackjack_room_players SET hand=$3::jsonb,status=$4 WHERE room_id=$1 AND telegram_id=$2",[req.params.id,p.telegram_id,JSON.stringify(hand),natural(hand)?'blackjack':'playing']);
      }
      await client.query("UPDATE blackjack_rooms SET status='playing',round_number=round_number+1,state=$2::jsonb,updated_at=NOW() WHERE id=$1",[req.params.id,JSON.stringify(state)]);
      updated=await getRoom(req.params.id,client);
      if(updated.players.every(p=>p.status!=='playing'))updated=await settleBlackjackRoom(client,req.params.id);
    }
    await client.query('COMMIT');
    res.json({room:publicRoom(updated.room,updated.players,req.player.telegram_id),allReady});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/blackjack/rooms/:id/start',requireUser,async(req,res,next)=>{
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    let result=await getRoom(req.params.id,client,true);
    if(String(result.room.host_telegram_id)!==String(req.player.telegram_id)){await client.query('ROLLBACK');return res.status(403).json({error:'Начать игру может создатель комнаты.'})}
    if(result.room.status!=='waiting'){await client.query('ROLLBACK');return res.status(409).json({error:'Эта комната уже запускалась.'})}
    if(result.players.length<2){await client.query('ROLLBACK');return res.status(400).json({error:'Пригласи хотя бы одного игрока перед стартом.'})}
    const state={dealerHand:[drawPlayingCard(),drawPlayingCard()],turn:0,result:'playing'};
    for(let i=0;i<result.players.length;i++){
      const p=result.players[i],hand=[drawPlayingCard(),drawPlayingCard()];
      await client.query("UPDATE blackjack_room_players SET hand=$3::jsonb,status=$4 WHERE room_id=$1 AND telegram_id=$2",[req.params.id,p.telegram_id,JSON.stringify(hand),natural(hand)?'blackjack':'playing']);
    }
    await client.query("UPDATE blackjack_rooms SET status='playing',state=$2::jsonb,updated_at=NOW() WHERE id=$1",[req.params.id,JSON.stringify(state)]);
    result=await getRoom(req.params.id,client);
    if(result.players.every(p=>p.status!=='playing'))result=await settleBlackjackRoom(client,req.params.id);
    await client.query('COMMIT');
    res.json({room:publicRoom(result.room,result.players,req.player.telegram_id)});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/blackjack/rooms/:id/action',requireUser,async(req,res,next)=>{
  const action=req.body?.action;
  if(!['hit','stand','double'].includes(action))return res.status(400).json({error:'Неизвестное действие.'});
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    let result=await getRoom(req.params.id,client,true);
    if(result.room.status!=='playing'){await client.query('ROLLBACK');return res.status(409).json({error:'Раунд не идёт.'})}
    const p=result.players.find(x=>String(x.telegram_id)===String(req.player.telegram_id));
    if(!p){await client.query('ROLLBACK');return res.status(403).json({error:'Ты не участник комнаты.'})}
    if(p.status!=='playing'){await client.query('ROLLBACK');return res.status(409).json({error:'Сейчас нельзя сделать ход.'})}
    if(action==='double'){
      if(p.hand.length!==2||p.doubled){await client.query('ROLLBACK');return res.status(400).json({error:'Удвоить можно только на первых двух картах.'})}
      const bal=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
      if(Number(bal.rows[0].balance)<Number(p.bet)){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно кредитов для удвоения.'})}
      await client.query('UPDATE players SET balance=balance-$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,p.bet]);
      p.bet=Number(p.bet)*2;p.doubled=true;p.hand=[...p.hand,drawPlayingCard()];p.status=scoreHand(p.hand)>21?'busted':'stood';
    }else if(action==='hit'){
      p.hand=[...p.hand,drawPlayingCard()];
      if(scoreHand(p.hand)>21)p.status='busted';
    }else p.status='stood';
    await client.query('UPDATE blackjack_room_players SET hand=$3::jsonb,status=$4,bet=$5,doubled=$6 WHERE room_id=$1 AND telegram_id=$2',[req.params.id,req.player.telegram_id,JSON.stringify(p.hand),p.status,p.bet,p.doubled]);
    result=await getRoom(req.params.id,client);
    if(result.players.every(x=>x.status!=='playing'))result=await settleBlackjackRoom(client,req.params.id);
    await client.query('COMMIT');
    res.json({room:publicRoom(result.room,result.players,req.player.telegram_id)});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});

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
