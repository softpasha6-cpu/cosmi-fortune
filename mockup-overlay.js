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
      #cf-mockup-app{position:fixed;inset:0;z-index:9999;background:#05040b;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:system-ui,sans-serif}
      #cf-mockup-app .cf-frame{position:relative;width:min(100vw,calc(100dvh * .56));height:min(100dvh,calc(100vw / .56));aspect-ratio:300/545;overflow:hidden}
      #cf-mockup-app .cf-art{display:block;width:100%;height:100%;object-fit:fill;user-select:none;-webkit-user-drag:none}
      #cf-mockup-app .cf-hotspots{position:absolute;inset:0}
      #cf-mockup-app .cf-hit{position:absolute;border:0;background:transparent;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
      #cf-mockup-app .cf-hit:focus-visible{outline:2px solid #e3a3ff;outline-offset:-3px;border-radius:10px}
      #cf-mockup-app .cf-toast{position:absolute;left:12%;right:12%;bottom:calc(env(safe-area-inset-bottom) + 18px);background:#171025f2;color:#fff;border:1px solid #8d40d9;border-radius:12px;padding:12px;text-align:center;font-size:13px;opacity:0;pointer-events:none;transition:opacity .15s}
      #cf-mockup-app .cf-toast.show{opacity:1}
    `;
    document.head.appendChild(style);
    document.body.appendChild(root);
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
      hit('Главная',0,90,25,10,()=>go('home'));
      hit('Игры',25,90,25,10,()=>go('games'));
      hit('Бонусы',50,90,25,10,()=>go('bonuses'));
      hit('Профиль',75,90,25,10,()=>go('profile'));
    }
    function draw(){
      layer.replaceChildren();
      if(current==='home'){
        hit('Играть',4,75,92,11,()=>go('games'));
        hit('Подарок',79,12,16,8,()=>go('bonuses'));
        hit('Баланс',5,12,44,8,()=>say('Баланс обновляется через подключённый сервер.'));
        nav();
      } else if(current==='games'){
        hit('Космические мины',4,17,92,14,()=>go('mines'));
        hit('Кости',4,32,92,14,()=>go('dice'));
        hit('Колесо удачи',4,47,92,14,()=>go('wheel'));
        hit('Краш',4,62,92,14,()=>go('crash'));
        hit('Монетка',4,77,92,11,()=>say('Игра «Монетка» будет подключена следующим этапом.'));
        nav();
      } else if(current==='mines'){
        hit('Поле мин',5,29,90,47,()=>say('Поле готово к подключению игровой логики.'));
        hit('Забрать выигрыш',4,80,92,10,()=>say('Механика мин подключается следующим этапом.'));
      } else if(current==='crash'){
        hit('История краша',70,10,27,8,()=>say('История раундов будет подключена к API.'));
        hit('Забрать выигрыш',4,80,92,10,()=>say('Раунды Crash подключаются следующим этапом.'));
      } else if(current==='wheel'){
        hit('Колесо',10,18,80,52,()=>say('Колесо готово к подключению игровой логики.'));
        hit('Крутить',4,80,92,10,()=>say('Результат колеса должен рассчитываться сервером.'));
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