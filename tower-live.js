(()=> {
  const API='https://cosmic-fortune-api.onrender.com';
  const tg=window.Telegram?.WebApp;
  let round=null,busy=false;
  const $=s=>document.querySelector(s);
  const call=async(path,body)=>{
    const initData=tg?.initData||'';
    if(!initData)throw new Error('Открой Cosmic Fortune через Telegram.');
    const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Init-Data':initData},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({error:'Сервер вернул некорректный ответ.'}));
    if(!r.ok)throw new Error(d.error||'Ошибка сервера');return d;
  };
  const toast=msg=>{const t=$('#cf-toast')||$('#cf-app .toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}else alert(msg)};
  const balance=n=>{const el=$('#cf-balance');if(el)el.textContent=Number(n).toLocaleString('ru-RU')};
  const style=document.createElement('style');
  style.textContent='#cf-app .cf-coinflip-side.active{border:1px solid #6b4b92!important;background:#151027!important;box-shadow:none!important;animation:none!important;transform:none!important}#cf-app .cf-coinflip-side.is-selected{border:2px solid #ffe18a!important;background:linear-gradient(145deg,#80531e,#392052)!important;box-shadow:0 0 0 2px #ffda7833,0 0 20px #f4bf4dcc,inset 0 0 18px #ffd45b55!important;transform:translateY(-2px);animation:cfChoiceGlow 1.35s ease-in-out infinite alternate!important}#cf-app .cf-tower-building{display:flex!important;flex-direction:column-reverse!important;max-height:58vh;overflow-y:auto;scroll-behavior:smooth}#cf-app .cf-tower-floor{flex:none}#cf-app .cf-tower-door:disabled{opacity:.42;filter:grayscale(.7);pointer-events:none}#cf-app .cf-tower-door.cf-door-pending{outline:2px solid #fff0a5;box-shadow:0 0 22px #ffd15c}';
  document.head.appendChild(style);
  function resetCoinflip(){
    document.querySelectorAll('#cf-app .cf-coinflip-side').forEach(b=>{b.classList.remove('active','is-selected');b.setAttribute('aria-pressed','false')});
  }
  const observer=new MutationObserver(()=>{
    const shell=$('#cf-app .cf-coinflip-shell');if(shell)resetCoinflip();
    const building=$('#cf-tower-building');if(building&&!building.dataset.liveReady){
      building.dataset.liveReady='1';round=null;
      const floors=Number($('#cf-tower-floors')?.value||10);
      building.querySelectorAll('.cf-tower-floor').forEach(row=>{
        const i=Number(row.dataset.towerFloor);row.style.display=i<floors?'grid':'none';
        row.querySelectorAll('.cf-tower-door').forEach(b=>{b.disabled=i!==0;b.classList.remove('safe','trap','selected','cf-door-pending');b.setAttribute('aria-pressed','false')});
      });
      const play=$('.cf-tower-play');if(play){play.disabled=false;play.textContent='НАЧАТЬ ПОДЪЁМ'}
      const hint=$('.cf-tower-hint');if(hint)hint.textContent='Начни снизу. Выбирай по одной двери — результат увидишь сразу.';
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('change',e=>{
    if(e.target?.id!=='cf-tower-floors')return;
    round=null;const floors=Number(e.target.value),building=$('#cf-tower-building');
    building?.querySelectorAll('.cf-tower-floor').forEach(row=>{
      const i=Number(row.dataset.towerFloor);row.style.display=i<floors?'grid':'none';
      row.classList.remove('reached','failed','inactive');
      row.querySelectorAll('.cf-tower-door').forEach(b=>{b.disabled=i!==0;b.classList.remove('safe','trap','selected','cf-door-pending');b.setAttribute('aria-pressed','false')});
    });
    const p=$('#cf-tower-progress');if(p)p.textContent='ВЫБРАНО: 0 / '+floors+' ЭТАЖЕЙ';
    const result=$('#cf-game-result');if(result)result.textContent='Выбери «Начать подъём», затем открой дверь снизу.';
    const play=$('.cf-tower-play');if(play){play.disabled=false;play.textContent='НАЧАТЬ ПОДЪЁМ'}
  },true);
  document.addEventListener('click',async e=>{
    const target=e.target instanceof Element?e.target:null;if(!target)return;
    const coin=target.closest('#cf-app .cf-coinflip-side');
    if(coin){e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('#cf-app .cf-coinflip-side').forEach(b=>{const chosen=b===coin;b.classList.toggle('active',chosen);b.classList.toggle('is-selected',chosen);b.setAttribute('aria-pressed',String(chosen))});return}
    const start=target.closest('#cf-app [data-action="play-game"][data-game="tower"]');
    if(start){
      e.preventDefault();e.stopImmediatePropagation();if(busy||(round&&round.status==='active'))return;
      round=null;
      const bet=Number($('#cf-app #cf-bet')?.value),floors=Number($('#cf-tower-floors')?.value||10),traps=Number($('#cf-tower-traps')?.value||1);
      if(!Number.isSafeInteger(bet)||bet<1||bet>100000){toast('Ставка должна быть от 1 до 100 000.');return}
      busy=true;start.disabled=true;start.textContent='ЗАПУСКАЕМ…';
      try{
        const d=await call('/api/tower/start',{bet,floors,traps,requestId:crypto.randomUUID()});
        round={id:d.roundId,floors:d.floors,next:0,status:'active'};balance(d.balance);
        const building=$('#cf-tower-building');
        building?.querySelectorAll('.cf-tower-floor').forEach(row=>{
          const i=Number(row.dataset.towerFloor);row.style.display=i<floors?'grid':'none';
          row.classList.remove('reached','failed','inactive');
          row.querySelectorAll('.cf-tower-door').forEach(b=>{b.disabled=i!==0;b.classList.remove('safe','trap','selected','cf-door-pending');b.setAttribute('aria-pressed','false')});
        });
        const p=$('#cf-tower-progress');if(p)p.textContent='ЭТАЖ 1 / '+floors+' · ВЫБЕРИ ДВЕРЬ';
        const result=$('#cf-game-result');if(result)result.textContent='Ставка принята. Выбери одну из трёх дверей на нижнем этаже.';
        start.textContent='ИДЁТ ПОДЪЁМ';
        building?.querySelector('[data-tower-floor="0"]')?.scrollIntoView({behavior:'smooth',block:'center'});
      }catch(err){toast(err.message);start.disabled=false;start.textContent='НАЧАТЬ ПОДЪЁМ'}
      finally{busy=false}return;
    }
    const door=target.closest('#cf-app [data-action="tower-pick"]');
    if(door){
      e.preventDefault();e.stopImmediatePropagation();
      if(!round||round.status!=='active'||busy||door.disabled)return;
      const floor=Number(door.dataset.floor),lane=Number(door.dataset.lane);
      if(floor!==round.next){toast('Выбирай двери снизу вверх.');return}
      busy=true;door.classList.add('cf-door-pending');
      try{
        const d=await call('/api/tower/pick',{roundId:round.id,floor,lane});
        door.classList.remove('cf-door-pending');door.classList.add(d.safe?'safe':'trap','selected');door.disabled=true;door.setAttribute('aria-pressed','true');
        const row=door.closest('.cf-tower-floor');row?.classList.add(d.safe?'reached':'failed');balance(d.balance);
        const result=$('#cf-game-result'),progress=$('#cf-tower-progress'),hint=$('.cf-tower-hint');
        if(!d.safe){
          round.status='lost';
          if(progress)progress.textContent='💥 ПРОИГРЫШ · ЭТАЖ '+(floor+1);
          if(result)result.textContent=d.message+' Ставка потеряна.';
          if(hint)hint.textContent='Ловушка остановила подъём. Попробуй новый раунд.';
          const play=$('.cf-tower-play');if(play){play.disabled=false;play.textContent='НОВЫЙ РАУНД';}
          return;
        }
        round.next++;
        if(progress)progress.textContent=round.next===round.floors?'👑 ВЕРШИНА!':('ЭТАЖ '+round.next+' / '+round.floors+' · ДВЕРЬ ОТКРЫТА');
        if(d.status==='won'){
          round.status='won';
          if(result)result.textContent=d.message+' Выплата: '+Number(d.payout).toLocaleString('ru-RU')+' ✦';
          if(hint)hint.textContent='Ты прошёл все этажи и покорил башню!';
          const play=$('.cf-tower-play');if(play){play.disabled=false;play.textContent='СЫГРАТЬ ЕЩЁ РАЗ';}
        }else{
          if(result)result.textContent=d.message;
          if(hint)hint.textContent='Отлично! Следующая дверь уже ждёт выше.';
          const next=$('#cf-tower-building [data-tower-floor="'+round.next+'"]');
          next?.querySelectorAll('.cf-tower-door').forEach(b=>{b.disabled=false});
          next?.scrollIntoView({behavior:'smooth',block:'center'});
        }
      }catch(err){door.classList.remove('cf-door-pending');toast(err.message)}
      finally{busy=false}return;
    }
    const again=target.closest('#cf-app .cf-tower-play');
    if(again&&round&&round.status!=='active'){
      e.preventDefault();e.stopImmediatePropagation();round=null;
      const floors=Number($('#cf-tower-floors')?.value||10);
      $('#cf-tower-building')?.querySelectorAll('.cf-tower-floor').forEach(row=>{
        const i=Number(row.dataset.towerFloor);row.style.display=i<floors?'grid':'none';
        row.classList.remove('reached','failed','inactive');
        row.querySelectorAll('.cf-tower-door').forEach(b=>{b.disabled=i!==0;b.classList.remove('safe','trap','selected','cf-door-pending');b.setAttribute('aria-pressed','false')});
      });
      const p=$('#cf-tower-progress');if(p)p.textContent='ВЫБРАНО: 0 / '+floors+' ЭТАЖЕЙ';
      const result=$('#cf-game-result');if(result)result.textContent='Готов к новому подъёму.';
      again.textContent='НАЧАТЬ ПОДЪЁМ';return;
    }
  },true);
})();