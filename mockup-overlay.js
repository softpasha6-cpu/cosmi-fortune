(() => {
  const screens = ['home','games','mines','crash','wheel','dice','profile','bonuses'];
  const assetPath = name => '/cosmi-fortune/assets/screens/' + name + '.jpg';
  const images = {};
  Promise.all(screens.map(name => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { images[name] = img.src; resolve(true); };
    img.onerror = () => resolve(false);
    img.src = assetPath(name);
  }))).then(loaded => {
    // Start the image-based UI when the essential home screen is available.
    if (!loaded[0]) { console.error('Cosmic Fortune mockup: home.jpg failed to load from', assetPath('home')); return; }
    screens.forEach((name, i) => { if (!loaded[i]) console.error('Cosmic Fortune mockup image failed:', assetPath(name)); });
    const root = document.createElement('div');
    root.id = 'cf-mockup-app';
    root.innerHTML = '<div class="cf-frame"><img class="cf-art" alt="Cosmic Fortune"><div class="cf-hotspots"></div></div><div class="cf-toast" role="status"></div>';
    const style = document.createElement('style');
    style.textContent = `
      #cf-mockup-app{position:fixed;inset:0;z-index:2147483647;width:100vw;height:100dvh;background:#05040b;display:block;overflow:hidden;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;isolation:isolate;}
      body.cf-mockup-active>*:not(#cf-mockup-app){visibility:hidden!important;}
      body.cf-mockup-active{overflow:hidden!important;height:100%;}
      #cf-mockup-app .cf-frame{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;overflow:hidden;background:#05040b;}
      #cf-mockup-app .cf-art{display:block;width:100%;height:100%;object-fit:fill;object-position:center center;user-select:none;-webkit-user-drag:none;image-rendering:auto;transform:none;}
      #cf-mockup-app .cf-hotspots{position:absolute;inset:0}
      #cf-mockup-app .cf-hit{position:absolute;border:0;background:transparent;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
      #cf-mockup-app .cf-hit:focus-visible{outline:2px solid #e3a3ff;outline-offset:-3px;border-radius:10px}
      #cf-mockup-app .cf-toast{position:absolute;left:12%;right:12%;bottom:calc(env(safe-area-inset-bottom) + 18px);background:#171025f2;color:#fff;border:1px solid #8d40d9;border-radius:12px;padding:12px;text-align:center;font-size:13px;opacity:0;pointer-events:none;transition:opacity .15s}
      #cf-mockup-app .cf-toast.show{opacity:1}
    `;
    document.head.appendChild(style);
    document.body.appendChild(root);
    document.body.classList.add('cf-mockup-active');
    const art = root.querySelector('.cf-art');
    const layer = root.querySelector('.cf-hotspots');
    const toast = root.querySelector('.cf-toast');
    let current = 'home';
    let timer;
    const say = text => { toast.textContent = text; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 2100); };
    const hit = (label,x,y,w,h,fn) => {
      const b=document.createElement('button'); b.type='button'; b.className='cf-hit'; b.setAttribute('aria-label',label);
      Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
      b.addEventListener('click',fn); layer.appendChild(b);
    };
    function go(screen){ if (!images[screen]) { say('Экран загружается. Обнови страницу через несколько секунд.'); return; } current=screen; art.src=images[screen]; layer.replaceChildren(); draw(); }
    function nav(){ 
      hit('Главная',0,89,25,11,()=>go('home'));
      hit('Игры',25,89,25,11,()=>go('games'));
      hit('Бонусы',50,89,25,11,()=>go('bonuses'));
      hit('Профиль',75,89,25,11,()=>go('profile'));
    }
    function draw(){
      layer.replaceChildren();
      if(current==='home'){
        hit('Играть',4,72,92,12,()=>go('games'));
        hit('Подарок',79,14,16,8,()=>go('bonuses'));
        hit('Баланс',5,14,44,8,()=>say('Баланс обновляется через подключённый сервер.'));
        nav();
      } else if(current==='games'){
        hit('Космические мины',4,20,92,13,()=>go('mines'));
        hit('Кости',4,35,92,13,()=>go('dice'));
        hit('Колесо удачи',4,50,92,13,()=>go('wheel'));
        hit('Краш',4,65,92,13,()=>go('crash'));
        hit('Монетка',4,80,92,9,()=>say('Игра «Монетка» будет подключена следующим этапом.'));
        nav();
      } else if(current==='mines'){
        hit('Ставка',4,8,44,9,()=>say('Настройка ставки будет подключена к игровой логике.'));
        hit('Количество мин',51,8,44,9,()=>say('Настройка количества мин будет подключена.'));
        hit('Поле мин',5,20,90,49,()=>say('Поле готово к подключению игровой логики.'));
        hit('Забрать выигрыш',4,77,92,10,()=>say('Механика мин подключается следующим этапом.'));
        nav();
      } else if(current==='crash'){
        hit('История краша',70,3,27,8,()=>say('История раундов будет подключена к API.'));
        hit('Коэффициенты',4,50,92,10,()=>say('Коэффициенты выбраны. Серверная логика будет подключена отдельно.'));
        hit('Сумма ставки',4,62,43,9,()=>say('Настройка ставки будет подключена.'));
        hit('Автовывод',51,62,45,9,()=>say('Настройка автовывода будет подключена.'));
        hit('Забрать выигрыш',4,75,92,10,()=>say('Раунды Crash подключаются следующим этапом.'));
        nav();
      } else if(current==='wheel'){
        hit('Колесо',10,13,80,53,()=>say('Колесо готово к подключению игровой логики.'));
        hit('Крутить',4,67,92,10,()=>say('Результат колеса должен рассчитываться сервером.'));
        nav();
      } else if(current==='dice'){
        hit('Больше 7',4,48,29,8,()=>say('Выбран прогноз: больше 7.'));
        hit('Ровно 7',35,48,30,8,()=>say('Выбран прогноз: ровно 7.'));
        hit('Меньше 7',66,48,30,8,()=>say('Выбран прогноз: меньше 7.'));
        hit('Бросить кубики',4,68,92,10,()=>say('Кости подключим к серверному игровому API.'));
        nav();
      } else if(current==='profile'){
        hit('История игр',4,68,92,8,()=>say('История игр будет отображаться из API.'));
        hit('Бонусы',4,76,92,8,()=>go('bonuses'));
        hit('Настройки',4,84,92,8,()=>say('Настройки профиля появятся следующим этапом.'));
        nav();
      } else if(current==='bonuses'){
        hit('Забрать ежедневный бонус',33,17,63,12,()=>say('Бонус должен выдаваться сервером один раз в день.'));
        hit('Реферальная система',4,76,92,14,()=>say('Реферальная система будет подключена следующим этапом.'));
        nav();
      }
    }
    go('home');
  });
})();