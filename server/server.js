import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { handleAdminUpdate } from './admin.js';

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
    // Membership is handled in the Telegram bot; the Mini App only requires valid Telegram initData.
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
async function tg(method,body,timeoutMs=2500){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const r=await fetch('https://api.telegram.org/bot'+botToken+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw new Error(d.description||'Telegram API error');return d.result}catch(e){if(e.name==='AbortError')throw new Error('Telegram membership check timed out');throw e}finally{clearTimeout(timer)}}
const membershipCache=new Map();
const membershipInflight=new Map();
async function membershipInChat(chatId,userId,forceRefresh=false){
  const key=String(chatId)+':'+String(userId),cached=membershipCache.get(key);
  if(!forceRefresh&&cached&&cached.until>Date.now())return cached.value;
  if(!forceRefresh&&membershipInflight.has(key))return membershipInflight.get(key);
  const pending=(async()=>{try{
    const member=await tg('getChatMember',{chat_id:chatId,user_id:Number(userId)},1000);
    return {member:['creator','administrator','member'].includes(member.status)||(member.status==='restricted'&&member.is_member===true),status:member.status||'unknown'};
  }catch(error){
    console.error('Membership check failed for '+chatId+':',error.message);
    return {member:false,status:'unavailable',error:'Telegram API: '+String(error.message||'не удалось проверить участника')+'. Убедись, что бот является администратором канала и группы.'};
  }})();if(!forceRefresh)membershipInflight.set(key,pending);try{const value=await pending;membershipCache.set(key,{value,until:Date.now()+(value.member?60000:1000)});return value}finally{if(membershipInflight.get(key)===pending)membershipInflight.delete(key)}
}
async function checkRequiredMembership(userId,forceRefresh=false){
  const [channel,chat]=await Promise.all([membershipInChat(REQUIRED_CHANNEL,userId,forceRefresh),membershipInChat(REQUIRED_CHAT,userId,forceRefresh)]);
  return {ready:channel.member&&chat.member,channel,chat,links:{channel:'https://t.me/Cosmic_Fortune',chat:'https://t.me/CosmisFortunechat'}};
}
async function notifyUser(userId,text){
  try{await tg('sendMessage',{chat_id:String(userId),text});return true}
  catch(error){console.error('User notification failed for '+userId+':',error.message);return false}
}
async function notifyOwner(text){
  try{
    const q=await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='owner_notifications_enabled'");
    if(q.rows[0]?.setting_value==='false')return false;
    await tg('sendMessage',{chat_id:OWNER_TELEGRAM_ID,text,disable_web_page_preview:true});
    return true;
  }catch(error){console.error('Owner notification failed:',error.message);return false}
}
app.get('/api/access/check', requireUser, async (req, res) => {
  // The explicit button action bypasses cached negative results and asks Telegram directly.
  const forceRefresh = req.query.refresh === '1';
  const access = await checkRequiredMembership(req.player.telegram_id,forceRefresh);
  res.set('Cache-Control','no-store, max-age=0');
  res.json({...access,checkedAt:Date.now()});
});
function ownerOnly(req,res){if(String(req.player?.telegram_id)!==OWNER_TELEGRAM_ID){res.status(403).json({error:'Доступ только владельцу.'});return false}return true}
app.post('/api/stars/invoice',requireUser,async(req,res,next)=>{try{const stars=Number(req.body?.stars),credits=CREDIT_PACKAGES[stars];if(!credits)return res.status(400).json({error:'Неизвестный пакет Stars.'});const payload='cfstars:'+crypto.randomUUID();await pool.query('INSERT INTO star_purchases(telegram_id,package_stars,credits,payload) VALUES($1,$2,$3,$4)',[req.player.telegram_id,stars,credits,payload]);const url=await tg('createInvoiceLink',{title:'Cosmic Fortune',description:credits.toLocaleString('en-US')+' virtual credits',payload,provider_token:'',currency:'XTR',prices:[{label:credits.toLocaleString('en-US')+' credits',amount:stars}]});res.json({url,stars,credits})}catch(e){next(e)}});
app.get('/api/stars/purchases',requireUser,async(req,res,next)=>{try{const r=await pool.query('SELECT id,package_stars AS stars,credits,status,created_at,paid_at FROM star_purchases WHERE telegram_id=$1 ORDER BY created_at DESC LIMIT 50',[req.player.telegram_id]);res.json({purchases:r.rows})}catch(e){next(e)}});
app.post('/api/stars/withdrawals',requireUser,async(req,res,next)=>{const credits=Number(req.body?.credits),stars=REWARD_PACKAGES[credits];if(!stars)return res.status(400).json({error:'Выбери доступный вариант.'});const c=await pool.connect();try{await c.query('BEGIN');const p=await c.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);if(!p.rowCount||Number(p.rows[0].balance)<credits){await c.query('ROLLBACK');return res.status(400).json({error:'Недостаточно кредитов.'})}await c.query('UPDATE players SET balance=balance-$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,credits]);const q=await c.query('INSERT INTO withdrawal_requests(telegram_id,credits,reward_stars) VALUES($1,$2,$3) RETURNING id,status,created_at',[req.player.telegram_id,credits,stars]);await c.query('COMMIT');await notifyUser(req.player.telegram_id,'🎁 Cosmic Fortune — заявка принята.\n\n✦ Зарезервировано: '+credits.toLocaleString('ru-RU')+' кредитов\n⭐ Вознаграждение: '+stars+' Stars\n📌 Статус: ожидает проверки владельцем.');void notifyOwner('🎁 НОВАЯ ЗАЯВКА НА ВЫВОД\n\nИгрок: '+(req.player.username?'@'+req.player.username:req.player.telegram_id)+'\nTelegram ID: '+req.player.telegram_id+'\nКредитов: '+credits.toLocaleString('ru-RU')+'\nВознаграждение: '+stars+' Stars\nID заявки: '+q.rows[0].id+'\n\nОткрой бота и нажми /admin → Выплаты.');res.status(201).json({request:q.rows[0],balance:Number(p.rows[0].balance)-credits,message:'Заявка создана. Кредиты зарезервированы; владелец проверит её и вручную отправит подарок при одобрении.'})}catch(e){await c.query('ROLLBACK').catch(()=>{});next(e)}finally{c.release()}});
app.get('/api/owner/withdrawals',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;try{const r=await pool.query("SELECT w.id,w.telegram_id,w.credits,w.reward_stars AS stars,w.status,w.note,w.created_at,p.username,p.first_name FROM withdrawal_requests w JOIN players p USING(telegram_id) ORDER BY CASE WHEN w.status='pending' THEN 0 ELSE 1 END,w.created_at DESC LIMIT 200");res.json({requests:r.rows})}catch(e){next(e)}});
app.post('/api/owner/withdrawals/:id/review',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;const action=req.body?.action;if(!['paid','rejected'].includes(action))return res.status(400).json({error:'Недопустимое действие.'});const c=await pool.connect();try{await c.query('BEGIN');const q=await c.query('SELECT * FROM withdrawal_requests WHERE id=$1 FOR UPDATE',[req.params.id]);if(!q.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Заявка не найдена.'})}const w=q.rows[0];if(w.status!=='pending'){await c.query('ROLLBACK');return res.status(409).json({error:'Заявка уже обработана.'})}if(action==='rejected')await c.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1',[w.telegram_id,w.credits]);await c.query('UPDATE withdrawal_requests SET status=$2,reviewed_at=NOW(),reviewed_by=$3,note=$4 WHERE id=$1',[w.id,action,req.player.telegram_id,String(req.body?.note||'').slice(0,500)]);await c.query('COMMIT');const restoredBalance=action==='rejected'?(await pool.query('SELECT balance FROM players WHERE telegram_id=$1',[w.telegram_id])).rows[0]?.balance:null;await notifyUser(w.telegram_id,action==='paid'?'✅ Cosmic Fortune — заявка на вывод обработана.\n\n🎁 Вознаграждение отмечено как отправленное.':'↩️ Cosmic Fortune — заявка отклонена.\n\n✦ '+Number(w.credits).toLocaleString('ru-RU')+' кредитов возвращены на баланс.\n💰 Текущий баланс: '+Number(restoredBalance||0).toLocaleString('ru-RU')+' кредитов.');res.json({ok:true,status:action})}catch(e){await c.query('ROLLBACK').catch(()=>{});next(e)}finally{c.release()}});
app.post('/api/owner/payment-webhook/setup',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;try{const url='https://cosmic-fortune-api.onrender.com/api/telegram/webhook',info=await tg('getWebhookInfo',{}),current=info.url||'';if(current&&current!==url&&req.body?.confirmReplace!==true)return res.status(409).json({error:'У бота уже настроен другой webhook. Его замена может отключить прежнюю интеграцию.',existingUrl:current});let secret=(await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='telegram_webhook_secret'")).rows[0]?.setting_value;if(!secret){secret=crypto.randomBytes(32).toString('hex');await pool.query("INSERT INTO app_settings(setting_key,setting_value) VALUES('telegram_webhook_secret',$1) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()",[secret])}await tg('setWebhook',{url,secret_token:secret,allowed_updates:['message','pre_checkout_query','callback_query']});res.json({ok:true,message:'Webhook Stars подключён.'})}catch(e){next(e)}});
app.post('/api/telegram/webhook',async(req,res)=>{try{const secret=(await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='telegram_webhook_secret'")).rows[0]?.setting_value;if(!secret||req.get('X-Telegram-Bot-Api-Secret-Token')!==secret)return res.sendStatus(401);const u=req.body||{};const message=u.message;
if(u.callback_query?.data&&String(u.callback_query.data).startsWith('admin:')){try{await handleAdminUpdate(u,{pool,tg,ownerId:OWNER_TELEGRAM_ID,notifyUser})}catch(adminError){console.error('Admin callback error:',adminError.message);await tg('sendMessage',{chat_id:u.callback_query.message?.chat?.id||u.callback_query.from.id,text:'⚠️ Не удалось выполнить действие админки. Проверь логи сервера.'}).catch(()=>{})}return res.json({ok:true})}
if(message?.from?.id){await pool.query("INSERT INTO bot_users(telegram_id,username,first_name) VALUES($1,$2,$3) ON CONFLICT(telegram_id) DO UPDATE SET username=EXCLUDED.username,first_name=EXCLUDED.first_name,updated_at=NOW()",[String(message.from.id),message.from.username||null,message.from.first_name||'']);}
if(message?.text&&(/^\/admin(?:@CosmicFortune_bot)?(?:\s|$)/i.test(message.text)||/^\/user(?:@CosmicFortune_bot)?\s+(.+)/i.test(message.text))){
  try{await handleAdminUpdate(u,{pool,tg,ownerId:OWNER_TELEGRAM_ID,notifyUser})}
  catch(adminError){console.error('Admin command error:',adminError.message);await tg('sendMessage',{chat_id:message.chat.id,text:'⚠️ Не удалось выполнить действие админки. Проверь логи сервера.'}).catch(()=>{})}
  return res.json({ok:true})
}if(message?.text&&/^\/stats(?:@CosmicFortune_bot)?(?:\s|$)/i.test(message.text)){if(String(message.from?.id)!==OWNER_TELEGRAM_ID){await tg('sendMessage',{chat_id:message.chat.id,text:'⛔ Статистика доступна только владельцу бота.'});return res.json({ok:true})}const [total,today,appUsers,active,games]=await Promise.all([pool.query("SELECT COUNT(*)::int AS n FROM (SELECT telegram_id FROM bot_users UNION SELECT telegram_id FROM players) u"),pool.query("SELECT COUNT(*)::int AS n FROM bot_users WHERE created_at >= date_trunc('day', NOW())"),pool.query("SELECT COUNT(*)::int AS n FROM players"),pool.query("SELECT COUNT(*)::int AS n FROM players WHERE updated_at >= NOW()-INTERVAL '7 days'"),pool.query("SELECT COUNT(*)::bigint AS n FROM game_transactions")]);const fmt=n=>Number(n||0).toLocaleString('ru-RU');const report='📊 Cosmic Fortune — статистика\n\n👥 Всего пользователей: '+fmt(total.rows[0].n)+'\n🆕 Запустили бота сегодня: '+fmt(today.rows[0].n)+'\n🎮 Пользователи приложения: '+fmt(appUsers.rows[0].n)+'\n⚡ Активны в приложении за 7 дней: '+fmt(active.rows[0].n)+'\n🎲 Всего игровых раундов: '+fmt(games.rows[0].n)+'\n\nℹ️ Считаются уникальные Telegram ID; статистика бота собирается с момента обновления.';await tg('sendMessage',{chat_id:message.chat.id,text:report});return res.json({ok:true})}if(message?.text&&/^\/start(?:\s|$)/.test(message.text)){const welcomeText='🌌 Добро пожаловать в COSMIC FORTUNE! 💜\n\n🚀 Испытай удачу в космических играх, крути колесо бонусов и участвуй в турнирах!\n\n💎 Возможности приложения:\n⭐ Пополняй виртуальный баланс с помощью Telegram Stars.\n🎁 Получай бонусы и соревнуйся с другими игроками.\n🌟 Заявки на вывод Stars доступны прямо в приложении согласно его условиям.\n\n🪐 Твоя вселенная. Твои правила. Твоя удача!\n\n⚠️ Игровой баланс виртуальный.';const appUrl='https://softpasha6-cpu.github.io/cosmi-fortune/';const membership=await checkRequiredMembership(message.from.id,true);const reply_markup=membership.ready?{inline_keyboard:[[{text:'🚀 ОТКРЫТЬ ПРИЛОЖЕНИЕ',web_app:{url:appUrl}}],[{text:'📣 Канал Cosmic Fortune',url:'https://t.me/Cosmic_Fortune'}],[{text:'💬 Чат Cosmic Fortune',url:'https://t.me/CosmisFortunechat'}]]}:{inline_keyboard:[[{text:'📣 Подписаться на канал',url:'https://t.me/Cosmic_Fortune'}],[{text:'💬 Вступить в чат',url:'https://t.me/CosmisFortunechat'}],[{text:'✅ Проверить подписку',callback_data:'check_subscription'}]]};const caption=membership.ready?welcomeText:welcomeText+'\n\n🔒 Чтобы открыть приложение, подпишись на канал и вступи в чат, затем нажми «Проверить подписку».';const bannerUrl=process.env.WELCOME_BANNER_URL||'https://raw.githubusercontent.com/softpasha6-cpu/cosmi-fortune/main/2BC08113-29F3-41F0-BB11-9BC5074A9A7B.png';await tg('sendPhoto',{chat_id:message.chat.id,photo:bannerUrl,caption,reply_markup});return res.json({ok:true})}if(u.callback_query?.data==='check_subscription'){const q=u.callback_query;const membership=await checkRequiredMembership(q.from.id,true);if(!membership.ready){await tg('answerCallbackQuery',{callback_query_id:q.id,text:'Подписка на канал и вступление в чат пока не подтверждены.',show_alert:true});return res.json({ok:true})}await tg('answerCallbackQuery',{callback_query_id:q.id,text:'Подписка подтверждена!'});await tg('sendMessage',{chat_id:q.message?.chat?.id||q.from.id,text:'✅ Подписка подтверждена! Теперь можешь открыть Cosmic Fortune.',reply_markup:{inline_keyboard:[[{text:'🚀 ОТКРЫТЬ ПРИЛОЖЕНИЕ',web_app:{url:'https://softpasha6-cpu.github.io/cosmi-fortune/'}}]]}});return res.json({ok:true})}if(u.pre_checkout_query){const q=u.pre_checkout_query;const valid=q.currency==='XTR'&&Number.isInteger(q.total_amount)&&(await pool.query("SELECT 1 FROM star_purchases WHERE payload=$1 AND telegram_id=$2 AND package_stars=$3 AND status='pending'",[q.invoice_payload,String(q.from.id),q.total_amount])).rowCount===1;await tg('answerPreCheckoutQuery',{pre_checkout_query_id:q.id,ok:!!valid,...(!valid?{error_message:'Пакет недействителен. Открой приложение и попробуй снова.'}:{})})}const p=u.message?.successful_payment;if(p){const uid=String(u.message.from.id);if(p.currency!=='XTR')throw new Error('Unexpected payment currency');const c=await pool.connect();let paymentNotice=null;try{await c.query('BEGIN');const q=await c.query('SELECT * FROM star_purchases WHERE payload=$1 AND telegram_id=$2 FOR UPDATE',[p.invoice_payload,uid]);if(!q.rowCount)throw new Error('Payment payload not found');const purchase=q.rows[0];if(Number(p.total_amount)!==Number(purchase.package_stars))throw new Error('Payment amount mismatch');if(purchase.status!=='paid'){const dup=await c.query('SELECT id FROM star_purchases WHERE telegram_payment_charge_id=$1',[p.telegram_payment_charge_id]);if(dup.rowCount)throw new Error('Duplicate charge');const balanceUpdate=await c.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1 RETURNING balance',[uid,purchase.credits]);paymentNotice={stars:Number(purchase.package_stars),credits:Number(purchase.credits),balance:Number(balanceUpdate.rows[0].balance)};await c.query("UPDATE star_purchases SET status='paid',telegram_payment_charge_id=$2,provider_payment_charge_id=$3,paid_at=NOW() WHERE id=$1",[purchase.id,p.telegram_payment_charge_id,p.provider_payment_charge_id||null])}else if(purchase.telegram_payment_charge_id!==p.telegram_payment_charge_id)throw new Error('Paid charge mismatch');await c.query('COMMIT')}catch(e){await c.query('ROLLBACK').catch(()=>{});throw e}finally{c.release()}if(paymentNotice){try{await tg('sendMessage',{chat_id:uid,text:'✅ Cosmic Fortune — оплата подтверждена!\n\n⭐ Оплачено: '+paymentNotice.stars+' Telegram Stars\n✦ Начислено: '+paymentNotice.credits.toLocaleString('ru-RU')+' кредитов\n💰 Текущий баланс: '+paymentNotice.balance.toLocaleString('ru-RU')+' кредитов'});}catch(notifyError){console.error('Payment notification failed:',notifyError.message)}void notifyOwner('💳 ПОЛУЧЕН ПЛАТЁЖ STARS\n\nИгрок Telegram ID: '+uid+'\nОплачено: '+paymentNotice.stars+' Stars\nНачислено: '+paymentNotice.credits.toLocaleString('ru-RU')+' кредитов\nБаланс: '+paymentNotice.balance.toLocaleString('ru-RU')+' кредитов')} }res.json({ok:true})}catch(e){console.error('Stars webhook error:',e.message);res.status(500).json({ok:false})}});
app.get('/api/owner/stars-status',requireUser,async(req,res,next)=>{if(!ownerOnly(req,res))return;try{const [p,w]=await Promise.all([pool.query("SELECT COUNT(*)::int AS count,COALESCE(SUM(package_stars),0)::bigint AS stars,COALESCE(SUM(credits),0)::bigint AS credits FROM star_purchases WHERE status='paid'"),pool.query("SELECT COUNT(*)::int AS pending FROM withdrawal_requests WHERE status='pending'")]);res.json({sales:p.rows[0],pendingWithdrawals:w.rows[0].pending,withdrawalUrl:'https://fragment.com/'})}catch(e){next(e)}});
app.get('/api/me', requireUser, async (req, res) => {
  const [history, vip] = await Promise.all([
    pool.query('SELECT id, game, bet, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 ORDER BY created_at DESC',[req.player.telegram_id]),
    pool.query('SELECT COALESCE(SUM(bet), 0)::numeric AS lifetime_turnover FROM game_transactions WHERE telegram_id=$1',[req.player.telegram_id])
  ]);
  res.json({
    player: { telegramId: String(req.player.telegram_id), username: req.player.username, firstName: req.player.first_name, balance: Number(req.player.balance) },
    vip: { lifetimeTurnover: Number(vip.rows[0]?.lifetime_turnover || 0) },
    history: history.rows.map(row => ({ id: String(row.id), game: row.game, bet: Number(row.bet), payout: Number(row.payout), balanceAfter: Number(row.balance_after), outcome: row.outcome, createdAt: row.created_at }))
  });
});



const TOURNAMENT_GAMES = ['all','slots','roulette','blackjack','dice','miner','luckyjet','plinko'];
function tournamentPoints(row) {
  return 10 + (Number(row.payout) > Number(row.bet) ? 5 : 0);
}
app.get('/api/tournaments', requireUser, async (req,res,next) => {
  try {
    const period=['daily','weekly'].includes(req.query.period) ? req.query.period : 'daily';
    const game=TOURNAMENT_GAMES.includes(req.query.game) ? req.query.game : 'all';
    const interval=period==='weekly' ? "date_trunc('week', NOW())" : "date_trunc('day', NOW())";
    const gameFilter=game==='all' ? '' : ' AND gt.game=$1';
    const params=game==='all' ? [] : [game];
    const query=`
      SELECT gt.telegram_id, p.username, p.first_name,
        COUNT(*)::int AS rounds,
        SUM(10 + CASE WHEN gt.payout > gt.bet THEN 5 ELSE 0 END)::int AS points
      FROM game_transactions gt
      JOIN players p ON p.telegram_id=gt.telegram_id
      WHERE gt.bet > 0 AND gt.created_at >= ${interval}
        AND gt.created_at < ${interval} + INTERVAL '1 ${period==='weekly'?'week':'day'}'
        ${gameFilter}
      GROUP BY gt.telegram_id,p.username,p.first_name
      ORDER BY points DESC, rounds DESC, MIN(gt.created_at) ASC
      LIMIT 50`;
    const result=await pool.query(query,params);
    const me=result.rows.findIndex(r=>String(r.telegram_id)===String(req.player.telegram_id));
    const mine=await pool.query(`
      SELECT COUNT(*)::int AS rounds,
        COALESCE(SUM(10 + CASE WHEN payout > bet THEN 5 ELSE 0 END),0)::int AS points
      FROM game_transactions WHERE telegram_id=$1 AND bet>0
        AND created_at >= ${interval} AND created_at < ${interval} + INTERVAL '1 ${period==='weekly'?'week':'day'}'
        ${game==='all'?'':' AND game=$2'}`,game==='all'?[req.player.telegram_id]:[req.player.telegram_id,game]);
    res.json({period,game,scoring:'10 очков за раунд + 5 за выигрышный раунд',leaders:result.rows.map((r,i)=>({place:i+1,name:r.username?'@'+String(r.username).replace(/^@/,''):(String(r.first_name||'').trim()||'Игрок'),rounds:Number(r.rounds),points:Number(r.points)})),me:{place:me<0?null:me+1,rounds:Number(mine.rows[0].rounds),points:Number(mine.rows[0].points)}});
  } catch(e) { next(e); }
});

const VIP_TASKS = [{"level":0,"key":"rounds","title":"Сыграй 3 раунда","kind":"rounds","target":3,"reward":1000},{"level":0,"key":"turnover","title":"Сделай ставок на 10 000","kind":"turnover","target":10000,"reward":2000},{"level":1,"key":"rounds","title":"Сыграй 5 раундов","kind":"rounds","target":5,"reward":2500},{"level":1,"key":"turnover","title":"Сделай ставок на 30 000","kind":"turnover","target":30000,"reward":5000},{"level":2,"key":"rounds","title":"Сыграй 8 раундов","kind":"rounds","target":8,"reward":5000},{"level":2,"key":"turnover","title":"Сделай ставок на 75 000","kind":"turnover","target":75000,"reward":10000},{"level":3,"key":"rounds","title":"Сыграй 10 раундов","kind":"rounds","target":10,"reward":10000},{"level":3,"key":"turnover","title":"Сделай ставок на 150 000","kind":"turnover","target":150000,"reward":20000},{"level":4,"key":"rounds","title":"Сыграй 15 раундов","kind":"rounds","target":15,"reward":25000},{"level":4,"key":"turnover","title":"Сделай ставок на 300 000","kind":"turnover","target":300000,"reward":50000}];
function vipLevelForTurnover(total) {
  if (total >= 5000000) return 4;
  if (total >= 2000000) return 3;
  if (total >= 500000) return 2;
  if (total >= 100000) return 1;
  return 0;
}
async function getVipTaskState(db, telegramId, lock = false) {
  const turnover = await db.query("SELECT COALESCE(SUM(bet),0)::numeric AS total FROM game_transactions WHERE telegram_id=$1", [telegramId]);
  const stats = await db.query("SELECT COUNT(*) FILTER (WHERE bet > 0)::int AS rounds, COALESCE(SUM(bet),0)::numeric AS turnover FROM game_transactions WHERE telegram_id=$1 AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day' AND bet > 0", [telegramId]);
  const claims = await db.query("SELECT task_key FROM vip_task_claims WHERE telegram_id=$1 AND task_date=CURRENT_DATE", [telegramId]);
  const level = vipLevelForTurnover(Number(turnover.rows[0]?.total || 0));
  const claimed = new Set(claims.rows.map(r => r.task_key));
  return {
    level,
    tasks: VIP_TASKS.filter(t => t.level === level).map(t => ({
      key: t.key, title: t.title, target: t.target, reward: t.reward,
      progress: Math.min(t.target, Number(stats.rows[0]?.[t.kind] || 0)),
      completed: Number(stats.rows[0]?.[t.kind] || 0) >= t.target,
      claimed: claimed.has(t.key)
    }))
  };
}
app.get('/api/vip/tasks', requireUser, async (req,res,next) => {
  try { res.json(await getVipTaskState(pool, req.player.telegram_id)); } catch(e) { next(e); }
});
app.post('/api/vip/tasks/:taskKey/claim', requireUser, async (req,res,next) => {
  const taskKey=String(req.params.taskKey || '');
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const player=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
    if(!player.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Аккаунт не найден.'});}
    const state=await getVipTaskState(client,req.player.telegram_id);
    const task=state.tasks.find(t=>t.key===taskKey);
    if(!task){await client.query('ROLLBACK');return res.status(403).json({error:'Это задание недоступно для твоего VIP-уровня.'});}
    if(task.claimed){await client.query('ROLLBACK');return res.status(409).json({error:'Награда за это задание уже получена сегодня.'});}
    if(!task.completed){await client.query('ROLLBACK');return res.status(400).json({error:'Сначала выполни задание.'});}
    const reward=task.reward,balanceAfter=Number(player.rows[0].balance)+reward;
    const claim=await client.query('INSERT INTO vip_task_claims (telegram_id,task_date,task_key,reward) VALUES ($1,CURRENT_DATE,$2,$3) ON CONFLICT DO NOTHING RETURNING task_key',[req.player.telegram_id,taskKey,reward]);
    if(!claim.rowCount){await client.query('ROLLBACK');return res.status(409).json({error:'Награда уже получена.'});}
    await client.query('UPDATE players SET balance=$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,balanceAfter]);
    await client.query("INSERT INTO game_transactions (telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES ($1,'bonus_wheel',0,$2,$3,$4::jsonb,$5)",[req.player.telegram_id,reward,balanceAfter,JSON.stringify({type:'vip_task_reward',taskKey,reward}), 'vip-task:'+new Date().toISOString().slice(0,10)+':'+taskKey]);
    await client.query('COMMIT');
    res.json({ok:true,reward,balance:balanceAfter,tasks:(await getVipTaskState(pool,req.player.telegram_id)).tasks});
  } catch(e) { await client.query('ROLLBACK').catch(()=>{}); next(e); }
  finally { client.release(); }
});

const MAX_BET = 100000;
const SYMBOLS = ['rhino', 'golden-rhino', 'eagle', 'flamingo', 'crocodile', 'hyena', 'A', 'K', 'Q', 'J'];
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const randInt = (max) => crypto.randomInt(0, max);
function card() { return randInt(13) + 1; }
function cardValue(c) { return Math.min(c, 10); }
function blackjackHand() { return [card(), card()]; }
function handTotal(hand) { return hand.reduce((sum, c) => sum + cardValue(c), 0); }

const SLOT_SYMBOLS = ['rhino', 'golden-rhino', 'eagle', 'flamingo', 'crocodile', 'hyena', 'A', 'K', 'Q', 'J', 'sun'];
const SLOT_PAYLINES = [
  [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
  [0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],
  [2,1,1,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,0,1,0],[2,1,2,1,2],
  [0,2,0,2,0],[2,0,2,0,2],[0,2,2,2,0],[2,0,0,0,2],[1,1,0,1,1]
];
// Published Great Rhino paytable multipliers. The supplied "golden-rhino" artwork
// represents the high-value rhino-chip/Wild symbol; "eagle" is the closest supplied
// artwork for the original game's high-value cheetah symbol.
const SLOT_PAYTABLE = {
  // Original Great Rhino published symbol multipliers; paid against the stake per payline.
  rhino:{2:0.1,3:2.5,4:7.5,5:20},
  'golden-rhino':{2:0.2,3:2.5,4:7.5,5:25},
  eagle:{3:0.75,4:2.5,5:10},
  crocodile:{3:0.5,4:2,5:7.5},
  hyena:{3:0.5,4:1.5,5:5},
  flamingo:{3:0.5,4:1.25,5:2.5},
  A:{3:0.25,4:0.5,5:1.25},
  K:{3:0.25,4:0.5,5:1},
  Q:{3:0.25,4:0.5,5:1},
  J:{3:0.25,4:0.5,5:1}
};
function slotRandomSymbol(allowBonus=true){
  const pool=['J','J','J','Q','Q','Q','K','K','A','A','hyena','hyena','crocodile','flamingo','eagle','golden-rhino','rhino'];
  if(allowBonus)pool.push('sun');
  return pool[randInt(pool.length)];
}
function slotGridHasRhinoStacks(grid){
  const fullReels=[];
  for(let col=0;col<5;col++){
    const cells=[col*3,col*3+1,col*3+2];
    if(cells.every(i=>grid[i]==='rhino'))fullReels.push({col,cells});
  }
  return fullReels;
}
function slotPaylineWin(grid, totalBet, wildRhino=false){
  let total=0;const wins=[];
  const betPerLine=Number(totalBet);
  for(let li=0;li<SLOT_PAYLINES.length;li++){
    const rows=SLOT_PAYLINES[li],line=rows.map((row,col)=>grid[col*3+row]);
    let best={symbol:null,count:0,multiplier:0};
    for(const symbol of Object.keys(SLOT_PAYTABLE)){
      let count=0;
      for(const value of line){
        const isWild=value==='golden-rhino'||(wildRhino&&value==='rhino');
        if(value===symbol||isWild)count++;else break;
      }
      const multiplier=SLOT_PAYTABLE[symbol][count]||0;
      if(multiplier>best.multiplier)best={symbol,count,multiplier};
    }
    if(best.multiplier>0){const win=Math.floor(betPerLine*best.multiplier);total+=win;wins.push({payline:li+1,symbol:best.symbol,count:best.count,payout:win});}
  }
  return {total,wins};
}
function playSlotRound(bet, activeFeature){
  const activeFeatureData=activeFeature&&typeof activeFeature==='object'?activeFeature:null;
  if(activeFeatureData?.mode==='free-spins'){
    const grid=Array.from({length:15},()=>slotRandomSymbol(false));
    // In the original Great Rhino free-spin round, every rhino acts as a Wild and Bonus symbols are absent.
    const pay=slotPaylineWin(grid,Number(activeFeatureData.bet)||bet,true);
    const remaining=Math.max(0,Number(activeFeatureData.remaining||0)-1);
    const next=remaining?{...activeFeatureData,remaining}:null;
    return {payout:pay.total,outcome:{reels:grid,feature:'free-spins',freeSpinsLeft:remaining,featureState:next,chargedBet:0,wins:pay.wins,multiplier:pay.total/(Number(activeFeatureData.bet)||bet||1),message:remaining?'Бесплатные вращения · носорог работает как Wild':'Бесплатные вращения завершены'} ,chargeBet:false};
  }
  if(activeFeatureData?.mode==='super-respin'){
    const grid=Array.isArray(activeFeatureData.grid)&&activeFeatureData.grid.length===15?activeFeatureData.grid.slice():Array(15).fill(null);
    const previous=new Set(grid.map((v,i)=>v==='rhino'?i:-1).filter(i=>i>=0));
    for(let i=0;i<15;i++)if(!previous.has(i)){
      const col=Math.floor(i/3);
      // Only rhinos and empty positions can land during Super Respins.
      if(randInt(col===0||col===4?18:12)===0)grid[i]='rhino';
      else grid[i]=null;
    }
    const newRhinos=grid.filter(v=>v==='rhino').length;
    const landed=newRhinos>previous.size;
    let remaining=landed?3:Math.max(0,Number(activeFeatureData.remaining||1)-1);
    let payout=0;
    let message=landed?'Носорог закреплён — дополнительный респин!':'Super Respin';
    if(newRhinos>=15){payout=Math.floor((Number(activeFeatureData.bet)||bet)*500);remaining=0;message='GRAND JACKPOT · 500×';}
    else if(newRhinos>=14&&remaining===0){payout=Math.floor((Number(activeFeatureData.bet)||bet)*375);remaining=0;message='MAJOR JACKPOT · 375×';}
    else if(remaining===0){payout=slotPaylineWin(grid,Number(activeFeatureData.bet)||bet,false).total;message='Super Respin завершён';}
    const next=remaining?{...activeFeatureData,grid,remaining}:(activeFeatureData.afterFeature||null);
    if(!remaining&&next?.mode==='free-spins')message='Super Respin завершён · далее 10 бесплатных вращений';
    return {payout,outcome:{reels:grid,feature:'super-respin',rhinoCount:newRhinos,respinsLeft:remaining,featureState:next,chargedBet:0,message},chargeBet:false};
  }
  const grid=Array.from({length:15},()=>slotRandomSymbol());
  // Great Rhino uses stacked rhino reels; two or more full stacks trigger Super Respin.
  for(let col=0;col<5;col++)if(randInt(22)===0)for(let row=0;row<3;row++)grid[col*3+row]='rhino';
  // Bonus scatters are restricted to reels 2, 3 and 4.
  for(let col=1;col<=3;col++)if(randInt(24)===0)grid[col*3+randInt(3)]='sun';
  const pay=slotPaylineWin(grid,bet,false);
  const scatterReels=[1,2,3].filter(col=>grid.slice(col*3,col*3+3).includes('sun'));
  const scatterTriggered=scatterReels.length===3;
  // The original Bonus symbol also pays 2x total bet when all three required scatters land.
  const scatterPayout=scatterTriggered?Math.floor(bet*2):0;
  const stacks=slotGridHasRhinoStacks(grid);
  const respinTriggered=stacks.length>=2;
  let featureState=null,feature=null,message=pay.total?'Выигрыш по линиям!':'Попробуй ещё раз';
  if(respinTriggered){
    feature='super-respin';
    // Keep only the full rhino stacks; all other positions become blank during Super Respin.
    const respinGrid=grid.map(symbol=>symbol==='rhino'?'rhino':null);
    featureState={mode:'super-respin',grid:respinGrid,remaining:3,bet,afterFeature:scatterTriggered?{mode:'free-spins',remaining:10,bet}:null};
    message=scatterTriggered?'SUPER RESPIN! Затем 10 бесплатных вращений':'SUPER RESPIN! Носороги закреплены · 3 респина';
  }else if(scatterTriggered){feature='free-spins';featureState={mode:'free-spins',remaining:10,bet};message='БОНУС! 10 бесплатных вращений · носорог — Wild';}
  const totalPayout=pay.total+scatterPayout;
  return {payout:totalPayout,outcome:{reels:feature==='super-respin'?featureState.grid:grid,feature,featureState,freeSpinsLeft:feature==='free-spins'?10:undefined,respinsLeft:feature==='super-respin'?3:undefined,wins:pay.wins,scatterPayout,chargedBet:bet,multiplier:totalPayout/(bet||1),message,scatterCount:scatterReels.length,rhinoStacks:stacks.length},chargeBet:true};
}
function playRound(game, bet, choice, activeSlotFeature=null) {
  if (game === 'slots') return playSlotRound(bet, activeSlotFeature);
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
    if(reward>=BIG_WIN_THRESHOLD){await notifyUser(req.player.telegram_id,'🎉 КРУПНЫЙ ВЫИГРЫШ в бонусной рулетке Cosmic Fortune!\n\n🏆 Приз: '+reward.toLocaleString('ru-RU')+' виртуальных кредитов ✦\n💰 Текущий баланс: '+balanceAfter.toLocaleString('ru-RU')+' виртуальных кредитов.\n\nℹ️ Это игровые кредиты, не реальные рубли и не денежная выплата.');void notifyOwner('🏆 КРУПНЫЙ БОНУС\n\nИгрок: '+(req.player.username?'@'+req.player.username:req.player.telegram_id)+'\nTelegram ID: '+req.player.telegram_id+'\nПриз: '+reward.toLocaleString('ru-RU')+' кредитов\nБаланс: '+balanceAfter.toLocaleString('ru-RU')+' кредитов');}
    res.json({transactionId:String(inserted.rows[0].id),payout:reward,balance:balanceAfter,outcome:{reward,label,message:label},createdAt:inserted.rows[0].created_at});
  } catch(error) {
    await client.query('ROLLBACK').catch(()=>{});
    if(error.code==='23505') return res.status(409).json({error:'Бонус уже получен сегодня.'});
    next(error);
  } finally { client.release(); }
});


/* Stage 1: Plinko — result, balance and replay protection are server-authoritative. */
app.post('/api/plinko/play', requireUser, async (req, res, next) => {
  const bet = Number(req.body?.bet);
  const requestId = req.body?.requestId;
  if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) {
    return res.status(400).json({ error: 'Некорректный идентификатор раунда.' });
  }
  if (!Number.isSafeInteger(bet) || bet < 1 || bet > MAX_BET) {
    return res.status(400).json({ error: 'Ставка должна быть от 1 до 100 000 виртуальных кредитов.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prior = await client.query(
      'SELECT id, bet, payout, balance_after, outcome, created_at FROM game_transactions WHERE telegram_id=$1 AND idempotency_key=$2',
      [req.player.telegram_id, requestId]
    );
    if (prior.rowCount) {
      const row = prior.rows[0];
      await client.query('COMMIT');
      return res.json({
        transactionId: String(row.id), bet: Number(row.bet), payout: Number(row.payout),
        balance: Number(row.balance_after), outcome: row.outcome, replayed: true
      });
    }
    const player = await client.query(
      'SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',
      [req.player.telegram_id]
    );
    if (!player.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Аккаунт не найден.' });
    }
    const balance = Number(player.rows[0].balance);
    if (balance < bet) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Недостаточно виртуальных кредитов.' });
    }

    const path = Array.from({ length: 12 }, () => crypto.randomInt(0, 2));
    const bin = path.reduce((sum, step) => sum + step, 0);
    const multipliers = [8, 3, 1.8, 1.3, 1.1, 0.8, 0.5, 0.8, 1.1, 1.3, 1.8, 3, 8];
    const multiplier = multipliers[bin];
    const payout = Math.floor(bet * multiplier);
    const balanceAfter = balance - bet + payout;
    const outcome = {
      path, bin, multiplier, payout,
      message: payout > bet ? 'Отличный результат!' : payout === bet ? 'Ставка возвращена.' : 'В следующий раз повезёт!'
    };

    await client.query(
      'UPDATE players SET balance=$2, updated_at=NOW() WHERE telegram_id=$1',
      [req.player.telegram_id, balanceAfter]
    );
    const inserted = await client.query(
      "INSERT INTO game_transactions (telegram_id, game, bet, payout, balance_after, outcome, idempotency_key) VALUES ($1, 'plinko', $2, $3, $4, $5::jsonb, $6) RETURNING id, created_at",
      [req.player.telegram_id, bet, payout, balanceAfter, JSON.stringify(outcome), requestId]
    );
    await client.query('COMMIT');
    res.json({
      transactionId: String(inserted.rows[0].id), bet, payout, balance: balanceAfter,
      outcome, createdAt: inserted.rows[0].created_at
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.code === '23505') return res.status(409).json({ error: 'Этот раунд уже обработан.' });
    next(error);
  } finally {
    client.release();
  }
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
    let activeSlotFeature = null;
    if (game === 'slots') {
      const lastSlot = await client.query(
        "SELECT outcome FROM game_transactions WHERE telegram_id=$1 AND game='slots' ORDER BY id DESC LIMIT 1",
        [req.player.telegram_id]
      );
      const lastOutcome = lastSlot.rows[0]?.outcome;
      const parsedOutcome = typeof lastOutcome === 'string' ? (() => { try { return JSON.parse(lastOutcome); } catch { return null; } })() : lastOutcome;
      const candidate = parsedOutcome?.featureState;
      if (candidate && ['free-spins','super-respin'].includes(candidate.mode) && Number(candidate.remaining) > 0) activeSlotFeature = candidate;
    }
    const round = playRound(game, bet, choice, activeSlotFeature);
    const chargedBet = round.chargeBet === false ? 0 : bet;
    if (balance < chargedBet) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Недостаточно виртуальных кредитов.' });
    }
    const balanceAfter = balance - chargedBet + round.payout;
    await client.query('UPDATE players SET balance=$2, updated_at=NOW() WHERE telegram_id=$1', [req.player.telegram_id, balanceAfter]);
    const inserted = await client.query(
      'INSERT INTO game_transactions (telegram_id, game, bet, payout, balance_after, outcome, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7) RETURNING id, created_at',
      [req.player.telegram_id, game, Math.max(1, chargedBet), round.payout, balanceAfter, JSON.stringify(round.outcome), requestId]
    );
    await client.query('COMMIT');
    if(!round.replayed && Number(round.payout)>=BIG_WIN_THRESHOLD){
      const gameNames={slots:'космические слоты',dice:'кости',roulette:'рулетку',blackjack:'блэкджек'};
      await notifyUser(req.player.telegram_id,'🎉 КРУПНЫЙ ВЫИГРЫШ в Cosmic Fortune!\n\n🎮 Игра: '+(gameNames[game]||game)+'\n✦ Выплата: '+Number(round.payout).toLocaleString('ru-RU')+' кредитов\n💰 Текущий баланс: '+balanceAfter.toLocaleString('ru-RU')+' кредитов');void notifyOwner('🏆 КРУПНЫЙ ВЫИГРЫШ\n\nИгрок: '+(req.player.username?'@'+req.player.username:req.player.telegram_id)+'\nTelegram ID: '+req.player.telegram_id+'\nИгра: '+(gameNames[game]||game)+'\nСтавка: '+Number(bet).toLocaleString('ru-RU')+' кредитов\nВыплата: '+Number(round.payout).toLocaleString('ru-RU')+' кредитов\nБаланс: '+balanceAfter.toLocaleString('ru-RU')+' кредитов');
    }
    res.json({
      transactionId: String(inserted.rows[0].id), game, bet: chargedBet, payout: round.payout,
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
app.get('/api/luckyjet/live',requireUser,async(req,res,next)=>{
 try{
  let q=await pool.query("SELECT id,started_at,crash_at FROM luckyjet_rounds WHERE started_at>NOW()-INTERVAL '3 minutes' ORDER BY started_at DESC LIMIT 1");
  let flight=null,bets=[];
  if(q.rowCount){
   const startedAt=q.rows[0].started_at,crashAt=Number(q.rows[0].crash_at);
   const elapsed=Math.max(0,(Date.now()-new Date(startedAt).getTime())/1000);
   const multiplier=Number((1+Math.pow(elapsed,1.35)*0.23).toFixed(2));
   if(multiplier>=crashAt){
    await pool.query("UPDATE luckyjet_rounds SET status='crashed',finished_at=COALESCE(finished_at,NOW()) WHERE status='active' AND started_at=$1",[startedAt]);
    q={rowCount:0,rows:[]};
   }else{
    flight={startedAt:new Date(startedAt).getTime(),multiplier,crashAt};
    const b=await pool.query("SELECT l.telegram_id,l.bet,l.status,l.payout,p.username,p.first_name FROM luckyjet_rounds l JOIN players p ON p.telegram_id=l.telegram_id WHERE l.started_at=$1 ORDER BY l.telegram_id ASC LIMIT 100",[startedAt]);
    bets=b.rows.map(x=>({telegramId:String(x.telegram_id),name:(x.username&&String(x.username).trim())?'@'+String(x.username).replace(/^@/,''):((x.first_name&&String(x.first_name).trim())||'Игрок'),bet:Number(x.bet),status:x.status,payout:Number(x.payout||0),isMe:String(x.telegram_id)===String(req.player.telegram_id)}));
   }
  }
  const history=await pool.query("SELECT crash_at,finished_at,status FROM luckyjet_rounds WHERE status IN ('crashed','cashed_out') ORDER BY finished_at DESC NULLS LAST LIMIT 8");
  res.json({flight,bets,history:history.rows.map(x=>({multiplier:Number(x.crash_at),status:x.status,finishedAt:x.finished_at?new Date(x.finished_at).getTime():null}))});
 }catch(e){next(e)}
});
app.post('/api/luckyjet/start',requireUser,async(req,res,next)=>{
 const bet=Number(req.body?.bet),autoAt=req.body?.autoAt==null?null:Number(req.body.autoAt);
 if(!Number.isSafeInteger(bet)||bet<1||bet>MAX_BET)return res.status(400).json({error:'Ставка от 1 до 100 000.'});
 if(autoAt!==null&&(!Number.isFinite(autoAt)||autoAt<1.1||autoAt>100))return res.status(400).json({error:'Авто-вывод должен быть от 1.1× до 100×.'});
 const client=await pool.connect();try{
  await client.query('BEGIN');
  // Serialize starts so every player joins the same live flight instead of getting an independent crash point.
  await client.query('SELECT pg_advisory_xact_lock($1)',[74190261]);
  const recent=await client.query("SELECT status,finished_at,started_at FROM luckyjet_rounds WHERE status='crashed' AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1");
  if(recent.rowCount&&recent.rows[0].status==='crashed'&&recent.rows[0].finished_at){
   const waitMs=5000-(Date.now()-new Date(recent.rows[0].finished_at).getTime());
   if(waitMs>0){await client.query('ROLLBACK');return res.status(409).json({error:'Следующий раунд скоро начнётся.',waitSeconds:Math.ceil(waitMs/1000)})}
  }
  const p=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
  if(!p.rowCount||Number(p.rows[0].balance)<bet){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно виртуальных кредитов.'})}
  // Multiple independent bets from the same player are allowed in the same shared flight.
  let shared=await client.query("SELECT started_at,crash_at FROM luckyjet_rounds WHERE started_at>NOW()-INTERVAL '3 minutes' ORDER BY started_at DESC LIMIT 1");
  if(shared.rowCount){
   const flight=shared.rows[0],elapsed=(Date.now()-new Date(flight.started_at).getTime())/1000;
   // Bets are accepted only at the very beginning of the shared round, never once the rocket is visibly flying.
   if(elapsed>0.75){await client.query('ROLLBACK');return res.status(409).json({error:'Раунд уже начался — дождись следующего запуска.'})}
   const current=1+Math.pow(Math.max(0,elapsed),1.35)*0.23;
   if(current>=Number(flight.crash_at)){
    await client.query("UPDATE luckyjet_rounds SET status='crashed',finished_at=COALESCE(finished_at,NOW()) WHERE status='active' AND started_at=$1",[flight.started_at]);
    shared={rowCount:0,rows:[]};
   }
  }
  if(!shared.rowCount){
   const roll=Math.max(1.01,Math.min(50,Number((1/(1-Math.random()*0.98)).toFixed(2))));
   shared=await client.query("SELECT NOW() AS started_at,$1::numeric AS crash_at",[roll]);
  }
  const id=crypto.randomUUID(),flightStart=shared.rows[0].started_at,roll=Number(shared.rows[0].crash_at);
  const balance=Number(p.rows[0].balance)-bet;
  await client.query('UPDATE players SET balance=$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,balance]);
  const inserted=await client.query('INSERT INTO luckyjet_rounds(id,telegram_id,bet,crash_at,started_at,auto_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING started_at',[id,req.player.telegram_id,bet,roll,flightStart,autoAt]);
  await client.query('COMMIT');
  res.json({round:{id,startedAt:new Date(inserted.rows[0].started_at).getTime(),autoAt},balance});
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


let lastOwnerErrorNotificationAt=0;
app.use((err, req, res, _next) => {
  const status = Number(err.status) || (err.message === 'Origin not allowed' ? 403 : 500);
  if (status >= 500) { console.error(err); if(Date.now()-lastOwnerErrorNotificationAt>60000){lastOwnerErrorNotificationAt=Date.now();void notifyOwner('⚠️ ОШИБКА COSMIC FORTUNE API\n\nМетод: '+req.method+'\nПуть: '+req.path+'\nОшибка: '+String(err.message||'unknown').slice(0,250)+'\nВремя: '+new Date().toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})+' МСК');} }
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
