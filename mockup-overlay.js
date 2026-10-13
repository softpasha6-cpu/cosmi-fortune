(() => {
  // Code-rendered Cosmic Fortune Mini App: responsive, no screenshot assets required.
  const old = document.getElementById('cf-mockup-app');
  if (old) old.remove();
  const style = document.createElement('style');
  style.textContent = `
    body.cf-code-app>header,body.cf-code-app>main,body.cf-code-app>footer,body.cf-code-app>.bottom-nav{display:none!important}
    #cf-app{position:fixed;inset:0;z-index:2147483000;overflow:auto;overflow-x:hidden;color:#fff;background:radial-gradient(ellipse at 50% 0%,#37116a 0%,#0a0718 45%,#03040a 100%);font:15px system-ui,-apple-system,sans-serif;padding:env(safe-area-inset-top) 0 calc(82px + env(safe-area-inset-bottom));}
    #cf-app *{box-sizing:border-box} #cf-app .shell{width:min(100%,620px);margin:auto;padding:12px 14px 20px}
    #cf-app .top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
    #cf-app .brand{font-weight:950;letter-spacing:1.3px;font-size:16px} #cf-app .sub{font-size:9px;color:#c3a3ff;letter-spacing:2px}
    #cf-app .balance{border:1px solid #8f42ff;border-radius:14px;padding:8px 10px;background:#100a22;display:flex;gap:8px;align-items:center;font-weight:900;white-space:nowrap}
    #cf-app .coin{color:#ffd45c;font-size:20px;text-shadow:0 0 16px #ffb52e}
    #cf-app button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
    #cf-app .iconbtn{border:1px solid #a63cff;background:linear-gradient(135deg,#40116c,#160a2b);border-radius:13px;width:42px;height:42px;font-size:21px}
    #cf-app .hero{position:relative;isolation:isolate;overflow:hidden;border:1px solid #813cff;border-radius:23px;padding:24px 19px 20px;min-height:280px;background:radial-gradient(circle at 72% 40%,#5521a7 0%,#190b3b 35%,#070611 75%);box-shadow:0 0 30px #762aff22}
    #cf-app .hero:before{content:"";position:absolute;z-index:-1;width:210px;height:210px;right:-24px;top:5px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#c8baff,#643bff 28%,#1b0d5c 60%,transparent 70%);box-shadow:0 0 35px #8d3cff;opacity:.9}
    #cf-app .hero:after{content:"✦  ·  ✧  ·  ✦  ·  ✧  ·  ✦";position:absolute;z-index:-1;inset:10px;color:#dfc3ff;letter-spacing:13px;line-height:42px;opacity:.36;overflow:hidden}
    #cf-app .eyebrow{font-size:10px;letter-spacing:2px;color:#d9baff;font-weight:800}
    #cf-app h1{font-size:clamp(30px,8vw,46px);line-height:.98;margin:15px 0 10px;letter-spacing:-1px;text-shadow:0 0 24px #a44cff}
    #cf-app h1 span{color:#d59aff} #cf-app .hero p{max-width:66%;font-size:12px;line-height:1.5;color:#d6c8ef}
    #cf-app .primary{border:1px solid #e7a5ff;border-radius:14px;background:linear-gradient(100deg,#db26ff,#7c12ff 55%,#bd24ff);padding:13px 16px;font-weight:900;box-shadow:0 0 24px #a72aff65;width:100%}
    #cf-app .hero .primary{width:auto;min-width:155px;margin-top:6px}
    #cf-app .section-title{font-size:18px;font-weight:900;margin:20px 2px 11px}
    #cf-app .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    #cf-app .card{min-width:0;text-align:left;border:1px solid #633aa0;border-radius:17px;padding:13px;background:linear-gradient(145deg,#17102c,#080914);box-shadow:inset 0 0 18px #9b4dff0a}
    #cf-app .art{height:74px;display:grid;place-items:center;font-size:48px;background:radial-gradient(circle,#4b1d87 0%,#120923 65%,transparent 72%);filter:drop-shadow(0 0 10px #a23cff)}
    #cf-app .card strong{display:block;font-size:13px;margin-top:8px} #cf-app .card small{display:block;font-size:11px;color:#bdb0d7;margin-top:4px;line-height:1.35}
    #cf-app .widecard{display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #7545ba;border-radius:16px;padding:13px;background:linear-gradient(110deg,#241044,#0b0a19);width:100%;margin:9px 0}
    #cf-app .widecard .art{width:80px;flex:none;font-size:43px;height:70px}
    #cf-app .widecard strong{display:block;font-size:14px} #cf-app .widecard small{display:block;color:#c5b5e2;font-size:12px;margin-top:4px}
    #cf-app .gamepanel{border:1px solid #7545b9;border-radius:18px;padding:15px;background:#0b0918}
    #cf-app .fieldrow{display:flex;align-items:center;gap:8px;margin:12px 0}
    #cf-app .field{flex:1;min-width:0;background:#17102b;border:1px solid #6c3a9e;border-radius:11px;padding:11px;text-align:center;font-weight:800}
    #cf-app .secondary{border:1px solid #7445a7;background:#17102b;border-radius:11px;padding:10px 12px}
    #cf-app .gridmines{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:14px 0}
    #cf-app .mine{aspect-ratio:1;border-radius:10px;border:1px solid #5d76c5;background:linear-gradient(145deg,#263f75,#11172d);font-size:21px}
    #cf-app .mine.revealed{background:linear-gradient(145deg,#123f91,#071b43);box-shadow:0 0 12px #168dff}
    #cf-app .bigart{text-align:center;font-size:105px;padding:18px 0;text-shadow:0 0 28px #8c2fff}
    #cf-app .multiplier{text-align:center;font-size:48px;font-weight:950;color:#e59aff;text-shadow:0 0 25px #b22bff;margin:15px}
    #cf-app .wheel{width:min(68vw,260px);aspect-ratio:1;margin:12px auto;border-radius:50%;border:8px solid #ffca42;background:conic-gradient(#f42aff 0 45deg,#145bff 45deg 90deg,#12c99a 90deg 135deg,#ff8b16 135deg 180deg,#a328ff 180deg 225deg,#1376ff 225deg 270deg,#f32b77 270deg 315deg,#ffc22c 315deg);box-shadow:0 0 24px #ff9d22;display:grid;place-items:center;font-size:35px}
    #cf-app .profilehead{text-align:center;padding:18px;background:radial-gradient(circle at 50% 20%,#4d1d83,#0c0918 70%);border-radius:18px;border:1px solid #6538a0}
    #cf-app .avatar{font-size:68px;filter:drop-shadow(0 0 14px #a24cff)}
    #cf-app .bottom{position:fixed;z-index:5;bottom:0;left:0;right:0;padding:8px 4px calc(8px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:#080713f5;border-top:1px solid #69409b;backdrop-filter:blur(16px)}
    #cf-app .bottom button{border:0;background:transparent;color:#a69abf;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;padding:4px 0}
    #cf-app .bottom .navicon{font-size:21px} #cf-app .bottom button.active{color:#e49aff;text-shadow:0 0 12px #c32aff}
    #cf-app .toast{position:fixed;z-index:8;bottom:calc(76px + env(safe-area-inset-bottom));left:8%;right:8%;padding:12px;border:1px solid #8b43c6;border-radius:12px;background:#1a102bf5;text-align:center;display:none}
    #cf-app .toast.show{display:block}
    @media(max-width:360px){#cf-app .shell{padding:10px}#cf-app .hero{padding:20px 14px;min-height:250px}#cf-app .hero p{max-width:70%}#cf-app .card{padding:10px}#cf-app .art{height:62px;font-size:42px}}
  `;
  document.head.appendChild(style);
  document.body.classList.add('cf-code-app');
  const app=document.createElement('div'); app.id='cf-app';
  app.innerHTML='<div class="shell"><div class="top"><div><div class="brand">✦ COSMIC FORTUNE</div><div class="sub">ТВОЯ УДАЧА В КОСМОСЕ</div></div><div class="balance"><span class="coin">✪</span><span id="cf-balance">12 450</span><button class="iconbtn" data-go="profile" aria-label="Пополнить">＋</button></div><button class="iconbtn" data-go="bonuses" aria-label="Бонусы">🎁</button></div><div id="cf-content"></div></div><nav class="bottom" aria-label="Навигация"><button data-go="home"><span class="navicon">⌂</span>Главная</button><button data-go="games"><span class="navicon">🎮</span>Игры</button><button data-go="bonuses"><span class="navicon">🎁</span>Бонусы</button><button data-go="tournaments"><span class="navicon">🏆</span>Турниры</button><button data-go="profile"><span class="navicon">♙</span>Профиль</button></nav><div class="toast" id="cf-toast"></div>';
  document.body.appendChild(app);
  const content=app.querySelector('#cf-content'), toast=app.querySelector('#cf-toast');
  const games=[
    ['mines','💎','Космические мины','Найди кристаллы и избегай мин'],
    ['dice','🎲','Дайс','Испытай удачу с кубиками'],
    ['wheel','🎡','Колесо удачи','Крути колесо и множь выигрыш'],
    ['crash','🚀','Краш','Следи за ракетой и забирай выигрыш'],
    ['tournaments','🏆','Турниры','Соревнуйся и побеждай'],
    ['bonuses','🎁','Бонусы','Забирай награды каждый день']
  ];
  const say=t=>{toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)};
  const primary=(text,act)=>'<button class="primary" data-action="'+act+'">'+text+'</button>';
  function home(){return '<section class="hero"><div class="eyebrow">ТВОЯ ВСЕЛЕННАЯ ВЫИГРЫШЕЙ</div><h1>COSMIC<br><span>FORTUNE</span></h1><p>Проверь удачу среди звёзд. Выбирай игру и открывай новые галактики.</p>'+primary('✦ Играть  ›','games')+'</section><div class="section-title">✦ Популярные игры</div><div class="cards">'+games.slice(0,4).map(g=>'<button class="card" data-go="'+g[0]+'"><div class="art">'+g[1]+'</div><strong>'+g[2]+'</strong><small>'+g[3]+'</small></button>').join('')+'</div><button class="widecard" data-go="bonuses"><div class="art">🎁</div><div><strong>Ежедневный бонус</strong><small>Забирай награду каждый день</small></div> ›</button>'}
  function gameList(){return '<div class="section-title">ИГРЫ</div><div style="color:#c6b5e2;margin:0 2px 14px">ВЫБЕРИ СВОЮ УДАЧУ</div>'+games.map(g=>'<button class="widecard" data-go="'+g[0]+'"><div class="art">'+g[1]+'</div><div style="flex:1"><strong>'+g[2]+'</strong><small>'+g[3]+'</small></div>›</button>').join('')}
  function panel(title,body){return '<div class="section-title">'+title+'</div><section class="gamepanel">'+body+'</section>'}
  function mines(){return panel('💎 Космические мины','<div class="fieldrow"><div class="field">Ставка <b>100</b> ✦</div><div class="field">Мин <b>3</b></div></div><div class="gridmines">'+Array.from({length:25},(_,i)=>'<button class="mine" data-mine="'+i+'">✦</button>').join('')+'</div><p style="color:#c7b8df">Открывай клетки и находи кристаллы.</p>'+primary('Забрать выигрыш','collect'))}
  function crash(){return panel('🚀 Краш','<div class="multiplier" id="cf-mult">1.00x</div><div class="bigart">🚀</div><p style="text-align:center;color:#c5b6df">Успей забрать до остановки ракеты</p><div class="fieldrow"><div class="field">Ставка · 100 ✦</div><div class="field">Автовывод · 2.00x</div></div>'+primary('Начать раунд','crash'))}
  function wheel(){return panel('🎡 Колесо удачи','<div class="wheel" id="cf-wheel">✦</div><p style="text-align:center;color:#c7b8df">Вращай колесо и испытай удачу</p><div class="fieldrow"><div class="field">Ставка · 100 ✦</div></div>'+primary('Крутить за 100 ✦','spin'))}
  function dice(){return panel('🎲 Дайс','<div class="bigart">🎲</div><div class="cards"><button class="secondary" data-choice="Больше 7">Больше 7</button><button class="secondary" data-choice="Ровно 7">Ровно 7</button><button class="secondary" data-choice="Меньше 7">Меньше 7</button><button class="secondary" data-choice="Чётное">Чётное</button></div><div class="fieldrow"><div class="field">Ставка · 100 ✦</div></div>'+primary('Бросить кубики','roll'))}
  function bonuses(){return panel('🎁 Бонусы','<button class="widecard" data-action="daily"><div class="art">🎁</div><div style="flex:1"><strong>Ежедневная награда</strong><small>Получай бонус каждый день</small></div>›</button><button class="widecard" data-action="referral"><div class="art">👥</div><div><strong>Реферальная система</strong><small>Приглашай друзей и получай бонусы</small></div></button>')}
  function profile(){return '<div class="profilehead"><div class="avatar">🧑🏻‍🚀</div><strong>Космический путешественник</strong><p style="color:#bfb0d8">Твой профиль и достижения</p><div class="balance" style="justify-content:center">✪ <span id="cf-profile-balance">12 450</span> кредитов</div></div>'+panel('Мой аккаунт','<button class="widecard" data-action="history">📜　История игр　›</button><button class="widecard" data-go="bonuses">🎁　Бонусы　›</button><button class="widecard" data-action="settings">⚙　Настройки　›</button>')}
  function tournaments(){return panel('🏆 Турниры','<div class="bigart">🏆</div><h3 style="text-align:center">Космический кубок</h3><p style="text-align:center;color:#c4b5dd">Скоро: таблица лидеров и награды за достижения.</p>'+primary('К списку игр','games'))}
  const renderers={home,games,mines,crash,wheel,dice,bonuses,profile,tournaments};
  let current='home',selected='Больше 7',opened=0;
  function render(name){current=renderers[name]?name:'home';content.innerHTML=renderers[current]();app.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.go===current || (current==='mines'||current==='dice'||current==='wheel'||current==='crash')&&b.dataset.go==='games'));app.scrollTo({top:0,behavior:'instant'});}
  app.addEventListener('click',e=>{
    const go=e.target.closest('[data-go]'); if(go){render(go.dataset.go);return}
    const mine=e.target.closest('[data-mine]'); if(mine){if(mine.classList.contains('revealed'))return;mine.classList.add('revealed');mine.textContent=Math.random()<.23?'💣':'💎';if(mine.textContent==='💣')say('Мина! Это демонстрация интерфейса.');else{opened++;say('Кристалл найден! Открыто: '+opened)}return}
    const choice=e.target.closest('[data-choice]');if(choice){selected=choice.dataset.choice;app.querySelectorAll('[data-choice]').forEach(b=>b.style.borderColor=b===choice?'#e05cff':'#7445a7');return}
    const action=e.target.closest('[data-action]');if(!action)return;
    if(action.dataset.action==='games'){render('games');return}
    if(action.dataset.action==='spin'){const w=app.querySelector('#cf-wheel');if(w)w.style.transform='rotate('+(720+Math.floor(Math.random()*720))+'deg)';say('Демо-вращение. Для реальной игры нужен серверный расчёт.');return}
    if(action.dataset.action==='roll'){say('Выбрано: '+selected+'. Демо-бросок — без реального баланса.');return}
    if(action.dataset.action==='crash'){let m=1;const el=app.querySelector('#cf-mult');const timer=setInterval(()=>{m+=Math.random()*.25;if(el)el.textContent=m.toFixed(2)+'x';if(m>2.6){clearInterval(timer);say('Раунд завершён (демо).')}},180);return}
    if(action.dataset.action==='collect'){say('Выигрыш будет начисляться после подключения серверной игровой логики.');return}
    if(action.dataset.action==='daily'){say('Ежедневный бонус будет начисляться сервером после подключения API.');return}
    if(action.dataset.action==='referral'){say('Реферальная ссылка появится после подключения Telegram API.');return}
    if(action.dataset.action==='history'){say('История появится после подключения серверного API.');return}
    if(action.dataset.action==='settings'){say('Настройки будут добавлены в следующем обновлении.');return}
  });
  render('home');
})();