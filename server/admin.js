const fmt = n => Number(n || 0).toLocaleString('ru-RU');
const stamp = d => new Date(d).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' МСК';
const back = (rows=[]) => ({ inline_keyboard: [...rows,[{text:'↩️ Админ-меню',callback_data:'admin:home'}]] });
const keyboard = () => ({ inline_keyboard: [
 [{text:'📊 Статистика',callback_data:'admin:stats'},{text:'🎁 Выплаты',callback_data:'admin:withdrawals'}],
 [{text:'💳 Платежи Stars',callback_data:'admin:payments'},{text:'🎮 Игры и экономика',callback_data:'admin:games'}],
 [{text:'👤 Игроки',callback_data:'admin:users'},{text:'🖥 Сервер',callback_data:'admin:system'}],
 [{text:'🔔 Уведомления',callback_data:'admin:notifications'}]
] });
async function send(tg, chatId, text, reply_markup=back()) { return tg('sendMessage',{chat_id:chatId,text,reply_markup,disable_web_page_preview:true}); }
async function home(chatId,tg) { return send(tg,chatId,'🌌 COSMIC FORTUNE — ПАНЕЛЬ ВЛАДЕЛЬЦА\n\nДоступ только владельцу. Выбери раздел:',keyboard()); }
async function stats(chatId,{pool,tg}) {
 const [users,today,players,games,payments,withdrawals]=await Promise.all([
  pool.query('SELECT COUNT(*)::int n FROM (SELECT telegram_id FROM bot_users UNION SELECT telegram_id FROM players) x'),
  pool.query('SELECT COUNT(*)::int n FROM (SELECT telegram_id FROM bot_users WHERE created_at>=CURRENT_DATE UNION SELECT telegram_id FROM players WHERE created_at>=CURRENT_DATE) x'),
  pool.query('SELECT COUNT(*)::int n,COALESCE(SUM(balance),0)::bigint balance FROM players'),
  pool.query('SELECT COUNT(*)::bigint n,COALESCE(SUM(bet),0)::bigint bets,COALESCE(SUM(payout),0)::bigint payouts FROM game_transactions'),
  pool.query("SELECT COUNT(*) FILTER(WHERE status='paid')::int paid,COALESCE(SUM(package_stars) FILTER(WHERE status='paid'),0)::bigint stars,COUNT(*) FILTER(WHERE status='pending')::int pending FROM star_purchases"),
  pool.query("SELECT COUNT(*) FILTER(WHERE status='pending')::int pending,COALESCE(SUM(credits) FILTER(WHERE status='pending'),0)::bigint reserved FROM withdrawal_requests")
 ]);
 const p=players.rows[0],g=games.rows[0],s=payments.rows[0],w=withdrawals.rows[0];
 return send(tg,chatId,'📊 СТАТИСТИКА COSMIC FORTUNE\n\n👥 Пользователей: '+fmt(users.rows[0].n)+'\n🆕 Новых сегодня: '+fmt(today.rows[0].n)+'\n🎮 Игроков приложения: '+fmt(p.n)+'\n💰 Баланс всех игроков: '+fmt(p.balance)+' кредитов\n🎲 Игровых раундов: '+fmt(g.n)+'\n↗️ Сумма ставок: '+fmt(g.bets)+'\n🏆 Выплаты в играх: '+fmt(g.payouts)+'\n\n⭐ Оплат Stars: '+fmt(s.paid)+' ('+fmt(s.stars)+' Stars)\n⏳ Ожидают оплаты: '+fmt(s.pending)+'\n🎁 Ожидают вывода: '+fmt(w.pending)+'\n🔒 Зарезервировано: '+fmt(w.reserved)+' кредитов');
}
async function withdrawals(chatId,{pool,tg}) {
 const r=await pool.query("SELECT w.id,w.telegram_id::text player_id,w.credits,w.reward_stars,p.username,p.first_name FROM withdrawal_requests w JOIN players p USING(telegram_id) WHERE w.status='pending' ORDER BY w.created_at LIMIT 10");
 if(!r.rowCount)return send(tg,chatId,'✅ Ожидающих заявок на вывод нет.');
 return send(tg,chatId,'🎁 ЗАЯВКИ НА ВЫВОД\n\nВыбери заявку для просмотра. Показаны первые 10.',back(r.rows.map(w=>[{text:'Заявка '+w.id.slice(0,8)+' · '+fmt(w.credits)+' кредитов',callback_data:'admin:w:'+w.id}])));
}
async function payments(chatId,{pool,tg}) {
 const [s,r]=await Promise.all([
  pool.query("SELECT COUNT(*) FILTER(WHERE status='paid')::int paid,COALESCE(SUM(package_stars) FILTER(WHERE status='paid'),0)::bigint stars,COALESCE(SUM(credits) FILTER(WHERE status='paid'),0)::bigint credits,COUNT(*) FILTER(WHERE status='pending')::int pending FROM star_purchases"),
  pool.query('SELECT s.package_stars,s.credits,s.status,s.telegram_id::text id,p.username FROM star_purchases s LEFT JOIN players p USING(telegram_id) ORDER BY s.created_at DESC LIMIT 8')
 ]);
 const x=s.rows[0],lines=r.rows.map(v=>'• '+(v.username?'@'+v.username:'ID '+v.id)+' — '+fmt(v.package_stars)+' ⭐ / '+fmt(v.credits)+' кредитов — '+(v.status==='paid'?'оплачено':v.status==='pending'?'ожидает':'статус: '+v.status));
 return send(tg,chatId,'💳 ПЛАТЕЖИ STARS\n\nУспешных оплат: '+fmt(x.paid)+'\nПолучено Stars: '+fmt(x.stars)+'\nНачислено кредитов: '+fmt(x.credits)+'\nОжидают оплаты: '+fmt(x.pending)+'\n\nПоследние операции:\n'+(lines.join('\n')||'Операций пока нет.'));
}
async function gameStats(chatId,{pool,tg}) {
 const [g,e,a]=await Promise.all([
  pool.query('SELECT game,COUNT(*)::bigint rounds,COALESCE(SUM(bet),0)::bigint bets,COALESCE(SUM(payout),0)::bigint payouts FROM game_transactions GROUP BY game ORDER BY COUNT(*) DESC'),
  pool.query('SELECT COUNT(*)::int players,COALESCE(SUM(balance),0)::bigint balance FROM players'),
  pool.query("SELECT (SELECT COUNT(*) FROM miner_rounds WHERE status='active')::int miner,(SELECT COUNT(*) FROM luckyjet_rounds WHERE status='active')::int jet,(SELECT COUNT(*) FROM blackjack_rooms WHERE status='playing')::int blackjack")
 ]);
 const lines=g.rows.map(v=>'• '+v.game+': '+fmt(v.rounds)+' раундов · ставки '+fmt(v.bets)+' · выплаты '+fmt(v.payouts));
 return send(tg,chatId,'🎮 ИГРЫ И ЭКОНОМИКА\n\nИгроков: '+fmt(e.rows[0].players)+'\nВиртуальный баланс: '+fmt(e.rows[0].balance)+' кредитов\nАктивные раунды: Минер '+fmt(a.rows[0].miner)+' · Lucky Jet '+fmt(a.rows[0].jet)+' · Blackjack '+fmt(a.rows[0].blackjack)+'\n\nСтатистика по играм:\n'+(lines.join('\n')||'Раундов пока нет.')+'\n\nДанные взяты из PostgreSQL.');
}
async function system(chatId,{pool,tg}) {
 const db=await pool.query('SELECT NOW() server_time');
 let wh; try{wh=await tg('getWebhookInfo',{},3500)}catch(e){wh={url:'',pending_update_count:'?',last_error_message:e.message}}
 return send(tg,chatId,'🖥 СОСТОЯНИЕ СЕРВЕРА\n\n✅ API отвечает, PostgreSQL доступен.\n🕒 Время БД: '+stamp(db.rows[0].server_time)+'\n🌐 Webhook: '+(wh.url?'настроен':'не настроен')+'\n📨 Очередь Telegram: '+(wh.pending_update_count??'—')+'\n'+(wh.last_error_message?'⚠️ Ошибка webhook: '+String(wh.last_error_message).slice(0,300):'')+'\n\nAPI: https://cosmic-fortune-api.onrender.com/health');
}
async function playersList(chatId,{pool,tg},page=0) {
 const offset=Math.max(0,Number(page)||0)*10;
 const [r,total]=await Promise.all([
  pool.query(\`SELECT u.telegram_id::text id,u.username,u.first_name,u.created_at,
   p.balance,p.updated_at,COALESCE(g.rounds,0)::bigint rounds
   FROM (SELECT telegram_id,username,first_name,created_at FROM bot_users
         UNION SELECT telegram_id,username,first_name,created_at FROM players) u
   LEFT JOIN players p ON p.telegram_id=u.telegram_id
   LEFT JOIN (SELECT telegram_id,COUNT(*) rounds FROM game_transactions GROUP BY telegram_id) g ON g.telegram_id=u.telegram_id
   ORDER BY COALESCE(p.updated_at,u.created_at) DESC NULLS LAST LIMIT 10 OFFSET $1\`,[offset]),
  pool.query('SELECT COUNT(*)::int n FROM (SELECT telegram_id FROM bot_users UNION SELECT telegram_id FROM players) x')
 ]);
 const rows=r.rows.map(u=>[{text:(u.username?'@'+u.username:(u.first_name||'Игрок'))+' · '+fmt(u.balance)+' кредитов · '+fmt(u.rounds)+' игр',callback_data:'admin:player:'+u.id}]);
 const nav=[];
 if(page>0)nav.push({text:'⬅️ Назад',callback_data:'admin:players:'+String(page-1)});
 if(offset+10<Number(total.rows[0].n))nav.push({text:'Вперёд ➡️',callback_data:'admin:players:'+String(page+1)});
 if(nav.length)rows.push(nav);
 rows.push([{text:'🔎 Найти по ID / username',callback_data:'admin:users'}]);
 return send(tg,chatId,'👥 ИГРОКИ COSMIC FORTUNE\n\nВсего пользователей: '+fmt(total.rows[0].n)+'\nСтраница '+(page+1)+'. Нажми на игрока, чтобы посмотреть его подробную статистику.',{inline_keyboard:[...rows,[{text:'↩️ Админ-меню',callback_data:'admin:home'}]]});
}
async function playerCard(chatId,id,{pool,tg}) {
 const p=await pool.query(\`SELECT COALESCE(a.telegram_id,b.telegram_id)::text id,
   COALESCE(a.username,b.username) username,COALESCE(a.first_name,b.first_name,'') first_name,
   a.balance,a.created_at app_created,b.created_at bot_created,a.updated_at
   FROM (SELECT telegram_id,username,first_name,created_at,updated_at,balance FROM players WHERE telegram_id=$1) a
   FULL JOIN (SELECT telegram_id,username,first_name,created_at FROM bot_users WHERE telegram_id=$1) b
   ON a.telegram_id=b.telegram_id LIMIT 1\`,[id]);
 if(!p.rowCount)return send(tg,chatId,'Игрок не найден.');
 const u=p.rows[0];
 const [g,byGame,s,w,recent]=await Promise.all([
  pool.query('SELECT COUNT(*)::bigint n,COALESCE(SUM(bet),0)::bigint bets,COALESCE(SUM(payout),0)::bigint payouts,MAX(created_at) last_game FROM game_transactions WHERE telegram_id=$1',[u.id]),
  pool.query('SELECT game,COUNT(*)::bigint rounds,COALESCE(SUM(bet),0)::bigint bets,COALESCE(SUM(payout),0)::bigint payouts FROM game_transactions WHERE telegram_id=$1 GROUP BY game ORDER BY COUNT(*) DESC LIMIT 7',[u.id]),
  pool.query("SELECT COUNT(*)::int n,COALESCE(SUM(package_stars),0)::bigint stars,COALESCE(SUM(credits),0)::bigint credits FROM star_purchases WHERE telegram_id=$1 AND status='paid'",[u.id]),
  pool.query("SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='pending')::int pending,COUNT(*) FILTER(WHERE status='paid')::int paid,COUNT(*) FILTER(WHERE status='rejected')::int rejected FROM withdrawal_requests WHERE telegram_id=$1",[u.id]),
  pool.query('SELECT game,bet,payout,balance_after,created_at FROM game_transactions WHERE telegram_id=$1 ORDER BY created_at DESC LIMIT 5',[u.id])
 ]);
 const lines=byGame.rows.map(v=>'• '+v.game+': '+fmt(v.rounds)+' игр, ставки '+fmt(v.bets)+', выплаты '+fmt(v.payouts));
 const last=recent.rows.map(v=>'• '+stamp(v.created_at)+' — '+v.game+': ставка '+fmt(v.bet)+', выплата '+fmt(v.payout)+', баланс '+fmt(v.balance_after));
 const text='👤 КАРТОЧКА ИГРОКА\n\nИмя: '+(u.first_name||'—')+'\nUsername: '+(u.username?'@'+u.username:'—')+'\nTelegram ID: '+u.id+'\nБаланс: '+fmt(u.balance)+' кредитов\nРегистрация в боте: '+(u.bot_created?stamp(u.bot_created):'—')+'\nПрофиль приложения: '+(u.app_created?stamp(u.app_created):'не создан')+'\nПоследняя активность: '+(u.updated_at?stamp(u.updated_at):'—')+
  '\n\n🎮 ИГРЫ\nРаундов: '+fmt(g.rows[0].n)+'\nСумма ставок: '+fmt(g.rows[0].bets)+'\nСумма выплат: '+fmt(g.rows[0].payouts)+'\nПоследняя игра: '+(g.rows[0].last_game?stamp(g.rows[0].last_game):'—')+'\n'+(lines.join('\n')||'Игровой статистики пока нет.')+
  '\n\n⭐ ПОКУПКИ STARS\nУспешных оплат: '+fmt(s.rows[0].n)+'\nПотрачено Stars: '+fmt(s.rows[0].stars)+'\nПолучено кредитов: '+fmt(s.rows[0].credits)+
  '\n\n🎁 ВЫВОДЫ\nВсего заявок: '+fmt(w.rows[0].total)+'\nОжидают: '+fmt(w.rows[0].pending)+' · Выплачено: '+fmt(w.rows[0].paid)+' · Отклонено: '+fmt(w.rows[0].rejected)+
  '\n\n🕹 ПОСЛЕДНИЕ 5 ИГР\n'+(last.join('\n')||'Игр пока нет.');
 return send(tg,chatId,text,{inline_keyboard:[[{text:'👥 К списку игроков',callback_data:'admin:players:0'}],[{text:'🔎 Найти другого игрока',callback_data:'admin:users'}],[{text:'↩️ Админ-меню',callback_data:'admin:home'}]]});
}
async function lookup(chatId,term,{pool,tg}) {
 const raw=String(term||'').trim().replace(/^@/,''); if(!raw)return send(tg,chatId,'Использование: /user Telegram_ID или /user username');
 const numeric=/^\d+$/.test(raw);
 const q=numeric?await pool.query('SELECT telegram_id::text,username,first_name,balance,created_at,updated_at FROM players WHERE telegram_id=$1',[raw]):await pool.query('SELECT telegram_id::text,username,first_name,balance,created_at,updated_at FROM players WHERE LOWER(username)=LOWER($1) LIMIT 1',[raw]);
 if(!q.rowCount){
  const b=numeric?await pool.query('SELECT telegram_id::text,username,first_name FROM bot_users WHERE telegram_id=$1',[raw]):await pool.query('SELECT telegram_id::text,username,first_name FROM bot_users WHERE LOWER(username)=LOWER($1) LIMIT 1',[raw]);
  return send(tg,chatId,b.rowCount?'Пользователь запускал бота, но ещё не создал профиль приложения.\nID: '+b.rows[0].telegram_id+'\nИмя: '+(b.rows[0].first_name||'—')+'\nUsername: '+(b.rows[0].username?'@'+b.rows[0].username:'—'):'Пользователь не найден.');
 }
 const u=q.rows[0];
 const [g,s,w]=await Promise.all([
  pool.query('SELECT COUNT(*)::bigint n,COALESCE(SUM(bet),0)::bigint bets,COALESCE(SUM(payout),0)::bigint payouts FROM game_transactions WHERE telegram_id=$1',[u.telegram_id]),
  pool.query("SELECT COUNT(*)::int n,COALESCE(SUM(package_stars),0)::bigint stars FROM star_purchases WHERE telegram_id=$1 AND status='paid'",[u.telegram_id]),
  pool.query("SELECT COUNT(*) FILTER(WHERE status='pending')::int pending,COUNT(*)::int total FROM withdrawal_requests WHERE telegram_id=$1",[u.telegram_id])
 ]);
 return send(tg,chatId,'👤 КАРТОЧКА ИГРОКА\n\nИмя: '+(u.first_name||'—')+'\nUsername: '+(u.username?'@'+u.username:'—')+'\nTelegram ID: '+u.telegram_id+'\nБаланс: '+fmt(u.balance)+' кредитов\nРегистрация: '+stamp(u.created_at)+'\nАктивность: '+stamp(u.updated_at)+'\n\nРаундов: '+fmt(g.rows[0].n)+'\nСумма ставок: '+fmt(g.rows[0].bets)+'\nСумма выплат: '+fmt(g.rows[0].payouts)+'\nПокупки Stars: '+fmt(s.rows[0].n)+' ('+fmt(s.rows[0].stars)+' Stars)\nЗаявки на вывод: '+fmt(w.rows[0].total)+' (ожидают '+fmt(w.rows[0].pending)+')');
}
async function callback(q,deps) {
 const {pool,tg,ownerId,notifyUser}=deps;
 if(String(q.from?.id)!==String(ownerId)){await tg('answerCallbackQuery',{callback_query_id:q.id,text:'Доступ только владельцу.',show_alert:true});return true}
 await tg('answerCallbackQuery',{callback_query_id:q.id});
 const chatId=q.message?.chat?.id||q.from.id,data=String(q.data||'');
 if(data==='admin:home')await home(chatId,tg);
 else if(data==='admin:stats')await stats(chatId,deps);
 else if(data==='admin:withdrawals')await withdrawals(chatId,deps);
 else if(data==='admin:payments')await payments(chatId,deps);
 else if(data==='admin:games')await gameStats(chatId,deps);
 else if(data==='admin:system')await system(chatId,deps);
 else if(data==='admin:users')await send(tg,chatId,'👤 ПОИСК ИГРОКА\n\nОтправь в чат:\n/user 123456789\nили\n/user username',back([[{text:'👥 Открыть список игроков',callback_data:'admin:players:0'}]]));
 else if(data.startsWith('admin:players:'))await playersList(chatId,deps,Number(data.slice('admin:players:'.length)));
 else if(data.startsWith('admin:player:'))await playerCard(chatId,data.slice('admin:player:'.length),deps);
 else if(data==='admin:notifications'){
  const r=await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='owner_notifications_enabled'");
  const enabled=r.rows[0]?.setting_value!=='false',next=!enabled;
  await pool.query("INSERT INTO app_settings(setting_key,setting_value) VALUES('owner_notifications_enabled',$1) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()",[String(next)]);
  await send(tg,chatId,'🔔 Уведомления владельцу теперь '+(next?'ВКЛЮЧЕНЫ':'ВЫКЛЮЧЕНЫ')+'.\n\nСобытия: новые заявки, успешные оплаты, крупные выигрыши, ошибки API.');
 } else if(data.startsWith('admin:w:')){
  const id=data.slice(8),r=await pool.query("SELECT w.*,w.telegram_id::text player_id,p.username,p.first_name,p.balance FROM withdrawal_requests w JOIN players p USING(telegram_id) WHERE w.id=$1",[id]);
  if(!r.rowCount)return send(tg,chatId,'Заявка не найдена.');
  const w=r.rows[0],rows=[];
  if(w.status==='pending')rows.push([{text:'✅ Вознаграждение отправлено',callback_data:'admin:review:paid:'+w.id}],[{text:'↩️ Отклонить и вернуть кредиты',callback_data:'admin:review:rejected:'+w.id}]);
  rows.push([{text:'↩️ К заявкам',callback_data:'admin:withdrawals'}]);
  return send(tg,chatId,'🎁 ЗАЯВКА НА ВЫВОД\n\nID: '+w.id+'\nИгрок: '+(w.username?'@'+w.username:w.first_name||'без имени')+'\nTelegram ID: '+w.player_id+'\nКредитов: '+fmt(w.credits)+'\nВознаграждение: '+fmt(w.reward_stars)+' Stars\nСтатус: '+w.status+'\nБаланс игрока: '+fmt(w.balance)+'\nСоздана: '+stamp(w.created_at)+'\n\nОтмечай выплату только после ручной отправки подарка. Отклонение возвращает кредиты.',{inline_keyboard:rows});
 } else if(data.startsWith('admin:review:')){
  const p=data.split(':'),action=p[2],id=p.slice(3).join(':');if(!['paid','rejected'].includes(action))return true;
  const c=await pool.connect();
  try{
   await c.query('BEGIN');const r=await c.query('SELECT * FROM withdrawal_requests WHERE id=$1 FOR UPDATE',[id]);
   if(!r.rowCount||r.rows[0].status!=='pending'){await c.query('ROLLBACK');return send(tg,chatId,'Заявка не найдена или уже обработана.')}
   const w=r.rows[0];if(action==='rejected')await c.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1',[w.telegram_id,w.credits]);
   await c.query('UPDATE withdrawal_requests SET status=$2,reviewed_at=NOW(),reviewed_by=$3,note=$4 WHERE id=$1',[w.id,action,ownerId,action==='rejected'?'Отклонено владельцем в боте':'Владелец подтвердил ручную отправку']);
   await c.query('COMMIT');
   await notifyUser(w.telegram_id,action==='paid'?'✅ Cosmic Fortune — владелец отметил вознаграждение как отправленное.':'↩️ Cosmic Fortune — заявка отклонена, зарезервированные кредиты возвращены на баланс.');
   await send(tg,chatId,(action==='paid'?'✅ Заявка отмечена выплаченной.':'↩️ Заявка отклонена, кредиты возвращены.')+'\nID: '+w.id,back([[{text:'🎁 Другие заявки',callback_data:'admin:withdrawals'}]]));
  }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e}finally{c.release()}
 }
 return true;
}
export async function handleAdminUpdate(update,deps){
 const msg=update.message;
 if(update.callback_query?.data&&String(update.callback_query.data).startsWith('admin:'))return callback(update.callback_query,deps);
 if(!msg?.text)return false;
 if(/^\/admin(?:@CosmicFortune_bot)?(?:\s|$)/i.test(msg.text)){
  if(String(msg.from?.id)!==String(deps.ownerId)){await deps.tg('sendMessage',{chat_id:msg.chat.id,text:'⛔ Панель управления доступна только владельцу.'});return true}
  await home(msg.chat.id,deps.tg);return true;
 }
 const m=msg.text.match(/^\/user(?:@CosmicFortune_bot)?\s+(.+)/i);
 if(m){if(String(msg.from?.id)!==String(deps.ownerId)){await deps.tg('sendMessage',{chat_id:msg.chat.id,text:'⛔ Поиск игроков доступен только владельцу.'});return true}await lookup(msg.chat.id,m[1],deps);return true}
 return false;
}
