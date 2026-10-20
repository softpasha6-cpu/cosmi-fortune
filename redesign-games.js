(() => {
const s=document.createElement('style');s.id='cf-redesign-style';s.textContent=`
#cf-app .cf-home-page.cf-home-static{min-height:0;background:none!important}
#cf-app .cf-home-page.cf-home-static .cf-home-poster-wrap{display:none!important}
#cf-app .cf-home-redesign{padding:8px 0 20px}
#cf-app .cf-home-hero{overflow:hidden;min-height:205px;border:1px solid #7650bd;border-radius:22px;padding:22px 18px;background:radial-gradient(circle at 85% 25%,#7041bd,#261044 40%,#0c0818 78%);box-shadow:0 10px 30px #0005}
#cf-app .cf-home-kicker{color:#f5d889;font-size:10px;letter-spacing:2px;font-weight:900}
#cf-app .cf-home-hero h1{font-size:32px;line-height:1.05;margin:14px 0 8px;max-width:80%}
#cf-app .cf-home-hero p{font-size:12px;line-height:1.5;color:#d9c9f1;max-width:75%;margin:0 0 16px}
#cf-app .cf-home-hero .primary{width:auto;min-width:150px}
#cf-app .cf-home-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
#cf-app .cf-home-shortcut{display:flex;align-items:center;gap:10px;min-height:72px;text-align:left;padding:11px;border:1px solid #62408c;border-radius:16px;background:linear-gradient(135deg,#211239,#0b0916)}
#cf-app .shortcut-icon{font-size:28px;flex:none}
#cf-app .cf-home-shortcut strong,#cf-app .cf-home-shortcut small{display:block}
#cf-app .cf-home-shortcut strong{font-size:13px}#cf-app .cf-home-shortcut small{color:#c3b2dc;font-size:10px;margin-top:3px}
#cf-app .cf-games-page{position:relative;min-height:calc(100dvh - 105px);background:transparent!important;overflow:visible!important}
#cf-app .cf-games-wallpaper,#cf-app .cf-games-live-balance,#cf-app .cf-image-nav,#cf-app .cf-games-topup{display:none!important}
#cf-app .cf-games-scroll{position:relative!important;inset:auto!important;overflow:visible!important;height:auto!important;max-height:none!important;padding:8px 0 24px!important}
#cf-app .cf-games-section-title{position:relative!important;margin:4px 2px 16px!important;color:#fff!important;font-size:21px!important;font-weight:950!important;text-align:left!important}
#cf-app .cf-games-section-title small{display:block;margin-top:6px;color:#c8b8e2;font-size:12px;font-weight:500}
#cf-app .cf-games-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;padding:0 0 18px!important}
#cf-app .cf-game-tile{position:relative!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:0!important;min-width:0!important;min-height:185px!important;padding:0!important;overflow:hidden!important;text-align:left!important;border:1px solid #62408d!important;border-radius:17px!important;background:linear-gradient(145deg,#211436,#0a0813)!important;box-shadow:0 7px 20px #0004!important}
#cf-app .cf-game-tile-art{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:116px!important;flex:none!important;margin:0!important;border:0!important;border-radius:0!important;background-color:#190d2a!important;background-size:cover!important;background-position:center!important;font-size:50px!important;position:relative!important;isolation:isolate!important}
#cf-app .cf-game-tile-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#05020a00 20%,#0b0718e8 100%);z-index:-1}
#cf-app .cf-game-slots .cf-game-tile-art{background-image:linear-gradient(135deg,#3a071a88,#6d1b3a88),url("https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=800&q=80")!important}
#cf-app .cf-game-dice .cf-game-tile-art{background-image:linear-gradient(135deg,#041b3788,#133c7688),url("https://images.unsplash.com/photo-1708919166614-60f3d21b4284?auto=format&fit=crop&w=800&q=80")!important}
#cf-app .cf-game-roulette .cf-game-tile-art{background-image:linear-gradient(135deg,#29100388,#6d401388),url("https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80")!important}
#cf-app .cf-game-blackjack .cf-game-tile-art{background-image:linear-gradient(135deg,#032b2088,#17634b88),url("https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80")!important}
#cf-app .cf-game-miner .cf-game-tile-art{background-image:linear-gradient(135deg,#1a0c3588,#092e3588),url("https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80")!important}
#cf-app .cf-game-luckyjet .cf-game-tile-art{background-image:linear-gradient(135deg,#19072a88,#31116c88),url("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80")!important}
#cf-app .cf-game-tile-info{display:block!important;padding:10px 11px 12px!important;min-width:0!important}
#cf-app .cf-game-tile-info strong{display:block!important;font-size:13px!important;color:#fff!important;line-height:1.25}
#cf-app .cf-game-tile-info small{display:block!important;margin-top:5px!important;font-size:10px!important;line-height:1.35;color:#c8b9e1!important}
#cf-app .cf-game-tile-arrow{position:absolute!important;right:9px!important;bottom:10px!important;font-size:20px!important;color:#f4d47c!important}
#cf-app .cf-game-tile:active{transform:scale(.985);filter:brightness(1.15)}
@media(max-width:360px){#cf-app .cf-games-grid{gap:8px!important}#cf-app .cf-game-tile{min-height:170px!important}#cf-app .cf-game-tile-art{height:102px!important}#cf-app .cf-home-hero h1{font-size:28px}}
`;document.head.appendChild(s);
function paint(){const a=document.getElementById('cf-app');if(!a)return;const h=a.querySelector('.cf-home-page.cf-home-static');if(h&&!h.dataset.redesigned){h.dataset.redesigned='1';h.innerHTML='<div class="cf-home-redesign"><section class="cf-home-hero"><div class="cf-home-kicker">✦ COSMIC FORTUNE ✦</div><h1>Твоя удача<br>начинается здесь</h1><p>Выбирай игру, делай ставку и испытай удачу в космическом казино.</p><button class="primary" data-go="games">🎮 Все игры</button></section><div class="section-title">Быстрый доступ</div><div class="cf-home-shortcuts"><button class="cf-home-shortcut" data-action="open-daily-reward"><span class="shortcut-icon">🎁</span><span><strong>Ежедневный бонус</strong><small>Награда каждые 24 часа</small></span></button><button class="cf-home-shortcut" data-action="open-bonus-wheel"><span class="shortcut-icon">🎡</span><span><strong>Колесо удачи</strong><small>Бесплатный спин</small></span></button><button class="cf-home-shortcut" data-go="games"><span class="shortcut-icon">🎰</span><span><strong>Каталог игр</strong><small>Все игры в одном месте</small></span></button><button class="cf-home-shortcut" data-go="profile"><span class="shortcut-icon">👤</span><span><strong>Мой профиль</strong><small>Баланс и история</small></span></button></div></div>';}const g=a.querySelector('.cf-games-page');if(g){g.querySelector('.cf-games-wallpaper')?.remove();g.querySelector('.cf-games-live-balance')?.remove();g.querySelector('.cf-image-nav')?.remove();g.querySelector('.cf-games-topup')?.remove();}}
new MutationObserver(paint).observe(document.documentElement,{childList:true,subtree:true});paint();
})();