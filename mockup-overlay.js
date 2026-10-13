(() => {
  // Code-rendered Cosmic Fortune Mini App: responsive, no screenshot assets required.
  const old = document.getElementById('cf-mockup-app');
  if (old) old.remove();
  const previousApp = document.getElementById('cf-app');
  if (previousApp) previousApp.remove();
  const previousStyle = document.getElementById('cf-app-style');
  if (previousStyle) previousStyle.remove();
  const style = document.createElement('style');
  style.id = 'cf-app-style';
  style.textContent = `
    body.cf-code-app>header,body.cf-code-app>main,body.cf-code-app>footer,body.cf-code-app>.bottom-nav{display:none!important}
    #cf-app{position:fixed;inset:0;z-index:2147483000;overflow:auto;overflow-x:hidden;color:#fff;background:radial-gradient(ellipse at 50% 0%,#37116a 0%,#0a0718 45%,#03040a 100%);font:15px system-ui,-apple-system,sans-serif;padding:env(safe-area-inset-top) 0 calc(82px + env(safe-area-inset-bottom));}
    #cf-app *{box-sizing:border-box} #cf-app .shell{width:min(100%,620px);margin:auto;padding:12px 14px 20px}
    #cf-app button,#cf-app input{touch-action:manipulation}
    #cf-app input{font-size:16px}
    #cf-app .home-actions{display:flex;gap:12px;align-items:center;margin-top:18px}
    #cf-app .bonus-icon{width:72px;height:72px;flex:none;border:1px solid #e9bc61;border-radius:22px;background:radial-gradient(circle at 35% 25%,#7c4aaf,#21103c 70%);font-size:38px;box-shadow:0 0 26px #bb8a3260;animation:cfBonusGlow 2.5s ease-in-out infinite}
    #cf-app .bonus-icon-label{font-size:11px;color:#e9d7ff;text-align:center;margin-top:5px}
    #cf-app .modal-backdrop{position:fixed;inset:0;z-index:20;background:#05030ddd;display:flex;align-items:center;justify-content:center;padding:18px}
    #cf-app .modal-card{width:min(100%,420px);max-height:90dvh;overflow:auto;position:relative;border:1px solid #a56af2;border-radius:24px;padding:18px;background:radial-gradient(ellipse at top,#38165d,#0b0818 70%);box-shadow:0 0 45px #a03dff55;text-align:center}
    #cf-app .modal-close{position:absolute;right:12px;top:10px;width:38px;height:38px;border:1px solid #7445a7;background:#211333;border-radius:12px;font-size:23px}
    @keyframes cfBonusGlow{0%,100%{box-shadow:0 0 18px #bb8a3240}50%{box-shadow:0 0 30px #e9bc6180}}
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
    #cf-app .game-avatar{height:156px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;border-radius:17px;border:1px solid #ffffff25;margin-bottom:14px;background:#100a25;box-shadow:inset 0 -25px 40px #03020a99,0 0 25px #9d4cff22}
    #cf-app .game-avatar:before,#cf-app .game-avatar:after{content:"";position:absolute;border-radius:50%;pointer-events:none}
    #cf-app .game-avatar:before{width:190px;height:190px;top:-80px;right:-35px;background:radial-gradient(circle,#ffffff33,transparent 68%)}
    #cf-app .game-avatar:after{width:150px;height:150px;bottom:-110px;left:-30px;border:1px solid #ffffff55;box-shadow:0 0 0 18px #ffffff08,0 0 0 38px #ffffff06}
    #cf-app .game-avatar .game-emoji{font-size:72px;filter:drop-shadow(0 9px 12px #0009);z-index:1}
    #cf-app .game-avatar .game-tag{position:absolute;left:10px;top:10px;font-size:10px;font-weight:900;letter-spacing:1px;border:1px solid #ffffff45;background:#05030a66;padding:5px 8px;border-radius:9px;z-index:2}
    #cf-app .game-avatar.slots{background:radial-gradient(circle at 50% 40%,#ffba49,#a92b3f 36%,#250c43 75%)}
    #cf-app .game-avatar.dice{background:radial-gradient(circle at 50% 40%,#45e9ff,#1455ac 40%,#080b32 78%)}
    #cf-app .game-avatar.roulette{background:radial-gradient(circle at 50% 40%,#f6d365,#b96b19 30%,#170a32 78%)}
    #cf-app .game-avatar.blackjack{background:radial-gradient(circle at 50% 40%,#65e0a1,#176a51 38%,#071e25 78%)}
    #cf-app .game-avatar .mini-wheel{width:112px;height:112px;border:7px solid #f8d36b;border-radius:50%;background:conic-gradient(#bd172f 0 30deg,#f4d8a0 30deg 60deg,#171923 60deg 90deg,#bd172f 90deg 120deg,#f4d8a0 120deg 150deg,#171923 150deg 180deg,#bd172f 180deg 210deg,#f4d8a0 210deg 240deg,#171923 240deg 270deg,#bd172f 270deg 300deg,#f4d8a0 300deg 330deg,#171923 330deg);display:grid;place-items:center;box-shadow:0 0 22px #ffcc4d66;animation:cfWheelIdle 18s linear infinite}
    #cf-app .game-avatar .mini-wheel span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f6d365;color:#45132b;font-size:18px}
    #cf-app .game-avatar .cards-art{display:flex;gap:0;transform:rotate(-7deg)}
    #cf-app .game-avatar .cards-art span{display:grid;place-items:center;width:58px;height:82px;border-radius:8px;background:#fff8e8;color:#a21a38;border:2px solid white;font-size:35px;font-weight:900;box-shadow:0 8px 12px #0008}
    #cf-app .game-avatar .cards-art span+span{margin-left:-17px;transform:translateY(8px) rotate(13deg);color:#121826}
    #cf-app .game-stage{position:relative;text-align:center;padding:18px 12px 15px;border:1px solid #ffffff25;border-radius:20px;overflow:hidden;margin-bottom:14px;background:radial-gradient(ellipse at top,#2b1650,#080711 76%)}
    #cf-app .game-stage .game-avatar{height:190px;margin:0 0 14px}
    #cf-app .game-stage.is-playing .game-emoji{animation:cfGameBounce .65s ease-in-out infinite alternate}
    #cf-app .game-stage.is-playing .mini-wheel{animation:cfWheelSpin 2.4s cubic-bezier(.12,.72,.12,1) forwards}
    #cf-app .game-stage.is-playing .cards-art{animation:cfCardDeal .8s ease-in-out infinite alternate}
    #cf-app .game-stage.is-playing.slots .game-emoji{animation:cfSlotShake .12s linear infinite}
    @keyframes cfWheelIdle{to{transform:rotate(360deg)}}
    @keyframes cfWheelSpin{to{transform:rotate(1440deg)}}
    @keyframes cfGameBounce{from{transform:translateY(-7px) rotate(-8deg) scale(.96)}to{transform:translateY(6px) rotate(8deg) scale(1.05)}}
    @keyframes cfSlotShake{0%{transform:translateY(-6px);filter:blur(1px)}50%{transform:translateY(6px);filter:blur(2px)}100%{transform:translateY(0);filter:none}}
    @keyframes cfCardDeal{from{transform:translateX(-15px) rotate(-12deg);opacity:.65}to{transform:translateX(8px) rotate(7deg);opacity:1}}
    #cf-app .art{height:100px;display:flex;align-items:flex-end;justify-content:flex-start;padding:9px;border-radius:12px;background-size:cover;background-position:center;position:relative;overflow:hidden;font-size:35px;text-shadow:0 2px 8px #000;box-shadow:inset 0 -48px 35px #080612cc,0 0 16px #8b39ff22}
    #cf-app .art:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#10061a10 10%,#090610cc 100%);pointer-events:none}
    #cf-app .art span{position:relative;z-index:1}
    #cf-app .art[data-art="mines"]{background-image:url("https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=85")}
    #cf-app .art[data-art="dice"]{background-image:url("https://images.unsplash.com/photo-1708919166614-60f3d21b4284?auto=format&fit=crop&w=900&q=85")}
    #cf-app .art[data-art="wheel"]{background-image:url("https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=900&q=85")}
    #cf-app .art[data-art="crash"]{background-image:url("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85")}
    #cf-app .art[data-art="tournaments"]{background-image:url("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85")}
    #cf-app .art[data-art="bonuses"]{background-image:url("https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=900&q=85")}
    #cf-app .hero{background-image:linear-gradient(90deg,#090611ee 0%,#10071cbb 52%,#10071c44 100%),url("https://images.unsplash.com/photo-1708919166614-60f3d21b4284?auto=format&fit=crop&w=1400&q=85");background-size:cover;background-position:center}
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
    #cf-app .spinwheel{transition:transform 3.2s cubic-bezier(.12,.72,.12,1)}
    #cf-app .anim-dice{animation:cfDice .75s ease-in-out}
    #cf-app .anim-slots{animation:cfSlots .8s ease-in-out}
    #cf-app .anim-cards{animation:cfCards .7s ease-out}
    #cf-app .anim-wheel{animation:cfWheelSpin 1.2s ease-in-out}
    @keyframes cfDice{0%,100%{transform:rotate(0) scale(1)}25%{transform:rotate(-18deg) scale(1.12)}50%{transform:rotate(18deg) scale(.9)}75%{transform:rotate(-8deg) scale(1.05)}}
    @keyframes cfSlots{0%{filter:blur(0);transform:translateY(0)}35%{filter:blur(4px);transform:translateY(-8px)}70%{filter:blur(2px);transform:translateY(5px)}100%{filter:none;transform:translateY(0)}}
    @keyframes cfCards{0%{opacity:.3;transform:translateY(-18px) rotate(-5deg)}100%{opacity:1;transform:translateY(0) rotate(0)}}
    @keyframes cfWheelSpin{0%{transform:rotate(0) scale(.95)}50%{transform:rotate(540deg) scale(1.08)}100%{transform:rotate(1080deg) scale(1)}}
    @media(max-width:360px){#cf-app .shell{padding:10px}#cf-app .hero{padding:20px 14px;min-height:250px}#cf-app .hero p{max-width:70%}#cf-app .card{padding:10px}#cf-app .art{height:62px;font-size:42px}}
  `;
  document.head.appendChild(style);
  document.body.classList.add('cf-code-app');
  const app=document.createElement('div'); app.id='cf-app';
  app.innerHTML='<div class="shell"><div class="top"><div><div class="brand">✦ COSMIC FORTUNE</div><div class="sub">ТВОЯ УДАЧА В КОСМОСЕ</div></div><div class="balance"><span class="coin">✪</span><span id="cf-balance">—</span><button class="iconbtn" data-go="profile" aria-label="Пополнить">＋</button></div><button class="iconbtn" data-go="bonuses" aria-label="Бонусы">🎁</button></div><div id="cf-content"></div></div><nav class="bottom" aria-label="Навигация"><button data-go="home"><span class="navicon">⌂</span>Главная</button><button data-go="games" onclick="window.cfNavigate(this.dataset.go)"><span class="navicon">🎮</span>Игры</button><button data-go="bonuses"><span class="navicon">🎁</span>Бонусы</button><button data-go="tournaments"><span class="navicon">🏆</span>Турниры</button><button data-go="profile"><span class="navicon">♙</span>Профиль</button></nav><div class="toast" id="cf-toast"></div>';
  document.body.appendChild(app);
  const content=app.querySelector('#cf-content'), toast=app.querySelector('#cf-toast');
  const games=[
    ['slots','🎰','Космические слоты','Три барабана · серверный расчёт'],
    ['dice','🎲','Кости','Бросок на сервере · выплата 2×'],
    ['roulette','🎡','Рулетка','Красное или чёрное'],
    ['blackjack','🃏','Блэкджек','Сравни карты с дилером']
  ];
  const API_BASE='https://cosmic-fortune-api.onrender.com';
  const telegram=window.Telegram&&window.Telegram.WebApp;
  if(telegram){try{telegram.ready();telegram.expand()}catch{}}
  const initData=()=>telegram&&typeof telegram.initData==='string'?telegram.initData:'';
  async function api(path,options={}){
    const signed=initData();
    if(!signed) throw new Error('Открой мини-приложение через Telegram для входа в аккаунт.');
    const response=await fetch(API_BASE+path,{...options,headers:{'Content-Type':'application/json','X-Telegram-Init-Data':signed,...(options.headers||{})}});
    const data=await response.json().catch(()=>({error:'Некорректный ответ сервера'}));
    if(!response.ok) throw new Error(data.error||'Ошибка сервера');
    return data;
  }
  const formatBalance=n=>Number(n).toLocaleString('ru-RU');
  const say=t=>{toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200)};
  async function refreshAccount(){
    try{
      const data=await api('/api/me');
      const balance=app.querySelector('#cf-balance');
      if(balance) balance.textContent=formatBalance(data.player.balance);
      const profileBalance=app.querySelector('#cf-profile-balance');
      if(profileBalance) profileBalance.textContent=formatBalance(data.player.balance);
      const title=app.querySelector('.profilehead strong');
      if(title&&data.player.firstName) title.textContent=data.player.firstName;
    }catch(error){
      const balance=app.querySelector('#cf-balance');
      if(balance) balance.textContent='—';
      if(initData()) say('Не удалось загрузить аккаунт: '+error.message);
    }
  }
  const primary=(text,act)=>'<button class="primary" data-action="'+act+'">'+text+'</button>';
  function home(){return '<section class="hero"><div class="eyebrow">ТВОЯ ВСЕЛЕННАЯ ВЫИГРЫШЕЙ</div><h1>COSMIC<br><span>FORTUNE</span></h1><p>Играй в космические игры, получай виртуальные кредиты и забирай ежедневные бонусы.</p><button type="button" class="primary" data-go="games" onclick="window.cfNavigate(this.dataset.go)">✦ Играть　›</button></section><div class="home-actions"><div><button type="button" class="bonus-icon" data-action="open-bonus-wheel" aria-label="Открыть бонусную рулетку">🎡</button><div class="bonus-icon-label">Рулетка дня</div></div><button type="button" class="widecard" data-go="bonuses" style="margin:0;flex:1;min-height:72px"><div class="art">🎁</div><div><strong>Бонусы и награды</strong><small>Ежедневная награда</small></div> ›</button></div>'}
  function gameList(){return '<div class="section-title">ИГРЫ</div><div style="color:#c6b5e2;margin:0 2px 14px">ВЫБЕРИ СВОЮ УДАЧУ</div>'+games.map(g=>'<button class="widecard" data-go="'+g[0]+'"><div class="art" data-art="'+g[0]+'"><span>'+g[1]+'</span></div><div style="flex:1"><strong>'+g[2]+'</strong><small>'+g[3]+'</small></div>›</button>').join('')+'<div class="section-title">🎁 Бесплатная рулетка</div>'+bonusWheelCard()}
  function panel(title,body){return '<div class="section-title">'+title+'</div><section class="gamepanel">'+body+'</section>'}
  function gameAvatar(game){
    const views={
      slots:'<span class="game-tag">SLOTS</span><span class="game-emoji">🎰</span>',
      dice:'<span class="game-tag">DICE</span><span class="game-emoji">🎲</span>',
      roulette:'<span class="game-tag">ROULETTE</span><div class="mini-wheel"><span>✦</span></div>',
      blackjack:'<span class="game-tag">BLACKJACK</span><div class="cards-art"><span>♥</span><span>♠</span></div>'
    };
    return '<div class="game-avatar '+game+'">'+(views[game]||'<span class="game-emoji">🎮</span>')+'</div>';
  }
  function gamePanel(game,title,art,description,extra=''){
    return panel(title,'<div class="game-stage '+game+'" id="cf-game-stage">'+gameAvatar(game)+'<p style="color:#c5b6df;margin:8px 0 0">'+description+'</p></div>'+extra+'<div class="fieldrow"><label class="field">Ставка <input id="cf-bet" type="number" min="1" max="100000" value="100" style="width:100%;margin-top:8px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:8px;padding:8px;text-align:center"></label></div><div id="cf-game-result" style="text-align:center;color:#e6d8ff;min-height:24px;margin:10px 0"></div><button class="primary" data-action="play-game" data-game="'+game+'">Играть</button>');
  }
  function slots(){return gamePanel('slots','🎰 Космические слоты','🎰','Символы и выплаты рассчитываются на сервере.')}
  function dice(){return gamePanel('dice','🎲 Кости','🎲','Сервер бросает кубик. На 4–6 выплата 2×, иначе ставка проиграна.')}
  function roulette(){return gamePanel('roulette','🎡 Рулетка','🎡','Выбери цвет до запуска раунда.','<div class="cards"><button class="secondary" data-choice="red">🔴 Красное</button><button class="secondary" data-choice="black">⚫ Чёрное</button></div>')}
  function blackjack(){return gamePanel('blackjack','🃏 Блэкджек','🃏','Сервер раздаёт карты и рассчитывает результат.')}

  function bonusWheelCard(){return '<section class="gamepanel" style="text-align:center"><div class="wheel spinwheel" id="cf-bonus-wheel">🎡</div><p style="color:#c5b6df">Бесплатно раз в день. Может выпасть 25, 50, 100 или 250 кредитов — либо ничего.</p>'+primary('🎡 Крутить бесплатно','bonus-wheel')+'<div id="cf-bonus-result" style="min-height:26px;margin-top:12px;color:#ffe09a"></div></section>'}
  function openBonusWheel(){
    if(app.querySelector('#cf-wheel-modal'))return;
    app.insertAdjacentHTML('beforeend','<div class="modal-backdrop" id="cf-wheel-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-label="Бонусная рулетка"><button type="button" class="modal-close" data-action="close-bonus-wheel" aria-label="Закрыть">×</button><div class="section-title">🎁 Бонусная рулетка дня</div>'+bonusWheelCard()+'</section></div>');
  }
  function bonuses(){return '<div class="section-title">🎁 Бонусы и награды</div>'+bonusWheelCard()+'<p style="text-align:center;color:#c5b6df;font-size:12px">Одна попытка в день на аккаунт Telegram. Результат и начисление определяет сервер.</p>'}
  function profile(){return '<div class="profilehead"><div class="avatar">🧑🏻‍🚀</div><strong>Аккаунт Telegram</strong><p style="color:#bfb0d8">Виртуальный баланс и история раундов</p><div class="balance" style="justify-content:center">✪ <span id="cf-profile-balance">—</span> кредитов</div></div>'+panel('Мой аккаунт','<button class="widecard" data-action="history">📜　История игр　›</button><button class="widecard" data-go="games">🎮　Игры　›</button>')}
  function tournaments(){return panel('🏆 Турниры','<div class="bigart">🏆</div><p style="text-align:center;color:#c4b5dd">Турнирная таблица ещё не подключена. Игровые раунды в слотах, костях, рулетке и блэкджеке уже отправляются на сервер.</p>'+primary('К списку игр','games'))}
  const renderers={home,games:gameList,slots,dice,roulette,blackjack,bonuses,profile,tournaments};
  let current='home',selected='Больше 7',opened=0;
  function render(name){current=renderers[name]?name:'home';content.innerHTML=renderers[current]();app.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.go===current || (current==='mines'||current==='dice'||current==='wheel'||current==='crash')&&b.dataset.go==='games'));app.scrollTo({top:0,behavior:'instant'});}
  window.cfNavigate=function(name){try{render(name)}catch(error){console.error('Navigation failed',error);say('Не удалось открыть раздел. Перезапусти приложение.')}};
  // Capture taps before Telegram WebView or underlying page handlers can swallow them.
  document.addEventListener('click', function cosmicNavigationCapture(e){
    const target=e.target instanceof Element?e.target:null;
    if(!target)return;
    const go=target.closest('#cf-app [data-go]');
    if(go){
      e.preventDefault();
      e.stopPropagation();
      const destination=go.dataset.go;
      if(renderers[destination]) render(destination);
      return;
    }
    const openWheel=target.closest('#cf-app [data-action="open-bonus-wheel"]');
    if(openWheel){e.preventDefault();e.stopPropagation();openBonusWheel();}
  }, true);
  app.addEventListener('pointerup',e=>{
    const target=e.target instanceof Element?e.target:null;
    const button=target?.closest('#cf-app [data-go]');
    if(button){e.preventDefault();e.stopPropagation();window.cfNavigate(button.dataset.go);}
  },true);
  app.addEventListener('click',async e=>{
    const close=e.target.closest('[data-action="close-bonus-wheel"]');if(close){app.querySelector('#cf-wheel-modal')?.remove();return}
    if(e.target.id==='cf-wheel-modal'){e.target.remove();return}
    const go=e.target.closest('[data-go]'); if(go){e.preventDefault();render(go.dataset.go);return}
    const mine=e.target.closest('[data-mine]'); if(mine){say('Эта игра ещё не подключена к серверу.');return}
    const choice=e.target.closest('[data-choice]');if(choice){selected=choice.dataset.choice;app.querySelectorAll('[data-choice]').forEach(b=>b.style.borderColor=b===choice?'#e05cff':'#7445a7');return}
    const action=e.target.closest('[data-action]');if(!action)return;
    if(action.dataset.action==='games'){render('games');return}
    if(action.dataset.action==='open-bonus-wheel'){openBonusWheel();return}
    if(action.dataset.action==='bonus-wheel'){
      const button=action, wheel=app.querySelector('#cf-bonus-wheel'), result=app.querySelector('#cf-bonus-result');
      button.disabled=true;button.textContent='Колесо вращается…';
      if(wheel){wheel.style.transform='rotate(0deg)';void wheel.offsetWidth;wheel.style.transform='rotate('+(1440+Math.floor(Math.random()*1080))+'deg)';}
      try{
        const data=await api('/api/bonus-wheel',{method:'POST',body:JSON.stringify({requestId:crypto.randomUUID()})});
        if(result)result.textContent='🎉 '+(data.outcome?.label||'Результат')+' · баланс '+formatBalance(data.balance)+' ✦';
        const balance=app.querySelector('#cf-balance');if(balance)balance.textContent=formatBalance(data.balance);
        const profileBalance=app.querySelector('#cf-profile-balance');if(profileBalance)profileBalance.textContent=formatBalance(data.balance);
        say(data.outcome?.label||'Бонус получен');
      }catch(error){if(result)result.textContent=error.message;say(error.message)}
      finally{button.disabled=false;button.textContent='🎡 Крутить бесплатно'}
      return
    }
    if(action.dataset.action==='play-game'){
      const game=action.dataset.game;
      const bet=Number(app.querySelector('#cf-bet')?.value);
      const result=app.querySelector('#cf-game-result');
      if(!Number.isSafeInteger(bet)||bet<1||bet>100000){say('Ставка должна быть от 1 до 100 000.');return}
      const body={game,bet,requestId:crypto.randomUUID()};
      const stage=app.querySelector('#cf-game-stage');
      if(stage){stage.classList.add('is-playing');}
      const art=app.querySelector('.bigart');
      if(art){art.classList.remove('anim-dice','anim-slots','anim-cards','anim-wheel');void art.offsetWidth;art.classList.add(game==='dice'?'anim-dice':game==='slots'?'anim-slots':game==='roulette'?'anim-wheel':'anim-cards');}
      if(game==='roulette'){
        if(!['red','black'].includes(selected)){say('Сначала выбери красное или чёрное.');return}
        body.choice=selected;
      }
      action.disabled=true;action.textContent='Раунд…';
      try{
        const data=await api('/api/game',{method:'POST',body:JSON.stringify(body)});
        const balance=app.querySelector('#cf-balance');if(balance)balance.textContent=formatBalance(data.balance);
        const profileBalance=app.querySelector('#cf-profile-balance');if(profileBalance)profileBalance.textContent=formatBalance(data.balance);
        const out=data.outcome||{};
        let message=out.message||'Раунд завершён';
        if(out.reels)message+=' · '+out.reels.join(' ');
        if(out.roll)message+=' · выпало '+out.roll;
        if(out.number!==undefined)message+=' · номер '+out.number+' ('+out.color+')';
        if(out.playerTotal!==undefined)message+=' · ты '+out.playerTotal+' / дилер '+out.dealerTotal;
        if(result)result.textContent=message+' Ставка: '+formatBalance(data.bet)+' · выплата: '+formatBalance(data.payout)+' ✦';
        await refreshAccount();
        const me=await api('/api/me');
        if(current==='profile')renderHistoryInProfile(me.history||[]);
      }catch(error){if(result)result.textContent=error.message;say(error.message)}
      finally{app.querySelector('#cf-game-stage')?.classList.remove('is-playing');action.disabled=false;action.textContent='Играть'}
      return
    }
    if(action.dataset.action==='roll'){say('Открой раздел «Кости» для игры.');return}
    if(['crash','collect','daily','referral'].includes(action.dataset.action)){say('Эта функция пока не подключена к серверу.');return}
    if(action.dataset.action==='history'){
      try{
        const data=await api('/api/me');
        let target=app.querySelector('#cf-history-list');
        if(!target){content.insertAdjacentHTML('beforeend','<div class="section-title">История раундов</div><div id="cf-history-list"></div>');target=app.querySelector('#cf-history-list')}
        target.innerHTML=data.history.length?data.history.slice(0,10).map(r=>'<div class="widecard"><div style="flex:1"><strong>'+({slots:'🎰 Слоты',dice:'🎲 Кости',roulette:'🎡 Рулетка',blackjack:'🃏 Блэкджек'}[r.game]||r.game)+'</strong><small>Ставка '+formatBalance(r.bet)+' · выплата '+formatBalance(r.payout)+' ✦</small></div></div>').join(''):'<p style="color:#c5b6df">Раундов пока нет.</p>';
      }catch(error){say(error.message)}
      return
    }
    if(action.dataset.action==='daily'){say('Ежедневный бонус пока не реализован — кнопка отключена.');return}
    if(action.dataset.action==='referral'){say('Реферальная система пока не реализована.');return}
    if(action.dataset.action==='settings'){say('Настройки пока не реализованы.');return}
  });
  function renderHistoryInProfile(rows){
    const box=app.querySelector('#cf-history-list');if(!box)return;
    box.innerHTML=rows.length?rows.slice(0,10).map(r=>'<div class="fieldrow"><div class="field">'+({slots:'🎰 Слоты',dice:'🎲 Кости',roulette:'🎡 Рулетка',blackjack:'🃏 Блэкджек'}[r.game]||r.game)+' · ставка '+formatBalance(r.bet)+' · выплата '+formatBalance(r.payout)+' ✦</div></div>').join(''):'<p style="color:#c5b6df">Раундов пока нет.</p>';
  }
  render('home');
  refreshAccount();
})();