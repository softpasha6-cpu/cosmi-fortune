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
    // This endpoint is the only authenticated route allowed before membership is confirmed.
    if (req.path !== '/api/access/check') {
      const access = await checkRequiredMembership(user.id);
      if (!access.ready) {
        throw Object.assign(new Error('Сначала подпишись на канал Cosmic Fortune и вступи в чат.'), { status: 403, code: 'SUBSCRIPTION_REQUIRED' });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'connected' }); }
  catch { res.status(503).json({ ok: false, database: 'unavailable' }); }
});


const OWNER_TELEGRAM_ID='8522347927';
const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL || '@Cosmic_Fortune';
const REQUIRED_CHAT = process.env.REQUIRED_CHAT || '@CosmisFortunechat';
const BIG_WIN_THRESHOLD = Math.max(1, Number(process.env.BIG_WIN_THRESHOLD || 100000));
const CREDIT_PACKAGES={25:40000,50:75000,100:170000,500:900000,1000:2200000};
const REWARD_PACKAGES={70000:25,100000:50,200000:100,1000000:500,2600000:1000};
async function tg(method,body){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2500);try{const r=await fetch('https://api.telegram.org/bot'+botToken+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw new Error(d.description||'Telegram API error');return d.result}catch(e){if(e.name==='AbortError')throw new Error('Telegram membership check timed out');throw e}finally{clearTimeout(timer)}}
const membershipCache=new Map();
const membershipInflight=new Map();
async function membershipInChat(chatId,userId){
  const key=String(chatId)+':'+String(userId),cached=membershipCache.get(key);
  if(cached&&cached.until>Date.now())return cached.value;
  if(membershipInflight.has(key))return membershipInflight.get(key);
  const pending=(async()=>{try{
    const member=await tg('getChatMember',{chat_id:chatId,user_id:Number(userId)});
    return {member:['creator','administrator','member'].includes(member.status)||(member.status==='restricted'&&member.is_member===true),status:member.status||'unknown'};
  }catch(error){
    console.error('Membership check failed for '+chatId+':',error.message);
    return {member:false,status:'unavailable',error:'Бот не может проверить этот чат. Проверь username и права администратора бота.'};
  }})();membershipInflight.set(key,pending);try{const value=await pending;membershipCache.set(key,{value,until:Date.now()+(value.member?60000:3000)});return value}finally{membershipInflight.delete(key)}
}
async function checkRequiredMembership(userId){
  const [channel,chat]=await Promise.all([membershipInChat(REQUIRED_CHANNEL,userId),membershipInChat(REQUIRED_CHAT,userId)]);
  return {ready:channel.member&&chat.member,channel,chat,links:{channel:'https://t.me/Cosmic_Fortune',chat:'https://t.me/CosmisFortunechat'}};
}
async function notifyUser(userId,text){
  try{await tg('sendMessage',{chat_id:String(userId),text});return true}
  catch(error){console.error('User notification failed for '+userId+':',error.message);return false}
}
app.get('/api/access/check', requireUser, async (req, res) => {
  const access = await checkRequiredMembership(req.player.telegram_id);
  res.json(access);
});
function ownerOnly(req,res){if(String(req.player?.telegram_id)!==OWNER_TELEGRAM_ID){res.status(403).json({error:'Доступ только владельцу.'});return false}return true}
app.post('/api/stars/invoice',requireUser,async(req,res,next)=>{try{const stars=Number(req.body?.stars),credits=CREDIT_PACKAGES[stars];if(!credits)return res.status(400).json({error:'Неизвестный пакет Stars.'});const payload='cfstars:'+crypto.randomUUID();await pool.query('INSERT INTO star_purchases(telegram_id,package_stars,credits,payload) VALUES($1,$2,$3,$4)',[req.player.telegram_id,stars,credits,payload]);const url=await tg('createInvoiceLink',{title:'Cosmic Fortune',description:credits.toLocaleString('en-US')+' virtual credits',payload,provider_token:'',currency:'XTR',prices:[{label:credits.toLocaleString('en-US')+' credits',amount:stars}]});res.json({url,stars,credits})}catch(e){next(e)}});
app.get('/api/stars/purchases',requireUser,async(req,res,next)=>{try{const r=await pool.query('SELECT id,package_stars AS stars,credits,status,created_at,paid_at FROM star_purchases WHERE telegram_id=$1 ORDER BY created_at DESC LIMIT 50',[req.player.telegram_id]);res.json({purchases:r.rows})}catch(e){next(e)}});
app.post('/api/stars/withdrawals',requireUser,async(req,res,next)=>{const credits=Number(req.body?.credits),stars=REWARD_PACKAGES[credits];if(!stars)return res.status(400).json({error:'Выбери доступный вариант.'});const c=await pool.connect();try{await c.query('BEGIN');const p=await c.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);if(!p.rowCount||Number(p.rows[0].balance)<credits){await c.query('ROLLBACK');return res.status(400).json({error:'Недостаточно кредитов.'})}await c.query('UPDATE players SET balance=balance-$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,credits]);const q=await c.query('INSERT INTO withdrawal_requests(telegram_id,credits,reward_stars) VALUES($1,$2,$3) RETURNING id,status,created_at',[req.player.telegram_id,credits,stars]);await c.query('COMMIT');await notifyUser(req.player.telegram_id,'🎁 Cosmic Fortune — заявка принята.\n\n✦ Зарезервировано: '+credits.toLocaleString('ru-RU')+' кредитов\n⭐ Вознаграждение: '+stars+' Stars\n📌 Статус: ожидает проверки владельцем.');res.status(201).json({request:q.rows[0],balance:Number(p.rows[0].balance)-credits,message:'Заявка создана. Кредиты зарезервированы; владелец проверит её и вручную отправит подарок при одобрении.'})}catch(e){await c.query('ROLLBACK').catch(()=>{});next(e)}finally{c.release()}});
app.get('/api/owner/withdrawals',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;try{const r=await pool.query("SELECT w.id,w.telegram_id,w.credits,w.reward_stars AS stars,w.status,w.note,w.created_at,p.username,p.first_name FROM withdrawal_requests w JOIN players p USING(telegram_id) ORDER BY CASE WHEN w.status='pending' THEN 0 ELSE 1 END,w.created_at DESC LIMIT 200");res.json({requests:r.rows})}catch(e){next(e)}});
app.post('/api/owner/withdrawals/:id/review',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;const action=req.body?.action;if(!['paid','rejected'].includes(action))return res.status(400).json({error:'Недопустимое действие.'});const c=await pool.connect();try{await c.query('BEGIN');const q=await c.query('SELECT * FROM withdrawal_requests WHERE id=$1 FOR UPDATE',[req.params.id]);if(!q.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Заявка не найдена.'})}const w=q.rows[0];if(w.status!=='pending'){await c.query('ROLLBACK');return res.status(409).json({error:'Заявка уже обработана.'})}if(action==='rejected')await c.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1',[w.telegram_id,w.credits]);await c.query('UPDATE withdrawal_requests SET status=$2,reviewed_at=NOW(),reviewed_by=$3,note=$4 WHERE id=$1',[w.id,action,req.player.telegram_id,String(req.body?.note||'').slice(0,500)]);await c.query('COMMIT');const restoredBalance=action==='rejected'?(await pool.query('SELECT balance FROM players WHERE telegram_id=$1',[w.telegram_id])).rows[0]?.balance:null;await notifyUser(w.telegram_id,action==='paid'?'✅ Cosmic Fortune — заявка на вывод обработана.\n\n🎁 Вознаграждение отмечено как отправленное.':'↩️ Cosmic Fortune — заявка отклонена.\n\n✦ '+Number(w.credits).toLocaleString('ru-RU')+' кредитов возвращены на баланс.\n💰 Текущий баланс: '+Number(restoredBalance||0).toLocaleString('ru-RU')+' кредитов.');res.json({ok:true,status:action})}catch(e){await c.query('ROLLBACK').catch(()=>{});next(e)}finally{c.release()}});
app.post('/api/owner/payment-webhook/setup',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;try{const url='https://cosmic-fortune-api.onrender.com/api/telegram/webhook',info=await tg('getWebhookInfo',{}),current=info.url||'';if(current&&current!==url&&req.body?.confirmReplace!==true)return res.status(409).json({error:'У бота уже настроен другой webhook. Его замена может отключить прежнюю интеграцию.',existingUrl:current});let secret=(await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='telegram_webhook_secret'")).rows[0]?.setting_value;if(!secret){secret=crypto.randomBytes(32).toString('hex');await pool.query("INSERT INTO app_settings(setting_key,setting_value) VALUES('telegram_webhook_secret',$1) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()",[secret])}await tg('setWebhook',{url,secret_token:secret,allowed_updates:['message','pre_checkout_query']});res.json({ok:true,message:'Webhook Stars подключён.'})}catch(e){next(e)}});
app.post('/api/telegram/webhook',async(req,res)=>{try{const secret=(await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='telegram_webhook_secret'")).rows[0]?.setting_value;if(!secret||req.get('X-Telegram-Bot-Api-Secret-Token')!==secret)return res.sendStatus(401);const u=req.body||{};const message=u.message;if(message?.text&&/^\/start(?:\s|$)/.test(message.text)){const welcomeText='🌌 Добро пожаловать в COSMIC FORTUNE! 💜\n\n🚀 Испытай удачу в космических играх, крути колесо бонусов и участвуй в турнирах!\n\n💎 Возможности приложения:\n⭐ Пополняй виртуальный баланс с помощью Telegram Stars.\n🎁 Получай бонусы и соревнуйся с другими игроками.\n🌟 Заявки на вывод Stars доступны прямо в приложении согласно его условиям.\n\n🪐 Твоя вселенная. Твои правила. Твоя удача!\n\n⚠️ Игровой баланс виртуальный.';const appUrl='https://softpasha6-cpu.github.io/cosmi-fortune/';const reply_markup={inline_keyboard:[[{text:'🚀 ОТКРЫТЬ ПРИЛОЖЕНИЕ',web_app:{url:appUrl}}],[{text:'📣 Подписаться на канал',url:'https://t.me/Cosmic_Fortune'}],[{text:'💬 Вступить в чат',url:'https://t.me/CosmisFortunechat'}]]};const bannerUrl=process.env.WELCOME_BANNER_URL||'https://raw.githubusercontent.com/softpasha6-cpu/cosmi-fortune/main/2BC08113-29F3-41F0-BB11-9BC5074A9A7B.png';await tg('sendPhoto',{chat_id:message.chat.id,photo:bannerUrl,caption:welcomeText,reply_markup});return res.json({ok:true})}if(u.pre_checkout_query){const q=u.pre_checkout_query;const valid=q.currency==='XTR'&&Number.isInteger(q.total_amount)&&(await pool.query("SELECT 1 FROM star_purchases WHERE payload=$1 AND telegram_id=$2 AND package_stars=$3 AND status='pending'",[q.invoice_payload,String(q.from.id),q.total_amount])).rowCount===1;await tg('answerPreCheckoutQuery',{pre_checkout_query_id:q.id,ok:!!valid,...(!valid?{error_message:'Пакет недействителен. Открой приложение и попробуй снова.'}:{})})}const p=u.message?.successful_payment;if(p){const uid=String(u.message.from.id);if(p.currency!=='XTR')throw new Error('Unexpected payment currency');const c=await pool.connect();let paymentNotice=null;try{await c.query('BEGIN');const q=await c.query('SELECT * FROM star_purchases WHERE payload=$1 AND telegram_id=$2 FOR UPDATE',[p.invoice_payload,uid]);if(!q.rowCount)throw new Error('Payment payload not found');const purchase=q.rows[0];if(Number(p.total_amount)!==Number(purchase.package_stars))throw new Error('Payment amount mismatch');if(purchase.status!=='paid'){const dup=await c.query('SELECT id FROM star_purchases WHERE telegram_payment_charge_id=$1',[p.telegram_payment_charge_id]);if(dup.rowCount)throw new Error('Duplicate charge');const balanceUpdate=await c.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1 RETURNING balance',[uid,purchase.credits]);paymentNotice={stars:Number(purchase.package_stars),credits:Number(purchase.credits),balance:Number(balanceUpdate.rows[0].balance)};await c.query("UPDATE star_purchases SET status='paid',telegram_payment_charge_id=$2,provider_payment_charge_id=$3,paid_at=NOW() WHERE id=$1",[purchase.id,p.telegram_payment_charge_id,p.provider_payment_charge_id||null])}else if(purchase.telegram_payment_charge_id!==p.telegram_payment_charge_id)throw new Error('Paid charge mismatch');await c.query('COMMIT')}catch(e){await c.query('ROLLBACK').catch(()=>{});throw e}finally{c.release()}if(paymentNotice){try{await tg('sendMessage',{chat_id:uid,text:'✅ Cosmic Fortune — оплата подтверждена!\n\n⭐ Оплачено: '+paymentNotice.stars+' Telegram Stars\n✦ Начислено: '+paymentNotice.credits.toLocaleString('ru-RU')+' кредитов\n💰 Текущий баланс: '+paymentNotice.balance.toLocaleString('ru-RU')+' кредитов'});}catch(notifyError){console.error('Payment notification failed:',notifyError.message)}}}res.json({ok:true})}catch(e){console.error('Stars webhook error:',e.message);res.status(500).json({ok:false})}});
app.get('/api/owner/stars-status',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;try{const [p,w]=await Promise.all([pool.query("SELECT COUNT(*)::int AS count,COALESCE(SUM(package_stars),0)::bigint AS stars,COALESCE(SUM(credits),0)::bigint AS credits FROM star_purchases WHERE status='paid'"),pool.query("SELECT COUNT(*)::int AS pending FROM withdrawal_requests WHERE status='pending'")]);res.json({sales:p.rows[0],pendingWithdrawals:w.rows[0].pending,withdrawalUrl:'https://fragment.com/'})}catch(e){next(e)}});
app.get('/api/me', requireUser, async (req, res) => {
  const history = await pool.query(
    'SELECT id, game, bet, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 ORDER BY created_at DESC',
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
    const dice = [randInt(6) + 1, randInt(6) + 1];
    const roll = dice[0] + dice[1];
    const won = roll >= 8;
    return { payout: won ? bet * 2 : 0, outcome: { dice, roll, won, message: won ? 'Сумма 8–12: выигрыш!' : 'Сумма 2–7: ставка проиграна' } };
  }
  if (game === 'roulette') {
    const numberBet = Number.isInteger(choice) && choice >= 0 && choice <= 36;
    const colorBet = choice === 'red' || choice === 'black' || choice === 'green';
    if (!numberBet && !colorBet) throw Object.assign(new Error('Выбери красное, чёрное, зелёное или номер от 0 до 36.'), { status: 400 });
    const number = randInt(37);
    const color = number === 0 ? 'green' : RED_NUMBERS.has(number) ? 'red' : 'black';
    const won = numberBet ? number === choice : color === choice;
    const multiplier = numberBet ? 36 : choice === 'green' ? 36 : 2;
    return { payout: won ? bet * multiplier : 0, outcome: { number, color, choice, betType: numberBet ? 'number' : 'color', multiplier, won, message: won ? (numberBet ? 'Точное попадание в номер! Выплата 36×.' : 'Поздравляем! Цвет совпал.') : 'В этот раз не повезло.' } };
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

const DAILY_REWARDS = [500, 1000, 1500, 2500, 4000, 6000, 10000, 25000];
app.get('/api/daily-reward/status', requireUser, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT claimed_at,streak_day,reward FROM daily_reward_claims WHERE telegram_id=$1',[req.player.telegram_id]);
    if (!result.rowCount) return res.json({available:true,streakDay:1,nextAvailableAt:null,lastReward:null});
    const row=result.rows[0], claimedAt=new Date(row.claimed_at), elapsed=Date.now()-claimedAt.getTime();
    const available=elapsed>=24*60*60*1000;
    const streakDay=elapsed>48*60*60*1000?1:(available?Math.min(8,Number(row.streak_day)%8+1):Number(row.streak_day));
    const nextAvailableAt=new Date(claimedAt.getTime()+24*60*60*1000);
    return res.json({available,streakDay,nextAvailableAt:nextAvailableAt.toISOString(),lastReward:Number(row.reward),lastClaimedAt:claimedAt.toISOString(),claimedDay:Number(row.streak_day)});
  } catch(error) { next(error); }
});
app.post('/api/daily-reward/claim', requireUser, async (req, res, next) => {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const player=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
    if(!player.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Аккаунт не найден.'});}
    const prior=await client.query('SELECT claimed_at,streak_day FROM daily_reward_claims WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
    let streakDay=1;
    if(prior.rowCount){
      const elapsed=Date.now()-new Date(prior.rows[0].claimed_at).getTime();
      if(elapsed<24*60*60*1000){
        const nextAt=new Date(new Date(prior.rows[0].claimed_at).getTime()+24*60*60*1000);
        await client.query('ROLLBACK');
        return res.status(409).json({error:'Ежедневную награду можно забрать через 24 часа после прошлого получения.',nextAvailableAt:nextAt.toISOString()});
      }
      streakDay=elapsed>48*60*60*1000?1:Math.min(8,Number(prior.rows[0].streak_day)%8+1);
    }
    const reward=DAILY_REWARDS[streakDay-1], balance=Number(player.rows[0].balance)+reward;
    await client.query('UPDATE players SET balance=$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,balance]);
    await client.query('INSERT INTO daily_reward_claims (telegram_id,claimed_at,streak_day,reward) VALUES ($1,NOW(),$2,$3) ON CONFLICT (telegram_id) DO UPDATE SET claimed_at=NOW(),streak_day=EXCLUDED.streak_day,reward=EXCLUDED.reward',[req.player.telegram_id,streakDay,reward]);
    await client.query('COMMIT');
    res.json({reward,balance,streakDay,nextAvailableAt:new Date(Date.now()+24*60*60*1000).toISOString()});
  } catch(error) { await client.query('ROLLBACK').catch(()=>{}); next(error); }
  finally { client.release(); }
});

app.get('/api/bonus-wheel/status', requireUser, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT claimed_at,reward FROM bonus_wheel_cooldowns WHERE telegram_id=$1',[req.player.telegram_id]);
    if (!result.rowCount) return res.json({available:true,nextAvailableAt:null});
    const next = new Date(new Date(result.rows[0].claimed_at).getTime()+24*60*60*1000);
    return res.json({available:Date.now()>=next.getTime(),nextAvailableAt:next.toISOString(),lastReward:Number(result.rows[0].reward)});
  } catch(error) { next(error); }
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
    const claimed = await client.query('SELECT claimed_at FROM bonus_wheel_cooldowns WHERE telegram_id=$1 FOR UPDATE', [req.player.telegram_id]);
    if (claimed.rowCount && Date.now() - new Date(claimed.rows[0].claimed_at).getTime() < 24*60*60*1000) {
      const nextAt = new Date(new Date(claimed.rows[0].claimed_at).getTime()+24*60*60*1000);
      await client.query('ROLLBACK');
      return res.status(409).json({error:'Бонусная рулетка снова будет доступна через 24 часа.',nextAvailableAt:nextAt.toISOString()});
    }
    const roll=randInt(1000000);
    let reward=1000, label='+1 000 виртуальных кредитов';
    if(roll<10){reward=1000000;label='ДЖЕКПОТ: +1 000 000 виртуальных кредитов ✦ (не реальные рубли)';}
    else if(roll<1000){reward=250000;label='+250 000 виртуальных кредитов ✦ (не реальные рубли)';}
    else if(roll<1100){reward=50000;label='500 ₽ в игровом эквиваленте · +50 000 виртуальных кредитов';}
    else if(roll<50100){reward=25000;label='+25 000 виртуальных кредитов';}
    else if(roll<150100){reward=10000;label='+10 000 виртуальных кредитов';}
    else if(roll<300100){reward=5000;label='+5 000 виртуальных кредитов';}
    else if(roll<550100){reward=2000;label='+2 000 виртуальных кредитов';}
    else {reward=1000;label='+1 000 виртуальных кредитов';}
    const balanceAfter=Number(locked.rows[0].balance)+reward;
    await client.query('UPDATE players SET balance=$2, updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,balanceAfter]);
    const inserted=await client.query(
      "INSERT INTO game_transactions (telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES ($1,'bonus_wheel',0,$2,$3,$4::jsonb,$5) RETURNING id,created_at",
      [req.player.telegram_id,reward,balanceAfter,JSON.stringify({reward,label,roll:roll+1,message:label}),requestId]
    );
    await client.query('INSERT INTO bonus_wheel_claims (telegram_id,claim_date,reward) VALUES ($1,CURRENT_DATE,$2) ON CONFLICT (telegram_id,claim_date) DO UPDATE SET reward=EXCLUDED.reward',[req.player.telegram_id,reward]);
    await client.query('INSERT INTO bonus_wheel_cooldowns (telegram_id,claimed_at,reward) VALUES ($1,NOW(),$2) ON CONFLICT (telegram_id) DO UPDATE SET claimed_at=NOW(),reward=EXCLUDED.reward',[req.player.telegram_id,reward]);
    await client.query('COMMIT');
    if(reward>=BIG_WIN_THRESHOLD){await notifyUser(req.player.telegram_id,'🎉 КРУПНЫЙ ВЫИГРЫШ в бонусной рулетке Cosmic Fortune!\n\n🏆 Приз: '+reward.toLocaleString('ru-RU')+' виртуальных кредитов ✦\n💰 Текущий баланс: '+balanceAfter.toLocaleString('ru-RU')+' виртуальных кредитов.\n\nℹ️ Это игровые кредиты, не реальные рубли и не денежная выплата.');}
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
    if(!round.replayed && Number(round.payout)>=BIG_WIN_THRESHOLD){
      const gameNames={slots:'космические слоты',dice:'кости',roulette:'рулетку',blackjack:'блэкджек'};
      await notifyUser(req.player.telegram_id,'🎉 КРУПНЫЙ ВЫИГРЫШ в Cosmic Fortune!\n\n🎮 Игра: '+(gameNames[game]||game)+'\n✦ Выплата: '+Number(round.payout).toLocaleString('ru-RU')+' кредитов\n💰 Текущий баланс: '+balanceAfter.toLocaleString('ru-RU')+' кредитов');
    }
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


const minerMultiplier = (size, mines, safePicks) => {
  let p=1;
  for(let i=0;i<safePicks;i++) p *= (size-mines-i)/(size-i);
  return safePicks===0?1:Number((0.97/Math.max(p,0.0001)).toFixed(2));
};
const pickUnique = (total,count) => { const a=[]; while(a.length<count){const n=randInt(total);if(!a.includes(n))a.push(n)} return a; };
app.post('/api/miner/start',requireUser,async(req,res,next)=>{
 const bet=Number(req.body?.bet),size=Number(req.body?.size),mines=Number(req.body?.mines);
 if(!Number.isSafeInteger(bet)||bet<1||bet>MAX_BET)return res.status(400).json({error:'Ставка от 1 до 100 000.'});
 if(![3,5,6].includes(size)||![3,5,7,10].includes(mines)||mines>=size*size)return res.status(400).json({error:'Некорректное поле или количество мин.'});
 const client=await pool.connect();try{await client.query('BEGIN');
 const player=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
 if(!player.rowCount||Number(player.rows[0].balance)<bet){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно виртуальных кредитов.'})}
 const active=await client.query("SELECT id FROM miner_rounds WHERE telegram_id=$1 AND status='active' FOR UPDATE",[req.player.telegram_id]);
 if(active.rowCount){await client.query('ROLLBACK');return res.status(409).json({error:'Сначала заверши предыдущий раунд Минера.'})}
 const id=crypto.randomUUID(), minesAt=pickUnique(size*size,mines);
 const updated=Number(player.rows[0].balance)-bet;
 await client.query('UPDATE players SET balance=$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,updated]);
 await client.query('INSERT INTO miner_rounds(id,telegram_id,bet,board_size,mine_count,mines) VALUES($1,$2,$3,$4,$5,$6::jsonb)',[id,req.player.telegram_id,bet,size,mines,JSON.stringify(minesAt)]);
 await client.query('COMMIT');
 res.json({round:{id,size,mines,picked:[],multiplier:1},balance:updated});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/miner/pick',requireUser,async(req,res,next)=>{
 const {roundId}=req.body||{},index=Number(req.body?.index);if(typeof roundId!=='string'||!Number.isInteger(index)||index<0||index>35)return res.status(400).json({error:'Некорректная клетка.'});
 const client=await pool.connect();try{await client.query('BEGIN');
 const q=await client.query("SELECT * FROM miner_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE",[roundId,req.player.telegram_id]);
 if(!q.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Раунд не найден.'})}
 const r=q.rows[0],picked=r.picked||[],mines=r.mines||[];
 if(r.status!=='active'){await client.query('ROLLBACK');return res.status(409).json({error:'Раунд уже завершён.'})}
 if(index>=Number(r.board_size)**2||picked.includes(index)){await client.query('ROLLBACK');return res.status(400).json({error:'Клетка уже открыта или вне поля.'})}
 picked.push(index);const hit=mines.includes(index);
 if(hit){await client.query("UPDATE miner_rounds SET picked=$2::jsonb,status='lost',finished_at=NOW() WHERE id=$1",[roundId,JSON.stringify(picked)]);const b=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);await client.query('COMMIT');return res.json({hit,finished:true,round:{id:roundId,picked,multiplier:Number(r.multiplier),mines},balance:Number(b.rows[0].balance)})}
 const multiplier=minerMultiplier(Number(r.board_size)**2,Number(r.mine_count),picked.length);
 await client.query("UPDATE miner_rounds SET picked=$2::jsonb,multiplier=$3 WHERE id=$1",[roundId,JSON.stringify(picked),multiplier]);
 const b=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);await client.query('COMMIT');
 res.json({hit:false,finished:false,round:{id:roundId,picked,multiplier},balance:Number(b.rows[0].balance)});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/miner/cashout',requireUser,async(req,res,next)=>{
 const {roundId}=req.body||{};const client=await pool.connect();try{await client.query('BEGIN');
 const q=await client.query("SELECT * FROM miner_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE",[roundId,req.player.telegram_id]);
 if(!q.rowCount||q.rows[0].status!=='active'){await client.query('ROLLBACK');return res.status(409).json({error:'Нет активного раунда для выплаты.'})}
 const r=q.rows[0],payout=Math.floor(Number(r.bet)*Number(r.multiplier));
 const b=await client.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1 RETURNING balance',[req.player.telegram_id,payout]);
 await client.query("UPDATE miner_rounds SET status='cashed_out',finished_at=NOW() WHERE id=$1",[roundId]);
 await client.query("INSERT INTO game_transactions(telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES($1,'miner',$2,$3,$4,$5::jsonb,$6)",[req.player.telegram_id,r.bet,payout,Number(b.rows[0].balance),JSON.stringify({message:'Минер: выигрыш забран',multiplier:Number(r.multiplier),picked:r.picked}),crypto.randomUUID()]);
 await client.query('COMMIT');res.json({payout,balance:Number(b.rows[0].balance),multiplier:Number(r.multiplier)});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/luckyjet/start',requireUser,async(req,res,next)=>{
 const bet=Number(req.body?.bet),autoAt=req.body?.autoAt==null?null:Number(req.body.autoAt);
 if(!Number.isSafeInteger(bet)||bet<1||bet>MAX_BET)return res.status(400).json({error:'Ставка от 1 до 100 000.'});
 if(autoAt!==null&&(!Number.isFinite(autoAt)||autoAt<1.1||autoAt>100))return res.status(400).json({error:'Авто-вывод должен быть от 1.1× до 100×.'});
 const client=await pool.connect();try{await client.query('BEGIN');const p=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
 if(!p.rowCount||Number(p.rows[0].balance)<bet){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно виртуальных кредитов.'})}
 const active=await client.query("SELECT id FROM luckyjet_rounds WHERE telegram_id=$1 AND status='active' FOR UPDATE",[req.player.telegram_id]);
 if(active.rowCount){await client.query('ROLLBACK');return res.status(409).json({error:'Сначала заверши предыдущий Lucky Jet.'})}
 const id=crypto.randomUUID(),roll=Math.max(1.01,Math.min(50,Number((1/(1-Math.random()*0.98)).toFixed(2))));
 const balance=Number(p.rows[0].balance)-bet;
 await client.query('UPDATE players SET balance=$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,balance]);
 await client.query('INSERT INTO luckyjet_rounds(id,telegram_id,bet,crash_at,auto_at) VALUES($1,$2,$3,$4,$5)',[id,req.player.telegram_id,bet,roll,autoAt]);
 await client.query('COMMIT');res.json({round:{id,startedAt:Date.now(),autoAt},balance});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/luckyjet/status',requireUser,async(req,res,next)=>{
 const {roundId}=req.body||{};const client=await pool.connect();try{await client.query('BEGIN');
 const q=await client.query("SELECT * FROM luckyjet_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE",[roundId,req.player.telegram_id]);
 if(!q.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Раунд не найден.'})}
 const r=q.rows[0];if(r.status!=='active'){const b=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);await client.query('COMMIT');return res.json({crashed:r.status==='crashed',multiplier:r.status==='cashed_out'?Number(r.payout)/Math.max(1,Number(r.bet)):Number(r.crash_at),crashAt:Number(r.crash_at),balance:Number(b.rows[0].balance)})}
 const elapsed=(Date.now()-new Date(r.started_at).getTime())/1000,current=Number((1+Math.pow(Math.max(0,elapsed),1.35)*0.23).toFixed(2)),crashed=current>=Number(r.crash_at);
 if(crashed)await client.query("UPDATE luckyjet_rounds SET status='crashed',finished_at=NOW() WHERE id=$1",[roundId]);
 const b=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);await client.query('COMMIT');
 res.json({crashed,multiplier:Math.min(current,Number(r.crash_at)),crashAt:crashed?Number(r.crash_at):null,balance:Number(b.rows[0].balance)});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/luckyjet/cashout',requireUser,async(req,res,next)=>{
 const {roundId}=req.body||{};const client=await pool.connect();try{await client.query('BEGIN');
 const q=await client.query("SELECT * FROM luckyjet_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE",[roundId,req.player.telegram_id]);
 if(!q.rowCount||q.rows[0].status!=='active'){await client.query('ROLLBACK');return res.status(409).json({error:'Раунд уже завершён.'})}
 const r=q.rows[0],elapsed=(Date.now()-new Date(r.started_at).getTime())/1000;
 const current=Math.min(Number(r.crash_at),Number((1+Math.pow(Math.max(0,elapsed),1.35)*0.23).toFixed(2)));
 const requested=Number(req.body?.multiplier)||current;
 if(current>=Number(r.crash_at)||requested>=Number(r.crash_at)){await client.query("UPDATE luckyjet_rounds SET status='crashed',finished_at=NOW() WHERE id=$1",[roundId]);await client.query('COMMIT');return res.status(409).json({error:'Ракета уже остановилась. Ставка проиграна.',crashAt:Number(r.crash_at)})}
 const multiplier=Math.min(current,requested),payout=Math.floor(Number(r.bet)*multiplier);
 const b=await client.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1 RETURNING balance',[req.player.telegram_id,payout]);
 await client.query("UPDATE luckyjet_rounds SET status='cashed_out',payout=$2,finished_at=NOW() WHERE id=$1",[roundId,payout]);
 await client.query("INSERT INTO game_transactions(telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES($1,'luckyjet',$2,$3,$4,$5::jsonb,$6)",[req.player.telegram_id,r.bet,payout,Number(b.rows[0].balance),JSON.stringify({message:'Lucky Jet: выигрыш забран',multiplier}),crypto.randomUUID()]);
 await client.query('COMMIT');res.json({payout,balance:Number(b.rows[0].balance),multiplier});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});
app.post('/api/luckyjet/crash',requireUser,async(req,res,next)=>{
 const {roundId}=req.body||{};const client=await pool.connect();try{await client.query('BEGIN');
 const q=await client.query("SELECT * FROM luckyjet_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE",[roundId,req.player.telegram_id]);
 if(!q.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Раунд не найден.'})}
 const r=q.rows[0];if(r.status==='active')await client.query("UPDATE luckyjet_rounds SET status='crashed',finished_at=NOW() WHERE id=$1",[roundId]);
 const b=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);await client.query('COMMIT');res.json({crashAt:Number(r.crash_at),balance:Number(b.rows[0].balance)});
 }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}
});


app.use((err, _req, res, _next) => {
  const status = Number(err.status) || (err.message === 'Origin not allowed' ? 403 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Внутренняя ошибка сервера' : err.message, ...(err.code ? { code: err.code } : {}) });
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
