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
    @keyframes cfDice{0%,100%{transform:rotate(0) scale(1)}25%{transform:rotate(-18deg) scale(1.12)}50%{transform:rotate(18deg) scale(.9)}75%{transform:rotate(-8deg) scale(1.05)}}
    @keyframes cfSlots{0%{filter:blur(0);transform:translateY(0)}35%{filter:blur(4px);transform:translateY(-8px)}70%{filter:blur(2px);transform:translateY(5px)}100%{filter:none;transform:translateY(0)}}
    @keyframes cfCards{0%{opacity:.3;transform:translateY(-18px) rotate(-5deg)}100%{opacity:1;transform:translateY(0) rotate(0)}}
    @media(max-width:360px){#cf-app .shell{padding:10px}#cf-app .hero{padding:20px 14px;min-height:250px}#cf-app .hero p{max-width:70%}#cf-app .card{padding:10px}#cf-app .art{height:62px;font-size:42px}}
  `;
  document.head.appendChild(style);
  document.body.classList.add('cf-code-app');
  const app=document.createElement('div'); app.id='cf-app';
  app.innerHTML='<div class="shell"><div class="top"><div><div class="brand">✦ COSMIC FORTUNE</div><div class="sub">ТВОЯ УДАЧА В КОСМОСЕ</div></div><div class="balance"><span class="coin">✪</span><span id="cf-balance">—</span><button class="iconbtn" data-go="profile" aria-label="Пополнить">＋</button></div><button class="iconbtn" data-go="bonuses" aria-label="Бонусы">🎁</button></div><div id="cf-content"></div></div><nav class="bottom" aria-label="Навигация"><button data-go="home"><span class="navicon">⌂</span>Главная</button><button data-go="games"><span class="navicon">🎮</span>Игры</button><button data-go="bonuses"><span class="navicon">🎁</span>Бонусы</button><button data-go="tournaments"><span class="navicon">🏆</span>Турниры</button><button data-go="profile"><span class="navicon">♙</span>Профиль</button></nav><div class="toast" id="cf-toast"></div>';
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
  function home(){return '<section class="hero"><div class="eyebrow">ТВОЯ ВСЕЛЕННАЯ ВЫИГРЫШЕЙ</div><h1>COSMIC<br><span>FORTUNE</span></h1><p>Играй в космические игры, получай виртуальные кредиты и забирай ежедневные бонусы.</p>'+primary('✦ Играть  ›','games')+'</section><div class="section-title">🎁 Бонусная рулетка дня</div>'+bonusWheelCard()+'<div class="section-title">✦ Ежедневные бонусы</div><button class="widecard" data-go="bonuses"><div class="art">🎁</div><div><strong>Бонусы и награды</strong><small>Ежедневная бесплатная попытка</small></div> ›</button>'}
  function gameList(){return '<div class="section-title">ИГРЫ</div><div style="color:#c6b5e2;margin:0 2px 14px">ВЫБЕРИ СВОЮ УДАЧУ</div>'+games.map(g=>'<button class="widecard" data-go="'+g[0]+'"><div class="art" data-art="'+g[0]+'"><span>'+g[1]+'</span></div><div style="flex:1"><strong>'+g[2]+'</strong><small>'+g[3]+'</small></div>›</button>').join('')+'<div class="section-title">🎁 Бесплатная рулетка</div>'+bonusWheelCard()}
  function panel(title,body){return '<div class="section-title">'+title+'</div><section class="gamepanel">'+body+'</section>'}
  function gamePanel(game,title,art,description,extra=''){
    return panel(title,'<div class="bigart">'+art+'</div><p style="text-align:center;color:#c5b6df">'+description+'</p>'+extra+'<div class="fieldrow"><label class="field">Ставка <input id="cf-bet" type="number" min="1" max="100000" value="100" style="width:100%;margin-top:8px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:8px;padding:8px;text-align:center"></label></div><div id="cf-game-result" style="text-align:center;color:#e6d8ff;min-height:24px;margin:10px 0"></div><button class="primary" data-action="play-game" data-game="'+game+'">Играть</button>');
  }
  function slots(){return gamePanel('slots','🎰 Космические слоты','🎰','Символы и выплаты рассчитываются на сервере.')}
  function dice(){return gamePanel('dice','🎲 Кости','🎲','Сервер бросает кубик. На 4–6 выплата 2×, иначе ставка проиграна.')}
  function roulette(){return gamePanel('roulette','🎡 Рулетка','🎡','Выбери цвет до запуска раунда.','<div class="cards"><button class="secondary" data-choice="red">🔴 Красное</button><button class="secondary" data-choice="black">⚫ Чёрное</button></div>')}
  function blackjack(){return gamePanel('blackjack','🃏 Блэкджек','🃏','Сервер раздаёт карты и рассчитывает результат.')}

  function bonusWheelCard(){return '<section class="gamepanel" style="text-align:center"><div class="wheel spinwheel" id="cf-bonus-wheel">🎁</div><p style="color:#c5b6df">Бесплатно раз в день. Может выпасть 25, 50, 100 или 250 кредитов — либо ничего.</p>'+primary('🎡 Крутить бесплатно','bonus-wheel')+'<div id="cf-bonus-result" style="min-height:26px;margin-top:12px;color:#ffe09a"></div></section>'}
  function bonuses(){return '<div class="section-title">🎁 Бонусы и награды</div>'+bonusWheelCard()+'<p style="text-align:center;color:#c5b6df;font-size:12px">Одна попытка в день на аккаунт Telegram. Результат и начисление определяет сервер.</p>'}
  function profile(){return '<div class="profilehead"><div class="avatar">🧑🏻‍🚀</div><strong>Аккаунт Telegram</strong><p style="color:#bfb0d8">Виртуальный баланс и история раундов</p><div class="balance" style="justify-content:center">✪ <span id="cf-profile-balance">—</span> кредитов</div></div>'+panel('Мой аккаунт','<button class="widecard" data-action="history">📜　История игр　›</button><button class="widecard" data-go="games">🎮　Игры　›</button>')}
  function tournaments(){return panel('🏆 Турниры','<div class="bigart">🏆</div><p style="text-align:center;color:#c4b5dd">Турнирная таблица ещё не подключена. Игровые раунды в слотах, костях, рулетке и блэкджеке уже отправляются на сервер.</p>'+primary('К списку игр','games'))}
  const renderers={home,games,slots,dice,roulette,blackjack,bonuses,profile,tournaments};
  let current='home',selected='Больше 7',opened=0;
  function render(name){current=renderers[name]?name:'home';content.innerHTML=renderers[current]();app.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.go===current || (current==='mines'||current==='dice'||current==='wheel'||current==='crash')&&b.dataset.go==='games'));app.scrollTo({top:0,behavior:'instant'});}
  app.addEventListener('click',async e=>{
    const go=e.target.closest('[data-go]'); if(go){render(go.dataset.go);return}
    const mine=e.target.closest('[data-mine]'); if(mine){say('Эта игра ещё не подключена к серверу.');return}
    const choice=e.target.closest('[data-choice]');if(choice){selected=choice.dataset.choice;app.querySelectorAll('[data-choice]').forEach(b=>b.style.borderColor=b===choice?'#e05cff':'#7445a7');return}
    const action=e.target.closest('[data-action]');if(!action)return;
    if(action.dataset.action==='games'){render('games');return}
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
      const art=app.querySelector('.bigart');
      if(art){art.classList.remove('anim-dice','anim-slots','anim-cards');void art.offsetWidth;art.classList.add(game==='dice'?'anim-dice':game==='slots'?'anim-slots':'anim-cards');}
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
      finally{action.disabled=false;action.textContent='Играть'}
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