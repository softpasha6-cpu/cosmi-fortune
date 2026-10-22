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
    /* Keep avatar fallback text from rendering as a giant initial over the profile. */
    #cf-app #cf-profile-avatar{font-size:0!important;line-height:0!important;color:transparent!important;overflow:hidden;flex:0 0 58px;width:58px;height:58px;border-radius:50%;background-color:#160d24;background-position:center;background-size:cover;background-repeat:no-repeat;border:1px solid #e9bc61;filter:none;text-shadow:none;}
    #cf-app button,#cf-app input{touch-action:manipulation} 
    #cf-app .cf-rhino-screen{padding:3px 0 8px}
    #cf-app .cf-rhino-screen .cf-slots-machine{position:relative;border:2px solid #d8ae4d;border-radius:12px;padding:10px 8px 12px;background:linear-gradient(180deg,#6b7130 0%,#243f27 34%,#071b13 80%);box-shadow:inset 0 0 0 3px #ffdf8433,0 8px 22px #0008}
    #cf-app .cf-rhino-screen .cf-slots-machine:before{content:"";position:absolute;inset:4px;border:1px solid #f4d78277;border-radius:7px;pointer-events:none}
    #cf-app .cf-rhino-screen .cf-slots-marquee{border-radius:6px;border:1px solid #ffe49a;background:linear-gradient(#4a622d,#152a1b);font-size:clamp(19px,5.5vw,27px);letter-spacing:1.4px;color:#ffe8a1;text-shadow:0 2px #552d0c,0 0 12px #ffc74a;box-shadow:inset 0 0 0 2px #ffffff10,0 3px 0 #142516}
    #cf-app .cf-rhino-reels{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;padding:5px!important;height:clamp(270px,82vw,390px)}
    #cf-app .cf-rhino-reel-column{display:grid;grid-template-rows:repeat(3,minmax(76px,1fr));gap:3px;min-width:0;overflow:hidden;background:#102317}
    #cf-app .cf-rhino-reel-column .cf-slot-reel-cell{position:relative;min-width:0;display:grid;place-items:center;overflow:hidden;border:1px solid #b8a16a;background:linear-gradient(90deg,#b9b5a6,#fffbed 18%,#eee8d7 80%,#aaa48f);box-shadow:inset 0 0 8px #584c2c55;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease}
    #cf-app .cf-rhino-reel-column .cf-slot-symbol{font-size:clamp(24px,7vw,40px);line-height:1;text-align:center}
    #cf-app .cf-rhino-reel-column .cf-slot-reel-cell.cf-slot-winning{z-index:2;border:2px solid #fff5a1;background:linear-gradient(135deg,#fff8b0 0%,#ffd43b 38%,#d98b08 100%);box-shadow:inset 0 0 16px #fff8bb,0 0 0 2px #ffcf39,0 0 17px 6px #ffcf39;animation:cfSlotWinPulse .72s ease-in-out infinite alternate}
    #cf-app .cf-rhino-reel-column .cf-slot-reel-cell.cf-slot-winning .cf-slot-symbol{filter:drop-shadow(0 0 5px #fff8b0);transform:scale(1.07)}
    @keyframes cfSlotWinPulse{from{box-shadow:inset 0 0 9px #fff8bb,0 0 0 1px #ffcf39,0 0 8px 2px #ffcf39}to{box-shadow:inset 0 0 20px #fff,0 0 0 3px #fff0a1,0 0 23px 9px #ffcf39}}
    #cf-app .cf-rhino-reel-column.is-spinning .cf-slot-symbol{animation:cfSlotReelRoll .11s linear infinite;filter:blur(1.5px)}
    #cf-app .cf-rhino-prompt{text-align:center;color:#ffdf54;font-weight:1000;letter-spacing:.5px;padding:12px 0 7px;text-shadow:0 2px #50340c}
    #cf-app .cf-rhino-controls{display:grid;grid-template-columns:44px minmax(70px,1fr) 44px minmax(78px,1fr);gap:6px;align-items:center;margin:8px 0 12px}
    #cf-app .cf-rhino-round{height:44px;border-radius:50%;border:1px solid #fff0a6;background:linear-gradient(#ffe982,#e8ae24 68%,#a96a13);color:#39240a;font-size:30px;font-weight:1000;box-shadow:0 3px 0 #684016;touch-action:manipulation}
    #cf-app .cf-rhino-bet{min-width:0;text-align:center;border:1px solid #d4a744;border-radius:7px;background:linear-gradient(#17150d,#050805);padding:5px;color:#fff0b0;font-size:10px;font-weight:900}
    #cf-app .cf-rhino-bet input{display:block;box-sizing:border-box;width:100%;min-width:0;border:0;outline:0;background:transparent;color:white;text-align:center;font-size:clamp(17px,4.5vw,22px);font-weight:1000;padding:2px}
    #cf-app .cf-rhino-max{min-height:48px;padding:5px;border:1px solid #ffe9a2;border-radius:8px;background:linear-gradient(#242014,#070906);color:#fff0b0;font-weight:1000;font-size:12px;box-shadow:0 3px 0 #81521b}
    #cf-app .cf-rhino-bottom{display:grid;grid-template-columns:1fr 92px 1fr;gap:8px;align-items:center;margin:10px 0}
    #cf-app .cf-rhino-credit,#cf-app .cf-rhino-win{min-width:0;display:flex;flex-direction:column;gap:3px}
    #cf-app .cf-rhino-credit span,#cf-app .cf-rhino-win span{font-size:11px;font-weight:1000;color:#ffdc4e}
    #cf-app .cf-rhino-credit b,#cf-app .cf-rhino-win b{font-size:clamp(13px,3.8vw,17px);overflow-wrap:anywhere;color:white}
    #cf-app .cf-rhino-win{text-align:right}
    .cf-slot-symbol{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}.cf-rhino-symbol-art{display:block;width:94%;height:94%;filter:drop-shadow(0 2px 1px #1a1007);overflow:visible}.cf-slot-symbol-image{display:block;width:96%;height:96%;object-fit:contain;filter:drop-shadow(0 2px 2px #1a1007);user-select:none;pointer-events:none}
    #cf-app .cf-rhino-screen .cf-rhino-spin .cf-rhino-spin-icon{transform:none!important;animation:none!important;position:static!important;inset:auto!important;}
    #cf-app .cf-rhino-screen .cf-rhino-spin .cf-rhino-spin-icon svg{display:block!important;width:40px!important;height:40px!important;max-width:none!important;max-height:none!important;overflow:visible!important;transform:none!important;animation:none!important;}
    #cf-app .cf-rhino-screen .cf-rhino-spin{display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;line-height:1!important;text-align:center!important;box-sizing:border-box!important;position:relative!important}
    #cf-app .cf-rhino-screen .cf-rhino-spin .cf-rhino-spin-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;line-height:0;display:flex;align-items:center;justify-content:center;flex:0 0 40px;transform:none;margin:0;padding:0}
    #cf-app .cf-rhino-spin{width:88px;height:88px;justify-self:center;border-radius:50%;border:4px solid #ffdf63;background:radial-gradient(circle,#4b3410 0%,#090a05 58%,#a46b14 61%,#ffdb4f 72%,#5d370b 78%);color:#ffe44f;font-size:65px;line-height:1;box-shadow:0 0 18px #ffbd2e66,inset 0 0 0 3px #fff1;touch-action:manipulation;transition:transform .15s}
    #cf-app .cf-rhino-spin:active{transform:scale(.96)}
    #cf-app .cf-rhino-auto{display:flex;align-items:center;justify-content:space-between;gap:10px}
    #cf-app .cf-rhino-autoplay,#cf-app .cf-rhino-info{border:1px solid #c99b3c;border-radius:30px;background:linear-gradient(#252315,#090a06);color:#ffdc4e;padding:8px 13px;font-weight:900}
    #cf-app .cf-rhino-autoplay{display:flex;align-items:center;gap:8px;font-size:22px}
    #cf-app .cf-rhino-autoplay span{font-size:10px;color:white}
    #cf-app .cf-rhino-info{width:38px;height:38px;padding:0;font-family:serif;font-style:italic;font-size:23px}
    #cf-app .cf-rhino-screen button:active{filter:brightness(1.15);transform:scale(.97)}
    @media(max-width:370px){#cf-app .cf-rhino-reels{height:260px}#cf-app .cf-rhino-reel-column{grid-template-rows:repeat(3,minmax(65px,1fr))}#cf-app .cf-rhino-reel-column .cf-slot-symbol{font-size:24px}}

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
    #cf-app .bj-felt{position:relative;background:radial-gradient(ellipse at 50% 38%,#1a7853 0%,#0b543b 46%,#063625 100%);border:9px solid #50301c;border-radius:48% / 22%;padding:24px 12px 20px;color:#fff;box-shadow:inset 0 0 0 2px #d8ad56,inset 0 0 0 7px #7c4d29,inset 0 0 38px #001b12,0 12px 25px #0009;min-height:190px;overflow:hidden}
    #cf-app .bj-felt:before{content:"COSMIC FORTUNE  •  BLACKJACK";display:block;text-align:center;color:#d9b967;font-size:10px;letter-spacing:2px;margin-bottom:16px;text-shadow:0 1px #000}
    #cf-app .bj-felt:after{content:"";position:absolute;inset:13px;border:1px solid #d8b65b66;border-radius:48% / 24%;pointer-events:none}
    #cf-app .bj-dealer-label{font-size:11px;letter-spacing:2px;color:#f4d992;text-align:center}
    #cf-app .bj-seat-layout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
    #cf-app .bj-player{position:relative;background:linear-gradient(155deg,#143f32,#09241e);border:1px solid #b38b4c;border-radius:14px;padding:12px 8px;margin:0;text-align:center;box-shadow:0 5px 10px #0004}
    #cf-app .bj-player.me{border:2px solid #f0c866;background:linear-gradient(155deg,#315b39,#102b22);box-shadow:0 0 18px #e5bd4a35}
    #cf-app .bj-player .bj-seat-number{font-size:9px;letter-spacing:1px;color:#e4c87d;margin-bottom:5px}
    #cf-app .bj-cards{gap:3px;margin:10px 0}
    #cf-app .bj-card{transition:transform .25s ease;animation:cfBjDeal .35s ease both}
    #cf-app .bj-card:nth-child(2){animation-delay:.12s}
    #cf-app .bj-card:nth-child(3){animation-delay:.24s}
    #cf-app .bj-chip{display:inline-grid;place-items:center;width:30px;height:30px;border:3px dashed #f7e3a0;border-radius:50%;background:radial-gradient(circle,#d9b65c,#966421);color:#3d2510;font-size:9px;font-weight:900;box-shadow:0 2px 5px #0007}
    #cf-app .bj-invite-panel{border:1px solid #99733d;border-radius:16px;padding:12px;background:linear-gradient(145deg,#171a1a,#0c1210);margin:12px 0}
    #cf-app .bj-share-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
    @keyframes cfBjDeal{from{opacity:0;transform:translateY(-22px) rotate(-7deg)}to{opacity:1;transform:translateY(0) rotate(0)}}
    #cf-app .bj-cards{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:12px 0}
    #cf-app .bj-card{width:clamp(43px,13vw,62px);height:clamp(64px,19vw,90px);border-radius:8px;background:linear-gradient(145deg,#fffef8,#e8e1d0);color:#171923;border:1px solid #d3c9b6;box-shadow:0 4px 8px #0006;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;padding:5px;font-weight:900;font-size:16px}
    #cf-app .bj-card.red{color:#c5243d}
    #cf-app .bj-card .bj-suit{align-self:center;font-size:24px;line-height:1}
    #cf-app .bj-card.hidden{background:repeating-linear-gradient(45deg,#27104c,#27104c 7px,#6f36a0 7px,#6f36a0 14px);color:#f5d77a;border:2px solid #e9c36b;align-items:center;justify-content:center;font-size:30px}
    #cf-app .bj-player{border:1px solid #39765f;background:#0c2d25;border-radius:15px;padding:12px;margin:10px 0;text-align:center}
    #cf-app .bj-player.me{border:2px solid #f0c866;box-shadow:0 0 20px #e5bd4a20}
    #cf-app .bj-tip{border:1px solid #d9b454;background:#33270e;border-radius:12px;padding:10px;color:#ffe4a1;margin:10px 0;font-size:13px}
    #cf-app .bj-actionrow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
    #cf-app .bj-actionrow button{min-height:50px;font-size:13px;padding:9px 5px}

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
    #cf-app .cf-games-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:10px 0 22px}
    #cf-app .cf-game-tile{display:block;min-width:0;width:100%;padding:0;aspect-ratio:1/1;border:2px solid #f6bd54;border-radius:22px;overflow:hidden;background:#10091f;box-shadow:0 0 10px #9e3cff66, inset 0 0 0 1px #fff3;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    #cf-app .cf-game-art{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden;background-color:#130b2a;background-size:cover;background-position:center}
    #cf-app .cf-game-art:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#09051300 25%,#08030de8 100%)}
    #cf-app .cf-game-emoji{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(56px,17vw,104px);filter:drop-shadow(0 4px 12px #000b);transform:translateY(-5%)}
    #cf-app .cf-game-title{position:absolute;z-index:1;bottom:10px;left:4px;right:4px;text-align:center;color:#ffe8a0;font-weight:1000;font-size:clamp(13px,3.5vw,20px);letter-spacing:.3px;text-shadow:0 2px 0 #9a3900,0 0 10px #ff8c00;background:linear-gradient(90deg,#ffd56b,#fff4c0,#ffb52e);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    #cf-app .cf-game-tile:active{transform:scale(.98);filter:brightness(1.15)}
    #cf-app .art-luckyjet{background-image:url("https://raw.githubusercontent.com/softpasha6-cpu/cosmi-fortune/main/a_highly_stylized_vibrant_game_app_icon_style_ill.png");background-size:116% 116%;background-position:center;background-repeat:no-repeat;filter:brightness(1.3) saturate(1.12)}#cf-app .cf-game-tile.luckyjet .cf-game-art:before{display:none}#cf-app .cf-game-tile.luckyjet .cf-game-emoji,#cf-app .cf-game-tile.luckyjet .cf-game-title{display:none}
    #cf-app .art-miner{background-image:url("https://raw.githubusercontent.com/softpasha6-cpu/cosmi-fortune/main/a_vibrant_high_detail_neon_glow_game_app_style.png");background-size:116% 116%;background-position:center;background-repeat:no-repeat;filter:brightness(1.3) saturate(1.12)}#cf-app .cf-game-tile.miner .cf-game-art:before{display:none}#cf-app .cf-game-tile.miner .cf-game-emoji,#cf-app .cf-game-tile.miner .cf-game-title{display:none}
    #cf-app .art-slots{background-image:url("./slots.png");background-size:116% 116%;background-position:center;background-repeat:no-repeat;filter:brightness(1.3) saturate(1.12)}#cf-app .cf-game-tile.slots .cf-game-art:before{display:none}#cf-app .cf-game-tile.slots .cf-game-emoji,#cf-app .cf-game-tile.slots .cf-game-title{display:none}
    #cf-app .art-roulette{background-image:url("./a_vibrant_glossy_high_detail_casino_game_app_ico.png");background-size:116% 116%;background-position:center;background-repeat:no-repeat;filter:brightness(1.3) saturate(1.12)}#cf-app .cf-game-tile.roulette .cf-game-art:before{display:none}#cf-app .cf-game-tile.roulette .cf-game-emoji,#cf-app .cf-game-tile.roulette .cf-game-title{display:none}
    #cf-app .art-blackjack{background-image:url("./a_highly_detailed_glossy_neon_gold_casino_themed.png");background-size:116% 116%;background-position:center;background-repeat:no-repeat;filter:brightness(1.3) saturate(1.12)}#cf-app .cf-game-tile.blackjack .cf-game-art:before{display:none}#cf-app .cf-game-tile.blackjack .cf-game-emoji,#cf-app .cf-game-tile.blackjack .cf-game-title{display:none}
    #cf-app .art-dice{background-image:url("./a_glossy_high_detail_casino_gambling_app_icon_sty.png");background-size:116% 116%;background-position:center;background-repeat:no-repeat;filter:brightness(1.3) saturate(1.12)}#cf-app .cf-game-tile.dice .cf-game-art:before{display:none}#cf-app .cf-game-tile.dice .cf-game-emoji,#cf-app .cf-game-tile.dice .cf-game-title{display:none}
    #cf-app .cf-game-tile.luckyjet{border-color:#d98bff}
    #cf-app .cf-game-tile.miner{border-color:#54cfff}
    #cf-app .cf-game-tile.slots{border-color:#ffb83f}
    #cf-app .cf-game-tile.roulette{border-color:#ff70cb}
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
    #cf-app .cf-bonus-menu{display:grid;grid-template-columns:1fr;gap:10px;margin:12px 0}
    #cf-app .cf-bonus-open{display:flex;align-items:center;gap:12px;text-align:left;width:100%;padding:15px;border:1px solid #7545b9;border-radius:16px;background:linear-gradient(110deg,#241044,#0b0a19)}
    #cf-app .cf-bonus-open .cf-bonus-open-icon{font-size:32px}
    #cf-app .cf-bonus-open strong{display:block;font-size:15px}
    #cf-app .cf-bonus-open small{display:block;color:#c5b5e2;font-size:12px;margin-top:4px}
    #cf-app .cf-bottom-modal{align-items:flex-end;padding:0;z-index:2147483005}
    #cf-app .cf-bottom-modal .modal-card{width:100%;max-width:620px;max-height:84dvh;border-radius:24px 24px 0 0;padding:20px 16px calc(22px + env(safe-area-inset-bottom));overflow:auto;margin:0 auto}
    #cf-app .cf-wheel-modal .modal-card{max-height:88dvh}
    #cf-app .cf-profile-card{padding:16px;margin-bottom:14px}
    #cf-app .cf-profile-identity{display:flex;align-items:center;gap:12px;margin-bottom:16px}
    #cf-app .cf-profile-identity strong{display:block;font-size:19px;overflow-wrap:anywhere}
    #cf-app .cf-profile-muted{font-size:12px;color:#bbaad6;overflow-wrap:anywhere}
    #cf-app .cf-profile-data{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}
    #cf-app .cf-profile-data>div{padding:11px;border:1px solid #45305e;border-radius:12px;background:#100b1b;min-width:0}
    #cf-app .cf-profile-data small,#cf-app .cf-profile-balance small{display:block;font-size:9px;letter-spacing:1px;color:#a995c8;margin-bottom:6px}
    #cf-app .cf-profile-data strong{display:block;font-size:13px;color:#f8eaff;overflow-wrap:anywhere}
    #cf-app .cf-profile-balance{padding:13px;border:1px solid #7045a5;border-radius:14px;margin-top:10px;background:linear-gradient(120deg,#211037,#100b1b)}
    #cf-app .cf-profile-balance>strong{display:block;font-size:21px;color:#ffdf8b;overflow-wrap:anywhere}
    #cf-app .cf-profile-balance p{font-size:11px;color:#bbaad6;margin:7px 0 0}
    #cf-app .cf-stars-balance{border-color:#4a3d66}
    #cf-app .cf-stars-balance>strong{font-size:15px;color:#eee3ff}
    #cf-app .cf-history-row{padding:12px 0;border-bottom:1px solid #332344;display:flex;gap:10px;align-items:flex-start}
    #cf-app .cf-history-row:last-child{border-bottom:0}
    #cf-app .cf-history-icon{font-size:23px}
    #cf-app .cf-history-main{min-width:0;flex:1}
    #cf-app .cf-history-main strong{display:block;font-size:13px}
    #cf-app .cf-history-main small{display:block;color:#bbaad6;font-size:11px;margin-top:4px;overflow-wrap:anywhere}
    #cf-app .cf-history-payout{font-size:12px;font-weight:700;color:#ffdf8b;white-space:nowrap}
    #cf-app .cf-daily-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:10px 0}
    #cf-app .cf-daily-day{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;min-height:78px;padding:8px 3px;border:1px solid #48315f;border-radius:12px;background:linear-gradient(145deg,#191128,#0a0913);text-align:center}
    #cf-app .cf-daily-day small{font-size:9px;color:#c5b6df;letter-spacing:.5px}
    #cf-app .cf-daily-day strong{font-size:14px;color:#ffdf8b;white-space:nowrap}
    #cf-app .cf-daily-day span{font-size:9px;color:#b5a3d1}
    #cf-app .cf-daily-day.is-current{border-color:#f5cf6a;box-shadow:0 0 14px #f5cf6a30;background:linear-gradient(145deg,#342342,#151020)}
    #cf-app .cf-daily-day.is-claimed{border-color:#327b62;background:linear-gradient(145deg,#103729,#0b1715)}
    #cf-app .cf-daily-day.is-claimed strong{color:#75e0ad}
    #cf-app .cf-bonus-wheel-wrap{position:relative;width:min(78vw,300px);aspect-ratio:1;margin:12px auto 16px}
    #cf-app .cf-bonus-prize-wheel{position:absolute;inset:0;width:100%;height:100%;margin:0;border:8px solid #f7d579;box-shadow:0 0 0 4px #75401c,0 0 25px #ffb72e55;background:conic-gradient(#b52b43 0deg 45deg,#171923 45deg 90deg,#176b48 90deg 135deg,#6524a5 135deg 180deg,#b52b43 180deg 225deg,#171923 225deg 270deg,#176b48 270deg 315deg,#6524a5 315deg 360deg);transition:transform 5.2s cubic-bezier(.08,.72,.12,1);overflow:hidden}
    #cf-app .cf-bonus-label{z-index:2;width:42px;height:28px;padding:0 2px;border-radius:0;background:transparent;text-shadow:0 1px 2px #000;color:#fff;font-weight:900}
    #cf-app .cf-bonus-label small{font-size:10px;letter-spacing:-.3px;white-space:nowrap}
    #cf-app .cf-bonus-pointer{position:absolute;z-index:5;left:50%;top:-8px;transform:translateX(-50%);width:5px;height:23px;border-radius:4px;background:linear-gradient(90deg,#9b681d,#fff0a3,#d99b27);box-shadow:0 0 0 2px #39200e,0 2px 5px #000a}
    #cf-app .cf-bonus-label{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:48px;height:44px;color:white;font-size:20px;font-weight:900;text-shadow:0 2px 3px #000;line-height:1;transform:translate(-50%,-50%);pointer-events:none}
    #cf-app .cf-bonus-label small{font-size:9px;white-space:nowrap}
    #cf-app .cf-bonus-label.l1{left:63.4%;top:17.7%}
    #cf-app .cf-bonus-label.l2{left:82.3%;top:36.6%}
    #cf-app .cf-bonus-label.l3{left:82.3%;top:63.4%}
    #cf-app .cf-bonus-label.l4{left:63.4%;top:82.3%}
    #cf-app .cf-bonus-label.l5{left:36.6%;top:82.3%}
    #cf-app .cf-bonus-label.l6{left:17.7%;top:63.4%}
    #cf-app .cf-bonus-label.l7{left:17.7%;top:36.6%}
    #cf-app .cf-bonus-label.l8{left:36.6%;top:17.7%}
    
    #cf-app .wheel{width:min(68vw,260px);aspect-ratio:1;margin:12px auto;border-radius:50%;border:8px solid #ffca42;background:conic-gradient(#f42aff 0 45deg,#145bff 45deg 90deg,#12c99a 90deg 135deg,#ff8b16 135deg 180deg,#a328ff 180deg 225deg,#1376ff 225deg 270deg,#f32b77 270deg 315deg,#ffc22c 315deg);box-shadow:0 0 24px #ff9d22;display:grid;place-items:center;font-size:35px}
    #cf-app .profilehead{text-align:center;padding:18px;background:radial-gradient(circle at 50% 20%,#4d1d83,#0c0918 70%);border-radius:18px;border:1px solid #6538a0}
    #cf-app .avatar{font-size:68px;filter:drop-shadow(0 0 14px #a24cff)}
    #cf-app .bottom{position:fixed;z-index:5;bottom:0;left:0;right:0;padding:8px 4px calc(8px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:#080713f5;border-top:1px solid #69409b;backdrop-filter:blur(16px)}
    #cf-app .bottom button{border:0;background:transparent;color:#a69abf;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;padding:4px 0}
    #cf-app .bottom .navicon{font-size:21px} #cf-app .bottom button.active{color:#e49aff;text-shadow:0 0 12px #c32aff}
    #cf-app .toast{position:fixed;z-index:8;bottom:calc(76px + env(safe-area-inset-bottom));left:8%;right:8%;padding:12px;border:1px solid #8b43c6;border-radius:12px;background:#1a102bf5;text-align:center;display:none}
    #cf-app .toast.show{display:block}
    #cf-app .spinwheel{transition:transform 3.2s cubic-bezier(.12,.72,.12,1)}
    #cf-app .cf-dice-casino{padding:8px 0 4px}
    #cf-app .cf-dice-felt{background:radial-gradient(ellipse at center,#126748 0%,#06452f 65%,#022b20 100%);border:2px solid #d7ad55;border-radius:18px;padding:14px 10px 12px;box-shadow:inset 0 0 0 4px #5c3b1d,inset 0 0 24px #0008}
    #cf-app .cf-dice-heading{text-align:center;color:#f7d78a;font-weight:900;font-size:11px;letter-spacing:4px;margin:2px 0 14px}
    #cf-app .cf-dice-pair{display:flex;justify-content:center;align-items:center;gap:clamp(20px,8vw,42px);min-height:120px;perspective:500px}
    #cf-app .cf-die{position:relative;width:clamp(72px,23vw,94px);aspect-ratio:1;background:linear-gradient(145deg,#fff 0%,#e7e6ed 38%,#b9b8c4 72%,#f8f7ff 100%);border:1px solid #fff;border-radius:17px;box-shadow:inset -7px -8px 12px #777783,inset 4px 4px 9px #fff,0 10px 0 #777682,0 15px 20px #001b12;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:12px;box-sizing:border-box;gap:3px;transform-style:preserve-3d;backface-visibility:hidden}
    #cf-app .cf-die i{display:block;width:100%;height:100%;border-radius:50%;background:transparent}
    #cf-app .cf-die.face-1 i:nth-child(5),#cf-app .cf-die.face-2 i:nth-child(1),#cf-app .cf-die.face-2 i:nth-child(9),#cf-app .cf-die.face-3 i:nth-child(1),#cf-app .cf-die.face-3 i:nth-child(5),#cf-app .cf-die.face-3 i:nth-child(9),#cf-app .cf-die.face-4 i:nth-child(1),#cf-app .cf-die.face-4 i:nth-child(3),#cf-app .cf-die.face-4 i:nth-child(7),#cf-app .cf-die.face-4 i:nth-child(9),#cf-app .cf-die.face-5 i:nth-child(1),#cf-app .cf-die.face-5 i:nth-child(3),#cf-app .cf-die.face-5 i:nth-child(5),#cf-app .cf-die.face-5 i:nth-child(7),#cf-app .cf-die.face-5 i:nth-child(9),#cf-app .cf-die.face-6 i:nth-child(1),#cf-app .cf-die.face-6 i:nth-child(3),#cf-app .cf-die.face-6 i:nth-child(4),#cf-app .cf-die.face-6 i:nth-child(6),#cf-app .cf-die.face-6 i:nth-child(7),#cf-app .cf-die.face-6 i:nth-child(9){background:radial-gradient(circle at 35% 30%,#45404c,#08070c 75%);box-shadow:0 1px 1px #fff8}
    #cf-app .cf-dice-pair{perspective:700px;transform-style:preserve-3d}
    #cf-app .cf-die{position:relative;transform-style:preserve-3d;will-change:transform;}
    #cf-app .cf-die.is-rolling{animation:cfDiceTumble 1.15s cubic-bezier(.18,.72,.22,1) infinite}
    #cf-app .cf-die.is-settling{animation:cfDiceSettle .72s cubic-bezier(.16,.78,.22,1) both}
    @keyframes cfDiceSettle{0%{transform:translate3d(0,-18px,18px) rotate(24deg) rotateX(25deg) rotateY(20deg)}45%{transform:translate3d(0,3px,0) rotate(-8deg) rotateX(-8deg) rotateY(-8deg)}68%{transform:translate3d(0,-4px,0) rotate(4deg) rotateX(3deg) rotateY(3deg)}100%{transform:translate3d(0,0,0) rotate(0) rotateX(0) rotateY(0)}}
    #cf-app .cf-die.is-rolling:after{content:'';position:absolute;left:15%;right:15%;bottom:-13px;height:9px;border-radius:50%;background:#00180f99;filter:blur(5px);transform:scaleX(.8);animation:cfDiceShadow 1.15s ease-in-out infinite;pointer-events:none}
    @keyframes cfDiceTumble{0%{transform:translate3d(0,0,0) rotate(0deg) rotateX(0deg) rotateY(0deg) scale(1)}14%{transform:translate3d(-5px,-24px,25px) rotate(38deg) rotateX(70deg) rotateY(25deg) scale(1.04)}29%{transform:translate3d(3px,-43px,45px) rotate(105deg) rotateX(155deg) rotateY(100deg) scale(1.1)}43%{transform:translate3d(9px,-20px,22px) rotate(185deg) rotateX(235deg) rotateY(190deg) scale(1.06)}58%{transform:translate3d(-4px,-5px,5px) rotate(255deg) rotateX(300deg) rotateY(270deg) scale(1.02)}72%{transform:translate3d(3px,-13px,10px) rotate(315deg) rotateX(340deg) rotateY(320deg) scale(1.04)}86%{transform:translate3d(0,2px,0) rotate(355deg) rotateX(360deg) rotateY(355deg) scale(.98)}100%{transform:translate3d(0,0,0) rotate(360deg) rotateX(360deg) rotateY(360deg) scale(1)}}
    @keyframes cfDiceShadow{0%,100%{transform:scaleX(.75);opacity:.45}29%{transform:scaleX(.35);opacity:.2}58%{transform:scaleX(.6);opacity:.35}86%{transform:scaleX(1);opacity:.7}}
    #cf-app .cf-dice-total{text-align:center;color:#f6d889;font-weight:950;font-size:18px;letter-spacing:1px;margin:12px 0 5px}
    #cf-app .cf-dice-rule{text-align:center;color:#d5e9dd;font-size:12px;line-height:1.4}
    
    #cf-app .anim-dice{animation:cfDice .75s ease-in-out}
    #cf-app .cf-slots-casino{padding:6px 0 4px}
    #cf-app .cf-slots-machine{position:relative;overflow:hidden;padding:12px 12px 14px;border-radius:20px;border:3px solid #f0c76b;background:linear-gradient(145deg,#571b91,#1b0d35 42%,#080612);box-shadow:inset 0 0 0 3px #8c4bd2,inset 0 -14px 28px #0008,0 10px 25px #0008}
    #cf-app .cf-slots-marquee{margin:0 auto 10px;padding:8px 5px;border:2px solid #f8dc8a;border-radius:9px;background:linear-gradient(#4b166e,#170b2b);color:#ffe5a0;text-align:center;font-weight:1000;font-size:clamp(13px,4vw,18px);letter-spacing:2px;text-shadow:0 0 8px #ffb72e;box-shadow:0 0 14px #e9a72b55}
    #cf-app .cf-slots-toplights{display:flex;justify-content:space-around;margin:0 10px 9px}
    #cf-app .cf-slots-toplights i{width:9px;height:9px;border-radius:50%;background:#ffdc79;box-shadow:0 0 9px #ffc342;animation:cfSlotLamp 1s ease-in-out infinite alternate}
    #cf-app .cf-slots-toplights i:nth-child(even){animation-delay:.5s}
    @keyframes cfSlotLamp{from{opacity:.45;transform:scale(.8)}to{opacity:1;transform:scale(1.15)}}
    #cf-app .cf-slots-window{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:8px;border:4px solid #d8aa4d;border-radius:12px;background:linear-gradient(90deg,#6e481f,#ffe6a0 12%,#8a6026 18%,#f8d87e 50%,#7b5122 82%,#f7d779);box-shadow:inset 0 0 0 2px #fff4,0 5px 0 #4a2c14}
    #cf-app .cf-slot-reel{height:clamp(82px,24vw,112px);min-width:0;overflow:hidden;display:grid;place-items:center;border-radius:7px;background:linear-gradient(90deg,#d5d2ca,#fffef7 15%,#eae8e1 85%,#a6a29b);box-shadow:inset 0 0 13px #51452f66,0 1px 3px #0008;color:#17121c}
    #cf-app .cf-slot-symbol{width:100%;text-align:center;font-size:clamp(38px,12vw,62px);line-height:1;filter:drop-shadow(0 3px 1px #0003)}
    #cf-app .cf-slot-reel.is-spinning .cf-slot-symbol{animation:cfSlotReelRoll .16s linear infinite;filter:blur(1.6px)}
    @keyframes cfSlotReelRoll{0%{transform:translateY(-24px) scaleY(.88)}50%{transform:translateY(0) scaleY(1.08)}100%{transform:translateY(24px) scaleY(.88)}}
    #cf-app .cf-slots-payline{display:flex;justify-content:center;align-items:center;gap:6px;color:#ffdc8c;font-size:9px;letter-spacing:1.5px;margin:10px 0 5px;text-align:center}
    #cf-app .cf-slots-payline span{color:#f4c65e}
    #cf-app .cf-slots-footer{text-align:center;color:#f5d783;font-size:15px;font-weight:900;letter-spacing:2px}
    #cf-app .cf-slots-footer span{font-size:9px;color:#e4c2ff;letter-spacing:1px}
    #cf-app .cf-slots-paytable{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:9px 0}
    #cf-app .cf-slots-paytable div{display:flex;justify-content:space-between;align-items:center;gap:5px;padding:7px 8px;border:1px solid #6d4293;border-radius:8px;background:#150d25;color:#cdbce6;font-size:11px}
    #cf-app .cf-slots-paytable b{color:#ffd77a;font-size:12px;white-space:nowrap}
    
    #cf-app .anim-slots{animation:cfSlots .8s ease-in-out}
    #cf-app .anim-cards{animation:cfCards .7s ease-out}
    #cf-app .anim-wheel{animation:cfWheelSpin 1.2s ease-in-out}
    @keyframes cfDice{0%,100%{transform:rotate(0) scale(1)}25%{transform:rotate(-18deg) scale(1.12)}50%{transform:rotate(18deg) scale(.9)}75%{transform:rotate(-8deg) scale(1.05)}}
    @keyframes cfSlots{0%{filter:blur(0);transform:translateY(0)}35%{filter:blur(4px);transform:translateY(-8px)}70%{filter:blur(2px);transform:translateY(5px)}100%{filter:none;transform:translateY(0)}}
    @keyframes cfCards{0%{opacity:.3;transform:translateY(-18px) rotate(-5deg)}100%{opacity:1;transform:translateY(0) rotate(0)}}
    @keyframes cfWheelSpin{0%{transform:rotate(0) scale(.95)}50%{transform:rotate(540deg) scale(1.08)}100%{transform:rotate(1080deg) scale(1)}}
    @media(max-width:360px){#cf-app .shell{padding:10px}#cf-app .hero{padding:20px 14px;min-height:250px}#cf-app .hero p{max-width:70%}#cf-app .card{padding:10px}#cf-app .art{height:62px;font-size:42px}}

    #cf-app .cf-roulette-table{margin:0 0 5px;padding:6px 5px 6px;border:1px solid #b98b42;border-radius:22px;background:radial-gradient(ellipse at center,#176747 0%,#08452f 58%,#05251d 100%);box-shadow:inset 0 0 28px #0009,0 10px 30px #0006;text-align:center;overflow:hidden}
    #cf-app .cf-roulette-caption{font-size:9px;letter-spacing:1.5px;color:#f4d28a;font-weight:900;margin-bottom:4px}
    #cf-app .cf-roulette-wheel-wrap{position:relative;width:min(76vw,290px);max-width:290px;box-sizing:border-box;aspect-ratio:1;margin:0 auto 10px;display:grid;place-items:center;overflow:visible;flex:none}
    #cf-app .cf-roulette-wheel{position:absolute;inset:3%;border-radius:50%;border:8px ridge #e4b85b;transition:transform 5.2s cubic-bezier(.08,.72,.12,1);will-change:transform;background:conic-gradient(#16834d 0deg 9.72972972972973deg,#bd2433 9.72972972972973deg 19.45945945945946deg,#171923 19.45945945945946deg 29.18918918918919deg,#bd2433 29.18918918918919deg 38.91891891891892deg,#171923 38.91891891891892deg 48.648648648648646deg,#bd2433 48.648648648648646deg 58.37837837837838deg,#171923 58.37837837837838deg 68.10810810810811deg,#bd2433 68.10810810810811deg 77.83783783783784deg,#171923 77.83783783783784deg 87.56756756756756deg,#bd2433 87.56756756756756deg 97.29729729729729deg,#171923 97.29729729729729deg 107.02702702702703deg,#bd2433 107.02702702702703deg 116.75675675675676deg,#171923 116.75675675675676deg 126.48648648648648deg,#bd2433 126.48648648648648deg 136.21621621621622deg,#171923 136.21621621621622deg 145.94594594594594deg,#bd2433 145.94594594594594deg 155.67567567567568deg,#171923 155.67567567567568deg 165.40540540540542deg,#bd2433 165.40540540540542deg 175.13513513513513deg,#171923 175.13513513513513deg 184.86486486486487deg,#bd2433 184.86486486486487deg 194.59459459459458deg,#171923 194.59459459459458deg 204.32432432432432deg,#bd2433 204.32432432432432deg 214.05405405405406deg,#171923 214.05405405405406deg 223.78378378378378deg,#bd2433 223.78378378378378deg 233.51351351351352deg,#171923 233.51351351351352deg 243.24324324324326deg,#bd2433 243.24324324324326deg 252.97297297297297deg,#171923 252.97297297297297deg 262.7027027027027deg,#bd2433 262.7027027027027deg 272.43243243243245deg,#171923 272.43243243243245deg 282.1621621621622deg,#bd2433 282.1621621621622deg 291.8918918918919deg,#171923 291.8918918918919deg 301.6216216216216deg,#bd2433 301.6216216216216deg 311.35135135135135deg,#171923 311.35135135135135deg 321.0810810810811deg,#bd2433 321.0810810810811deg 330.81081081081084deg,#171923 330.81081081081084deg 340.5405405405405deg,#bd2433 340.5405405405405deg 350.27027027027026deg,#171923 350.27027027027026deg 360deg);box-shadow:0 0 0 4px #6b3d1b,0 0 0 8px #f0c96e,0 0 24px #f2b94f66;}
    #cf-app .cf-roulette-pocket{position:absolute;left:45.13513515%;top:0;width:9.7297297%;height:50%;margin:0;transform-origin:50% 100%;display:flex;justify-content:center;align-items:flex-start;padding-top:3%;box-sizing:border-box;font-size:9px;font-weight:900;color:#fff;text-shadow:0 1px 2px #000;letter-spacing:-.4px;pointer-events:none;overflow:visible} #cf-app .cf-roulette-pocket span{flex:none;display:block;width:22px;height:auto;padding:0;border:0;border-radius:0;background:transparent!important;line-height:1;text-align:center;white-space:nowrap;transform:rotate(90deg);transform-origin:50% 50%;}
    #cf-app .cf-roulette-hub{position:absolute;left:50%;top:50%;width:32%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;border:7px ridge #e8c36b;background:radial-gradient(circle at 35% 25%,#8e5526,#482613 60%,#170e0a);box-shadow:inset 0 0 0 3px #c18a3b,0 0 15px #000a;display:grid;place-items:center;color:#f9d77f;font-size:24px}
    #cf-app .cf-roulette-pointer{position:absolute;z-index:4;top:-1px;left:50%;transform:translateX(-50%);color:#ffe8a1;font-size:24px;filter:drop-shadow(0 2px 3px #000)}
    #cf-app .cf-roulette-ball{position:absolute;z-index:5;top:50%;left:50%;width:15px;height:15px;margin:-7px 0 0 -7px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff,#e6e1d7 48%,#85817a 80%);box-shadow:0 2px 5px #000b,0 0 8px #fff8;--ball-radius:98px;transform:rotate(0deg) translateY(calc(0px - var(--ball-radius)));will-change:transform;pointer-events:none}
    @keyframes cfBallOrbit{from{transform:rotate(0deg) translateY(calc(0px - var(--ball-radius)))}to{transform:rotate(360deg) translateY(calc(0px - var(--ball-radius)))}}
    #cf-app .cf-roulette-ball.is-spinning{animation:cfBallOrbit .8s linear infinite}
    #cf-app .cf-roulette-ball.is-slowing{animation:cfBallSlow 6.3s cubic-bezier(.12,.78,.16,1) 1 both}
    #cf-app .cf-roulette-ball.is-falling{animation:cfBallDrop .55s cubic-bezier(.2,.75,.3,1) both}
    @keyframes cfBallSlow{0%{transform:rotate(0deg) translateY(calc(0px - var(--ball-radius)))}100%{transform:rotate(2880deg) translateY(calc(0px - var(--ball-radius)))}}
    @keyframes cfBallDrop{0%{transform:rotate(2880deg) translateY(calc(0px - var(--ball-radius))) scale(1)}45%{transform:rotate(2880deg) translateY(calc(0px - var(--ball-radius))) scale(.72)}75%{transform:rotate(2880deg) translateY(calc(0px - var(--ball-radius))) scale(.9)}100%{transform:rotate(2880deg) translateY(calc(0px - var(--ball-radius))) scale(.82)}}
    #cf-app .cf-roulette-ball.is-falling{animation:none;transform:rotate(var(--ball-angle,0deg)) translateY(-104px) scale(.82)}
    #cf-app .cf-roulette-game .cf-roulette-caption:first-child{margin-bottom:7px}
    #cf-app .cf-roulette-game .fieldrow{margin-top:10px}
    #cf-app .cf-roulette-choices{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:8px}
    #cf-app .cf-roulette-choices button{border:2px solid #d7c4a0;border-radius:8px;padding:5px 2px;font-size:10px;line-height:1.1;font-weight:900;box-shadow:inset 0 1px #ffffff30}
    #cf-app .cf-roulette-choices [data-choice=red]{background:linear-gradient(#c52d3e,#761321)}
    #cf-app .cf-roulette-choices [data-choice=black]{background:linear-gradient(#34343b,#111116)}
    #cf-app .cf-roulette-choices [data-choice=green]{background:linear-gradient(#209b60,#07512e)}
    #cf-app .cf-roulette-choices{grid-template-columns:repeat(3,minmax(0,1fr))}
    #cf-app .cf-roulette-choices button.is-selected{border-color:#ffdb73;box-shadow:0 0 0 2px #ffdb7344,0 0 16px #ffca4d55}
    #cf-app .cf-roulette-number-grid{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:2px;margin-top:4px;width:100%;box-sizing:border-box} #cf-app .cf-roulette-number-grid button{min-width:0;min-height:22px;height:22px;padding:0;border:1px solid #e4c57888;border-radius:4px;font-size:10px;line-height:1;font-weight:900} #cf-app .cf-roulette-number-grid button.is-selected{outline:2px solid #ffdf7c;box-shadow:0 0 12px #ffdf7c88;transform:scale(1.06)}
    #cf-app .cf-roulette-footnote{font-size:11px;color:#c8e6d4;margin-top:9px}

    #cf-app .cf-rhino-screen .cf-rhino-spin.cf-spinning{filter:brightness(1.12)}
    #cf-app .cf-rhino-screen .cf-rhino-credit b,#cf-app .cf-rhino-screen .cf-rhino-win b{display:block;min-height:1.2em;font-size:clamp(15px,4vw,19px)!important;line-height:1.25;text-align:inherit}
    /* Keep the slot balance and win labels compact on mobile. */
    #cf-app .cf-rhino-screen .cf-rhino-credit span,#cf-app .cf-rhino-screen .cf-rhino-win span{font-size:clamp(9px,2.7vw,11px)!important;letter-spacing:0!important;white-space:nowrap!important}
    #cf-app .cf-rhino-screen .cf-rhino-win{text-align:right!important}
    #cf-app .cf-rhino-screen #cf-game-result:empty{display:none!important}
    #cf-app .cf-rhino-screen #cf-game-result{font-size:12px!important;line-height:1.35!important;overflow-wrap:anywhere!important;min-height:0!important;margin:6px 0!important}
    #cf-app .cf-rhino-screen #cf-game-result{display:none}
    #cf-app .cf-rhino-screen #cf-game-result.cf-show-result{display:block!important}
    /* Final Great Rhino layout override: keep all five reels in one row. */
    #cf-app .cf-rhino-screen .cf-slots-window.cf-rhino-reels{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-template-rows:minmax(0,1fr)!important;align-items:stretch!important;gap:3px!important;height:clamp(270px,82vw,390px)!important;min-height:0!important;overflow:hidden!important;padding:5px!important}
    #cf-app .cf-rhino-screen .cf-slots-window.cf-rhino-reels>.cf-rhino-reel-column{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:repeat(3,minmax(0,1fr))!important;grid-column:auto!important;grid-row:1!important;min-width:0!important;min-height:0!important;gap:3px!important}
    #cf-app .cf-rhino-screen .cf-rhino-reel-column .cf-slot-reel-cell{min-height:0!important}
    #cf-app .cf-rhino-screen .cf-rhino-reel-column .cf-slot-symbol{font-size:clamp(20px,6.5vw,38px)!important}
    #cf-app .cf-rhino-screen{padding-bottom:18px!important}
    #cf-app .cf-rhino-screen .cf-rhino-auto{padding-bottom:12px!important}
    #cf-app .cf-rhino-screen .cf-rhino-controls{grid-template-columns:42px minmax(0,1fr) 42px minmax(0,1fr)!important;gap:5px!important}
    #cf-app .cf-rhino-screen .cf-rhino-bottom{grid-template-columns:minmax(0,1fr) 82px minmax(0,1fr)!important;gap:5px!important}
    #cf-app .cf-rhino-screen .cf-rhino-spin{width:78px!important;height:78px!important;font-size:54px!important}
    #cf-app .cf-rhino-screen .cf-rhino-credit b,#cf-app .cf-rhino-screen .cf-rhino-win b{font-variant-numeric:tabular-nums}
    #cf-app #cf-jet-history{display:flex!important;flex-wrap:nowrap!important;gap:5px!important;overflow:hidden!important;margin:0 0 7px!important;padding:2px 0!important}
    #cf-app #cf-jet-history>span{flex:0 0 auto!important;padding:5px 8px!important;border-radius:7px!important;font-size:10px!important}
    #cf-app #cf-jet-scene{height:220px!important;min-height:220px!important;max-height:220px!important;width:100%!important;flex:none!important;border-radius:13px!important;overflow:hidden!important}
    #cf-app #cf-jet-scene>svg{inset:0!important;width:100%!important;height:100%!important}
    #cf-app #cf-jet-rocket-wrap{width:52px!important;height:52px!important;left:14px!important;bottom:48px!important;transition:transform .12s linear!important;z-index:4!important}
    #cf-app #cf-jet-trail{left:20px!important;bottom:73px!important;width:72%!important;height:2px!important;transition:transform .12s linear!important}
    #cf-app #cf-jet-scene .cf-trail-glow{left:20px!important;bottom:73px!important;width:72%!important;height:3px!important;transition:transform .12s linear!important}
    #cf-app #cf-jet-scene #cf-jet-multiplier{font-size:clamp(38px,11vw,52px)!important;line-height:1!important;text-shadow:0 0 16px #b52cff!important}
    #cf-app #cf-jet-scene #cf-jet-status{font-size:12px!important;margin-top:5px!important}
    #cf-app #cf-jet-scene>div[style*="bottom:18px"],#cf-app #cf-jet-scene>div[style*="bottom:10px"]{bottom:8px!important;z-index:5!important}
    #cf-app #cf-jet-scene>div[style*="COSMIC FLIGHT"]{top:10px!important;left:11px!important;font-size:9px!important;z-index:4!important}
    #cf-app #cf-jet-scene>div[style*="height:105px"]{height:60px!important;bottom:-22px!important}
    #cf-app #cf-jet-bets{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-auto-rows:42px!important;gap:5px!important;max-height:89px!important;overflow:auto!important;margin:6px 0 10px!important}
    #cf-app #cf-jet-bets>div{min-height:40px!important;height:42px!important;padding:5px 8px!important;grid-template-columns:minmax(0,1fr) auto auto!important;gap:6px!important;border-radius:8px!important;font-size:11px!important;overflow:hidden!important}
    #cf-app #cf-jet-bets>div:nth-child(n+3){display:none!important}
    #cf-app #cf-jet-bets>div>span:first-child{overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    #cf-app #cf-jet-bet-count{font-variant-numeric:tabular-nums}
    @media(max-width:390px){#cf-app #cf-jet-scene{height:205px!important;min-height:205px!important;max-height:205px!important}#cf-app #cf-jet-rocket-wrap{width:46px!important;height:46px!important}#cf-app #cf-jet-scene #cf-jet-multiplier{font-size:40px!important}}
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
    ['blackjack','🃏','Блэкджек','Сравни карты с дилером'],
    ['miner','💎','Минер','Открывай кристаллы и избегай мин · новинка'],
    ['luckyjet','🚀','Lucky Jet','Забирай выигрыш до остановки ракеты · новинка']
  ];
  const API_BASE='https://cosmic-fortune-api.onrender.com';
  const telegram=window.Telegram&&window.Telegram.WebApp;
  if(telegram){try{telegram.ready();telegram.expand()}catch{}}
  const initData=()=>telegram&&typeof telegram.initData==='string'?telegram.initData:'';
  async function api(path,options={}){
    const signed=initData();
    if(!signed) throw new Error('Открой мини-приложение через Telegram для входа в аккаунт.');
    const response=await fetch(API_BASE+path,{...options,headers:{'Content-Type':'application/json','X-Telegram-Init-Data':signed,...(options.headers||{})}});
    const raw=await response.text();
    let data;try{data=JSON.parse(raw)}catch{throw new Error('Сервер вернул не JSON (HTTP '+response.status+'). Проверь, что Render завершил деплой API.')}
    if(!response.ok) throw new Error(data.error||('Ошибка сервера HTTP '+response.status));
    return data;
  }
  const formatBalance=n=>Number(n).toLocaleString('ru-RU');
  const say=t=>{toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200)};
  function renderTelegramProfileImmediately(){
    const user=telegram?.initDataUnsafe?.user;
    if(!user)return;
    const title=app.querySelector('#cf-profile-name');
    if(title)title.textContent=[user.first_name,user.last_name].filter(Boolean).join(' ')||user.username||'Игрок Cosmic Fortune';
    const uname=app.querySelector('#cf-profile-username');
    if(uname)uname.textContent=user.username?'@'+user.username:'Имя пользователя Telegram не задано';
    const tag=app.querySelector('#cf-profile-tag');
    if(tag)tag.textContent=user.username?'@'+user.username:'Не задан';
    const telegramId=app.querySelector('#cf-profile-id');
    if(telegramId)telegramId.textContent=user.id?String(user.id):'—';
    const avatar=app.querySelector('#cf-profile-avatar');
    if(avatar){
      if(user.photo_url){
        avatar.textContent='';
        avatar.style.backgroundImage='url("'+String(user.photo_url).replace(/["\\\\]/g,'')+'")';
        avatar.style.backgroundSize='cover';
        avatar.style.backgroundPosition='center';
      }else { avatar.textContent=''; avatar.style.backgroundImage='none'; }
    }
  }
  async function refreshAccount(){
    renderTelegramProfileImmediately();
    try{
      const data=await api('/api/me');
      const balance=app.querySelector('#cf-balance');
      if(balance) balance.textContent=formatBalance(data.player.balance);
      const profileBalance=app.querySelector('#cf-profile-balance');
      if(profileBalance) profileBalance.textContent=formatBalance(data.player.balance);
      const slotBalance=app.querySelector('#cf-rhino-credit');
      if(slotBalance) slotBalance.textContent=formatBalance(data.player.balance);
      const title=app.querySelector('#cf-profile-name');if(title)title.textContent=data.player.firstName||data.player.username||'Игрок Cosmic Fortune';
      const uname=app.querySelector('#cf-profile-username');if(uname)uname.textContent=data.player.username?'@'+data.player.username:'Имя пользователя Telegram не задано';
      const tag=app.querySelector('#cf-profile-tag');if(tag)tag.textContent=data.player.username?'@'+data.player.username:'Не задан';
      const telegramId=app.querySelector('#cf-profile-id');if(telegramId)telegramId.textContent=data.player.telegramId||'—';
      const avatar=app.querySelector('#cf-profile-avatar');if(avatar){avatar.textContent='';const photoUrl=telegram?.initDataUnsafe?.user?.photo_url;if(photoUrl){avatar.style.backgroundImage='url("'+String(photoUrl).replace(/["\\\\]/g,'')+'")';avatar.style.backgroundSize='cover';avatar.style.backgroundPosition='center';}else avatar.style.backgroundImage='none';}
      if(current==='profile'){renderHistoryInProfile(data.history||[]);loadPaymentHistory();loadOwnerTools();}
    }catch(error){
      const balance=app.querySelector('#cf-balance');
      if(balance) balance.textContent='—';
      if(initData()) say('Не удалось загрузить аккаунт: '+error.message);
    }
  }
  const primary=(text,act)=>'<button class="primary" data-action="'+act+'">'+text+'</button>';
  function home(){return '<section class="hero"><div class="eyebrow">ТВОЯ ВСЕЛЕННАЯ ВЫИГРЫШЕЙ</div><h1>COSMIC<br><span>FORTUNE</span></h1><p>Играй в космические игры, получай виртуальные кредиты и забирай ежедневные бонусы.</p><button type="button" class="primary" data-go="games" onclick="window.cfNavigate(this.dataset.go)">✦ Играть　›</button></section><div class="home-actions"><div><button type="button" class="bonus-icon" data-action="open-bonus-wheel" aria-label="Открыть бонусную рулетку">🎡</button><div class="bonus-icon-label">Рулетка дня</div></div><button type="button" class="widecard" data-go="bonuses" style="margin:0;flex:1;min-height:72px"><div class="art">🎁</div><div><strong>Бонусы и награды</strong><small>Ежедневная награда</small></div> ›</button></div>'}
  function gameList(){return '<div class="section-title">ИГРЫ</div><div style="color:#c6b5e2;margin:0 2px 14px">ВЫБЕРИ СВОЮ УДАЧУ</div><div class="cf-games-grid">'+games.map(g=>'<button class="cf-game-tile '+g[0]+'" data-go="'+g[0]+'"><div class="cf-game-art art-'+g[0]+'"><span class="cf-game-emoji">'+g[1]+'</span><span class="cf-game-title">'+(g[0]==='slots'?'СЛОТЫ':g[0]==='dice'?'КОСТИ':g[0]==='roulette'?'РУЛЕТКА':g[0]==='blackjack'?'БЛЭКДЖЕК':g[0]==='miner'?'МИНЕР':'LUCKY JET')+'</span></div></button>').join('')+'</div>'}
  function panel(title,body){return '<div class="section-title">'+title+'</div><section class="gamepanel">'+body+'</section>'}
  function gameAvatar(game){
    const views={
      slots:'<span class="game-tag">SLOTS</span><span class="game-emoji">🎰</span>',
      dice:'<span class="game-tag">DICE</span><span class="game-emoji">🎲</span>',
      roulette:'',
      blackjack:'<span class="game-tag">BLACKJACK</span><div class="cards-art"><span>♥</span><span>♠</span></div>'
    };
    return '<div class="game-avatar '+game+'">'+(views[game]||'<span class="game-emoji">🎮</span>')+'</div>';
  }
  function gamePanel(game,title,art,description,extra=''){
    return panel(title,'<div class="game-stage '+game+'" id="cf-game-stage">'+gameAvatar(game)+'<p style="color:#c5b6df;margin:8px 0 0">'+description+'</p></div>'+extra+'<div class="fieldrow"><label class="field">Ставка <input id="cf-bet" type="number" min="1" max="100000" value="100" style="width:100%;margin-top:8px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:8px;padding:8px;text-align:center"></label></div><div id="cf-game-result" style="text-align:center;color:#e6d8ff;min-height:24px;margin:10px 0"></div><button class="primary" data-action="play-game" data-game="'+game+'">Играть</button>');
  }
  const cfSlotPaylines = [
    [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
    [0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],
    [2,1,1,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,0,1,0],[2,1,2,1,2],
    [0,2,0,2,0],[2,0,2,0,2],[0,2,2,2,0],[2,0,0,0,2],[1,1,0,1,1]
  ];
  function clearCfSlotWinningCells(){
    app.querySelectorAll('.cf-slot-reel-cell.cf-slot-winning').forEach(cell=>cell.classList.remove('cf-slot-winning'));
  }
  function highlightCfSlotWinningCells(wins,reels,payout,feature){
    clearCfSlotWinningCells();
    const winningIndexes=new Set();
    if(Array.isArray(wins)){
      for(const win of wins){
        const line=cfSlotPaylines[Number(win.payline)-1];
        const count=Math.max(0,Math.min(5,Number(win.count)||0));
        if(!line||count<2)continue;
        for(let col=0;col<count;col++)winningIndexes.add(col*3+line[col]);
      }
    }
    // During Super Respin, every landed rhino is a feature symbol, even before
    // the final jackpot payout is resolved. Highlight those landed cells too.
    if(feature==='super-respin'&&Array.isArray(reels)){
      reels.forEach((symbol,index)=>{if(symbol==='rhino')winningIndexes.add(index);});
    }
    for(const index of winningIndexes){
      const col=Math.floor(index/3),row=index%3;
      const reel=app.querySelector('#cf-slot-reel-'+col);
      const cell=reel?.querySelectorAll('.cf-slot-reel-cell')?.[row];
      if(cell)cell.classList.add('cf-slot-winning');
    }
  }
  const cfSlotImageMap = {
    'A':['A.png'],'K':['K.png'],'Q':['Q.png'],'J':['J.png'],
    'rhino':['rhino.png'],'golden-rhino':['golden_rhino.png'],
    'eagle':['eagle.png'],'flamingo':['flamingo.png'],
    'crocodile':['crocodile.png'],'hyena':['hyena.png']
  };
  window.__cfSlotImages = window.__cfSlotImages || {};
  function cfSlotKey(raw){
    const v=String(raw??'');
    const map={'🦏':'golden-rhino','🦅':'eagle','🦩':'flamingo','🐊':'crocodile','🐕':'hyena','🐆':'hyena','🌅':'golden-rhino'};
    if(map[v])return map[v];
    if(['A','K','Q','J'].includes(v.trim()))return v.trim();
    const low=v.toLowerCase().replace(/_/g,'-').trim();
    if(['a','k','q','j'].includes(low))return low.toUpperCase();
    if(['rhino','golden-rhino','eagle','flamingo','crocodile','hyena'].includes(low))return low;
    return 'A';
  }
  function setCfSlotSymbol(el, raw){
    if(!el)return;
    if(raw===null||raw===undefined||raw===''){
      el.dataset.symbol='blank';
      el.innerHTML='';
      return;
    }
    const key=cfSlotKey(raw);
    el.dataset.symbol=key;
    const src=window.__cfSlotImages[key];
    el.innerHTML=src?'<img class="cf-slot-symbol-image" alt="" draggable="false" src="'+src+'">':rhinoSymbol(key);
  }
  async function loadCfSlotImages(){
    try{
      if(!window.JSZip){
        await new Promise((resolve,reject)=>{
          const script=document.createElement('script');
          script.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
        });
      }
      const response=await fetch('./cosmic_slot_symbols_cropped.zip?v=20261021-2',{cache:'no-store'});
      if(!response.ok)throw new Error('slot image archive unavailable');
      const zip=await JSZip.loadAsync(await response.arrayBuffer());
      const files=Object.keys(zip.files).filter(path=>!zip.files[path].dir && /\.(png|webp|jpe?g)$/i.test(path)).sort();
      const used=new Set();
      for(const [index,[key,names]] of Object.entries(cfSlotImageMap).entries()){
        let entry=null;
        for(const name of names){
          entry=files.find(path=>path.split('/').pop().toLowerCase()===name.toLowerCase());
          if(entry)break;
        }
        if(!entry){
          const needle=key.replace(/-/g,'').toLowerCase();
          entry=files.find(path=>path.split('/').pop().toLowerCase().replace(/\.(png|webp|jpe?g)$/i,'').replace(/[^a-z0-9]/g,'')===needle);
        }
        if(!entry){
          const matches=files.filter(path=>!used.has(path));
          entry=matches[index]||null;
        }
        if(entry){
          used.add(entry);
          window.__cfSlotImages[key]=URL.createObjectURL(await zip.files[entry].async('blob'));
        }
      }
      document.querySelectorAll('.cf-slot-symbol[data-symbol]').forEach(el=>setCfSlotSymbol(el,el.dataset.symbol));
    }catch(error){console.warn('Cosmic Fortune slot images not loaded; using vector fallback.',error);}
  }
  function rhinoSymbol(k){
    if(window.__cfSlotImages && window.__cfSlotImages[k])return '<img class="cf-slot-symbol-image" alt="" draggable="false" src="'+window.__cfSlotImages[k]+'">';
    const animals={
      rhino:'<path d="M15 48 7 35l24 6 10-17 21 4 14 17 14 8-8 16-18 6-26-5-10-10z" fill="#b7a17b" stroke="#493522" stroke-width="3"/><path d="M17 47 8 38l17 4 22-14-5-13 17 12" fill="#f2e2c1" stroke="#493522" stroke-width="3"/><path d="M30 66 28 85h10l5-17m22-1 2 18h10l-1-21" fill="#817052" stroke="#493522" stroke-width="3"/><circle cx="70" cy="42" r="3"/>',
      leopard:'<path d="M20 69 25 42l15-16 20 4 17 18 4 22-13 8-13-9-15 8z" fill="#d7a442" stroke="#52351b" stroke-width="3"/><path d="M31 35 26 20l17 9m18 0 13-12-1 21M29 66 23 86h10l9-16m19-1 4 17h10l-3-22" fill="#b17a35" stroke="#52351b" stroke-width="3"/><g fill="#442817"><circle cx="38" cy="43" r="3"/><circle cx="52" cy="36" r="3"/><circle cx="64" cy="47" r="3.5"/><circle cx="43" cy="56" r="3.5"/><circle cx="61" cy="63" r="3"/></g>',
      eagle:'<path d="M49 20 57 40 86 30 70 53 87 68 59 64 50 84 41 64 13 68 30 52 14 31 43 40z" fill="#d7a442" stroke="#53391b" stroke-width="3"/><path d="M43 31 50 18 59 34 56 54 49 64 42 51z" fill="#f8edcf" stroke="#4c3219" stroke-width="2"/><path d="m54 39 16 3-12 10z" fill="#b87922"/>',
      flamingo:'<path d="M36 25q-13-7-17 4-4 12 10 13l9-8" fill="none" stroke="#f1849a" stroke-width="9" stroke-linecap="round"/><path d="M36 34q15 5 16 22l-5 25m7-25q11 11 5 25" fill="none" stroke="#ef7d91" stroke-width="7" stroke-linecap="round"/><path d="M28 44q18-10 32 5l-5 13-21-2z" fill="#f5a0ad" stroke="#7e3040" stroke-width="2"/><path d="M21 31 9 32l10 6" fill="#28212a"/>',
      crocodile:'<path d="M12 54 31 43l25 3 13-7 21 9-13 10-18 2-13 13-10-2-3-10-13 2z" fill="#6a9b4a" stroke="#254a28" stroke-width="3"/><path d="m12 54-7-8 23 1m31-1 8-11 6 9M25 67 19 80h9l9-10m22-5 4 15h9l-1-18" fill="#91b96a" stroke="#254a28" stroke-width="3"/><path d="M14 54h30l-5 8H17z" fill="#e8dfb0"/><circle cx="65" cy="45" r="3" fill="#fff3b0"/>',
      hyena:'<path d="M22 43 36 29l22 3 14 13 10 15-17 8-15-6-14 13-10-4 4-17z" fill="#b7a17b" stroke="#493722" stroke-width="3"/><path d="M33 32 25 17l17 12m17 4 14-13-1 21M34 65 29 84h9l8-16m17-5 4 21h9l-2-24" fill="#796044" stroke="#493722" stroke-width="3"/><g fill="#4a3521"><circle cx="42" cy="43" r="3"/><circle cx="57" cy="40" r="3"/><circle cx="61" cy="54" r="3"/></g>',
      sun:'<circle cx="50" cy="50" r="33" fill="url(#g)" stroke="#704416" stroke-width="4"/><path d="m50 24 7 18 18-8-9 17 14 12-20-2-10 18-8-18-20 4 13-15-10-17 18 8z" fill="#fff0ad"/>'
    };
    const colors={A:['#ffe08a','#87531a'],K:['#dce8ff','#354d7c'],Q:['#ffb7dc','#7e315e'],J:['#8be0ff','#245b8a']};
    const art=animals[k]||'<text x="50" y="73" text-anchor="middle" font-family="Georgia,serif" font-size="68" font-weight="900" fill="'+(colors[k]||colors.A)[0]+'" stroke="'+(colors[k]||colors.A)[1]+'" stroke-width="2">'+k+'</text><path d="M17 19h66M17 83h66" stroke="#f6d777" stroke-width="2"/>';
    return '<svg class="cf-rhino-symbol-art" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff2bd"/><stop offset=".45" stop-color="#d7a442"/><stop offset="1" stop-color="#754515"/></linearGradient></defs>'+art+'</svg>';
  }
  function slots(){return panel('Great Rhino','<div class="cf-slots-casino cf-rhino-screen"><div class="cf-slots-machine"><div class="cf-slots-marquee"><span>GREAT RHINO</span></div><div class="cf-slots-window cf-rhino-reels">'+Array.from({length:5},(_,col)=>'<div class="cf-rhino-reel-column" id="cf-slot-reel-'+col+'">'+Array.from({length:3},(_,row)=>'<div class="cf-slot-reel-cell"><div class="cf-slot-symbol" data-symbol="'+(['rhino','golden-rhino','eagle','flamingo','crocodile','hyena','A','K','Q','J'])[((col*3+row)%10)]+'">'+rhinoSymbol((['rhino','golden-rhino','eagle','flamingo','crocodile','hyena','A','K','Q','J'])[((col*3+row)%10)])+'</div></div>').join('')+'</div>').join('')+'</div><div class="cf-rhino-prompt">ДЕЛАЙТЕ ВАШИ СТАВКИ!</div></div><div class="cf-rhino-controls"><button type="button" class="cf-rhino-round" data-action="slot-bet-minus" aria-label="Уменьшить ставку">−</button><label class="cf-rhino-bet">СТАВКА<input id="cf-bet" type="number" min="1" max="100000" step="10" value="100" inputmode="numeric"></label><button type="button" class="cf-rhino-round" data-action="slot-bet-plus" aria-label="Увеличить ставку">+</button><button type="button" class="cf-rhino-max" data-action="slot-bet-max">МАКС<br>СТАВКА</button></div><div class="cf-rhino-bottom"><div class="cf-rhino-credit"><span>БАЛАНС</span><b id="cf-rhino-credit">—</b></div><button type="button" class="cf-rhino-spin" data-action="play-game" data-game="slots" aria-label="Вращать барабаны"><span class="cf-rhino-spin-icon" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false" aria-hidden="true"><path d="M35.3 12.7A16 16 0 1 0 40 24h-5a11 11 0 1 1-3.2-7.8L25 23h15V8z" fill="currentColor"/></svg></span></button><div class="cf-rhino-win"><span>ТВОЙ ВЫИГРЫШ</span><b id="cf-rhino-win">0</b></div></div><div class="cf-rhino-auto"><button type="button" class="cf-rhino-autoplay" data-action="slot-autoplay">⟳ <span>АВТОИГРА</span></button><button type="button" class="cf-rhino-info" data-action="slot-info">i</button></div><div id="cf-game-result" style="text-align:center;color:#ffe4a0;min-height:24px;font-weight:800;margin:8px 0"></div></div>')}  function dice(){return panel('Кости','<div class="cf-dice-casino"><div class="cf-dice-felt"><div class="cf-dice-heading">DICE TABLE</div><div class="cf-dice-pair"><div class="cf-die face-1" id="cf-die-one"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="cf-die face-6" id="cf-die-two"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="cf-dice-total" id="cf-dice-total">СУММА: —</div><div class="cf-dice-rule">Брось две кости. Сумма <b>8–12</b> — выигрыш <b>2×</b>.</div></div><div style="display:flex;align-items:center;gap:8px;margin:8px 0"><button class="primary" data-action="play-game" data-game="dice" style="flex:0 0 auto;width:42%;min-height:40px;padding:8px;font-size:13px">Бросить</button><label style="flex:1;min-width:0;font-size:11px;color:#c5b6df">Ставка<input id="cf-bet" type="number" min="1" max="100000" value="100" style="display:block;width:100%;box-sizing:border-box;margin-top:4px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:7px;padding:7px;text-align:center;font-size:13px"></label></div><div id="cf-game-result" style="text-align:center;color:#e6d8ff;min-height:22px;font-size:12px;margin:5px 0"></div></div>')}
  const rouletteNumbers=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  function rouletteWheelMarkup(){return '<div class="cf-roulette-table"><div class="cf-roulette-caption">EUROPEAN ROULETTE · 0–36</div><div class="cf-roulette-wheel-wrap"><div class="cf-roulette-pointer">▼</div><div class="cf-roulette-wheel" id="cf-roulette-wheel"><div class="cf-roulette-pocket" data-number="0" style="transform:rotate(4.864865deg)"><span style="background:#16834d">0</span></div><div class="cf-roulette-pocket" data-number="32" style="transform:rotate(14.594595deg)"><span style="background:#bd2433">32</span></div><div class="cf-roulette-pocket" data-number="15" style="transform:rotate(24.324324deg)"><span style="background:#171923">15</span></div><div class="cf-roulette-pocket" data-number="19" style="transform:rotate(34.054054deg)"><span style="background:#bd2433">19</span></div><div class="cf-roulette-pocket" data-number="4" style="transform:rotate(43.783784deg)"><span style="background:#171923">4</span></div><div class="cf-roulette-pocket" data-number="21" style="transform:rotate(53.513514deg)"><span style="background:#bd2433">21</span></div><div class="cf-roulette-pocket" data-number="2" style="transform:rotate(63.243243deg)"><span style="background:#171923">2</span></div><div class="cf-roulette-pocket" data-number="25" style="transform:rotate(72.972973deg)"><span style="background:#bd2433">25</span></div><div class="cf-roulette-pocket" data-number="17" style="transform:rotate(82.702703deg)"><span style="background:#171923">17</span></div><div class="cf-roulette-pocket" data-number="34" style="transform:rotate(92.432432deg)"><span style="background:#bd2433">34</span></div><div class="cf-roulette-pocket" data-number="6" style="transform:rotate(102.162162deg)"><span style="background:#171923">6</span></div><div class="cf-roulette-pocket" data-number="27" style="transform:rotate(111.891892deg)"><span style="background:#bd2433">27</span></div><div class="cf-roulette-pocket" data-number="13" style="transform:rotate(121.621622deg)"><span style="background:#171923">13</span></div><div class="cf-roulette-pocket" data-number="36" style="transform:rotate(131.351351deg)"><span style="background:#bd2433">36</span></div><div class="cf-roulette-pocket" data-number="11" style="transform:rotate(141.081081deg)"><span style="background:#171923">11</span></div><div class="cf-roulette-pocket" data-number="30" style="transform:rotate(150.810811deg)"><span style="background:#bd2433">30</span></div><div class="cf-roulette-pocket" data-number="8" style="transform:rotate(160.540541deg)"><span style="background:#171923">8</span></div><div class="cf-roulette-pocket" data-number="23" style="transform:rotate(170.270270deg)"><span style="background:#bd2433">23</span></div><div class="cf-roulette-pocket" data-number="10" style="transform:rotate(180.000000deg)"><span style="background:#171923">10</span></div><div class="cf-roulette-pocket" data-number="5" style="transform:rotate(189.729730deg)"><span style="background:#bd2433">5</span></div><div class="cf-roulette-pocket" data-number="24" style="transform:rotate(199.459459deg)"><span style="background:#171923">24</span></div><div class="cf-roulette-pocket" data-number="16" style="transform:rotate(209.189189deg)"><span style="background:#bd2433">16</span></div><div class="cf-roulette-pocket" data-number="33" style="transform:rotate(218.918919deg)"><span style="background:#171923">33</span></div><div class="cf-roulette-pocket" data-number="1" style="transform:rotate(228.648649deg)"><span style="background:#bd2433">1</span></div><div class="cf-roulette-pocket" data-number="20" style="transform:rotate(238.378378deg)"><span style="background:#171923">20</span></div><div class="cf-roulette-pocket" data-number="14" style="transform:rotate(248.108108deg)"><span style="background:#bd2433">14</span></div><div class="cf-roulette-pocket" data-number="31" style="transform:rotate(257.837838deg)"><span style="background:#171923">31</span></div><div class="cf-roulette-pocket" data-number="9" style="transform:rotate(267.567568deg)"><span style="background:#bd2433">9</span></div><div class="cf-roulette-pocket" data-number="22" style="transform:rotate(277.297297deg)"><span style="background:#171923">22</span></div><div class="cf-roulette-pocket" data-number="18" style="transform:rotate(287.027027deg)"><span style="background:#bd2433">18</span></div><div class="cf-roulette-pocket" data-number="29" style="transform:rotate(296.756757deg)"><span style="background:#171923">29</span></div><div class="cf-roulette-pocket" data-number="7" style="transform:rotate(306.486486deg)"><span style="background:#bd2433">7</span></div><div class="cf-roulette-pocket" data-number="28" style="transform:rotate(316.216216deg)"><span style="background:#171923">28</span></div><div class="cf-roulette-pocket" data-number="12" style="transform:rotate(325.945946deg)"><span style="background:#bd2433">12</span></div><div class="cf-roulette-pocket" data-number="35" style="transform:rotate(335.675676deg)"><span style="background:#171923">35</span></div><div class="cf-roulette-pocket" data-number="3" style="transform:rotate(345.405405deg)"><span style="background:#bd2433">3</span></div><div class="cf-roulette-pocket" data-number="26" style="transform:rotate(355.135135deg)"><span style="background:#171923">26</span></div><div class="cf-roulette-hub">✦</div></div><div class="cf-roulette-ball" id="cf-roulette-ball"></div></div><div class="cf-roulette-choices"><button type="button" data-choice="red">🔴 КРАСНОЕ · 2×</button><button type="button" data-choice="black">⚫ ЧЁРНОЕ · 2×</button><button type="button" data-choice="green">🟢 ЗЕЛЁНОЕ · 36×</button></div><div class="cf-roulette-caption" style="margin-top:16px">ИЛИ ВЫБЕРИ НОМЕР · 36×</div><div class="cf-roulette-number-grid">'+rouletteNumbers.slice().sort((a,b)=>a-b).map(n=>{const reds=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];return '<button type="button" data-number="'+n+'" style="background:'+(n===0?'#16834d':reds.includes(n)?'#bd2433':'#171923')+'">'+n+'</button>'}).join('')+'</div><div class="cf-roulette-footnote">Шарик вращается и падает в выпавший сектор · 0 — зелёное</div></div>'}
  function roulette(){return panel('Рулетка','<div class="cf-roulette-game">'+rouletteWheelMarkup()+'<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><button class="primary" data-action="play-game" data-game="roulette" style="flex:0 0 auto;width:42%;min-height:38px;padding:7px 8px;font-size:13px">Играть</button><label style="flex:1;min-width:0;font-size:11px;color:#c5b6df;text-align:left">Ставка<input id="cf-bet" type="number" min="1" max="100000" value="100" style="display:block;width:100%;box-sizing:border-box;margin-top:3px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:7px;padding:6px;text-align:center;font-size:13px"></label></div><div id="cf-game-result" style="text-align:center;color:#e6d8ff;min-height:18px;font-size:11px;margin:4px 0"></div></div>')}
  let blackjackRoomId=null,blackjackPoll=null;
  function blackjack(){
    return panel('Блэкджек',
      '<p style="color:#c5b6df;text-align:center;margin:0 0 16px">Настоящий стол с дилером, картами и игроками в комнате.</p>'+
      '<div class="fieldrow"><label class="field">Ставка на игрока <input id="cf-bj-bet" type="number" min="1" max="100000" value="100" style="width:100%;margin-top:8px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:8px;padding:8px;text-align:center"></label></div>'+
      '<button class="primary" data-action="bj-create">＋ Создать стол</button>'+
      '<button class="secondary" data-action="bj-open-lobby" style="margin-top:10px">♣ Открыть комнаты игроков</button>'+
      '<div class="section-title">Войти по приглашению</div><div class="fieldrow"><label class="field">Код комнаты <input id="cf-bj-code" maxlength="8" placeholder="Например A1B2C3D4" style="width:100%;margin-top:8px;background:#0b0918;color:white;border:1px solid #6c3a9e;border-radius:8px;padding:8px;text-align:center;text-transform:uppercase"></label></div><button class="secondary" data-action="bj-join">Войти по коду</button>'+
      '<div id="cf-bj-room"></div>');
  }
  async function openBlackjackLobby(){
    let modal=app.querySelector('#cf-bj-lobby-modal');
    if(modal)modal.remove();
    app.insertAdjacentHTML('beforeend','<div class="modal-backdrop" id="cf-bj-lobby-modal"><section class="modal-card" role="dialog" aria-modal="true" style="max-width:520px"><button type="button" class="modal-close" data-action="bj-close-lobby">×</button><div class="section-title">♣ Открытые столы</div><p style="color:#c5b6df;font-size:12px">Здесь показаны реальные комнаты игроков, ожидающих соперников.</p><div id="cf-bj-lobby-list">Загружаем комнаты…</div><button class="secondary" data-action="bj-lobby-refresh">↻ Обновить список</button></section></div>');
    await refreshBlackjackLobby();
  }
  async function refreshBlackjackLobby(){
    const list=app.querySelector('#cf-bj-lobby-list');if(!list)return;
    try{
      const data=await api('/api/blackjack/rooms');
      if(!data.rooms.length){list.innerHTML='<div class="bj-tip">Пока нет открытых столов. Создай стол и дождись других игроков.</div>';return}
      list.innerHTML=data.rooms.map(r=>'<div class="bj-invite-panel"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong>Стол '+r.inviteCode+'</strong><strong>'+formatBalance(r.bet)+' ✦</strong></div><div style="font-size:12px;color:#c5b6df;margin:8px 0">'+r.playerCount+'/5 игроков · готовы '+r.readyCount+'/'+r.playerCount+'</div><div class="bj-seat-layout">'+(r.players||[]).map(p=>'<div class="bj-player"><div class="bj-seat-number">МЕСТО '+p.seat+'</div><strong>'+p.name+'</strong><div style="font-size:11px;margin-top:4px">'+(p.ready?'🟢 Готов':'🟡 Ожидает')+'</div></div>').join('')+'</div><button class="primary" data-action="bj-join-lobby" data-code="'+r.inviteCode+'">Присоединиться</button></div>').join('');
    }catch(error){list.innerHTML='<div class="bj-tip">'+error.message+'</div>'}
  }
  function cardText(c){if(!c)return '🂠';if(c.hidden)return '🂠';return ({1:'A',11:'J',12:'Q',13:'K'}[c.rank]||c.rank)+c.suit}
  function blackjackCardHtml(c){
    if(!c||c.hidden)return '<div class="bj-card hidden">✦</div>';
    const face=({1:'A',11:'J',12:'Q',13:'K'}[c.rank]||c.rank);
    return '<div class="bj-card '+(['♥','♦'].includes(c.suit)?'red':'')+'"><span>'+face+'</span><span class="bj-suit">'+c.suit+'</span><span>'+face+'</span></div>';
  }
  function blackjackAdvice(hand){
    const total=hand.reduce((n,c)=>n+(c.rank===1?11:Math.min(c.rank,10)),0);
    const aces=hand.filter(c=>c.rank===1).length;
    let score=total;while(score>21&&aces>0){score-=10;aces--}
    if(score>=17)return 'Обычно стоит остановиться: '+score+' очков.';
    if(score<=11)return 'Обычно стоит взять карту: перебора одной картой не будет.';
    if(score===12)return '12 очков: решение зависит от открытой карты дилера.';
    return score+' очков: сравни с открытой картой дилера. Это подсказка, не гарантия выигрыша.';
  }
  let blackjackRefreshBusy=false;
  function renderBlackjackRoom(room){
    blackjackRoomId=room.id;
    const box=app.querySelector('#cf-bj-room');if(!box)return;
    if(blackjackPoll){clearInterval(blackjackPoll);blackjackPoll=null;}
    blackjackPoll=setInterval(async()=>{
      if(blackjackRefreshBusy||current!=='blackjack'||!blackjackRoomId)return;
      blackjackRefreshBusy=true;
      try{const fresh=await api('/api/blackjack/rooms/'+blackjackRoomId);if(current==='blackjack')renderBlackjackRoom(fresh.room);}
      catch(error){console.warn('Blackjack refresh:',error.message)}
      finally{blackjackRefreshBusy=false}
    },2500);
    const me=room.players.find(p=>p.isMe);
    const dealerHand=room.state?.dealerHand||[];
    const dealer=dealerHand.map(blackjackCardHtml).join('');
    const statusText={waiting:'Ожидает начала',playing:'Твой ход',stood:'Остановился',busted:'Перебор — проигрыш',blackjack:'Натуральный блэкджек',finished:'Раунд завершён'};
    box.innerHTML='<div class="section-title">СТОЛ · '+room.inviteCode+'</div>'+
      '<div class="bj-felt"><div class="bj-dealer-label">ДИЛЕР</div><div class="bj-cards">'+(dealer||'<span>Карты появятся после начала раздачи</span>')+'</div>'+
      (room.state?.dealerScore!==undefined?'<strong>Очки дилера: '+room.state.dealerScore+'</strong>':'<small>Одна карта дилера скрыта до завершения раунда</small>')+'</div>'+
      '<div class="bj-invite-panel"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><small style="color:#d8bd80">СТАВКА НА ИГРОКА</small><div style="font-weight:900;font-size:20px">'+formatBalance(room.bet)+' <span style="color:#e4c36b">✦</span></div></div><div class="bj-chip">CF</div></div><div style="margin-top:10px;color:#e7d6b3;font-size:12px">Код приглашения: <strong>'+room.inviteCode+'</strong></div><div class="bj-share-row"><button class="secondary" data-action="bj-copy">📋 Скопировать код</button><button class="primary" data-action="bj-share">✉️ Пригласить в Telegram</button></div></div>'+
      '<div class="section-title">ИГРОКИ ('+room.players.length+'/5)</div>'+
      '<div class="bj-seat-layout">'+room.players.map(p=>'<div class="bj-player '+(p.isMe?'me':'')+'"><div class="bj-seat-number">МЕСТО '+p.seat+'</div><strong>'+(p.firstName||p.username||('Игрок '+p.seat))+(p.isMe?' · ТВОЯ РУКА':'')+'</strong><div class="bj-cards">'+(p.hand.length?p.hand.map(blackjackCardHtml).join(''):'<small>Карты выдаются при старте</small>')+'</div>'+
      '<strong>'+ (p.score!==null&&p.score!==undefined?p.score+' очков':'—')+'</strong><div style="font-size:12px;margin-top:5px">'+(statusText[p.status]||p.status)+(p.doubled?' · УДВОЕНО':'')+(p.status==='finished'?' · выплата '+formatBalance(p.payout)+' ✦':'')+'</div></div>').join('')+
      (room.status==='waiting'?'<div class="bj-tip">Раздача начнётся автоматически, когда за столом будет минимум 2 игрока и все нажмут «Готов».</div><div class="bj-seat-layout">'+room.players.map(p=>'<div class="bj-player '+(p.isMe?'me':'')+'"><div class="bj-seat-number">МЕСТО '+p.seat+'</div><strong>'+(p.firstName||p.username||('Игрок '+p.seat))+(p.isMe?' · ТЫ':'')+'</strong><div style="margin-top:5px">'+(p.ready?'🟢 ГОТОВ':'🟡 НЕ ГОТОВ')+'</div></div>').join('')+'</div><button class="primary" data-action="bj-ready" data-ready="'+Boolean(me?.ready)+'">'+(me?.ready?'✓ Ты готов · отменить':'Я готов')+'</button>':'')+
      (room.status==='playing'&&me?.status==='playing'?'<div class="bj-tip"><strong>Твой ход.</strong><br>'+blackjackAdvice(me.hand)+'<br><small>Удвоение доступно только после первых двух карт и требует ещё одну такую же ставку.</small></div><div class="bj-actionrow"><button class="secondary" data-action="bj-hit">➕ Взять карту</button><button class="secondary" data-action="bj-stand">✋ Стоп</button><button class="primary" data-action="bj-double" '+(me.hand.length!==2||me.doubled?'disabled':'')+'>×2 Удвоить</button></div>':'')+
      (room.status==='playing'&&me&&me.status!=='playing'?'<div class="bj-tip">Твой ход завершён. Ждём остальных игроков. Стол обновится автоматически.</div>':'')+
      (room.status==='finished'?'<div class="bj-tip">Раунд завершён. Выплаты рассчитаны сервером. Для нового раунда каждый участник должен подтвердить готовность.</div><div class="bj-seat-layout">'+room.players.map(p=>'<div class="bj-player '+(p.isMe?'me':'')+'"><strong>'+(p.firstName||p.username||('Игрок '+p.seat))+'</strong><div style="margin-top:5px">'+(p.ready?'🟢 ГОТОВ':'🟡 ЕЩЁ НЕ ГОТОВ')+'</div></div>').join('')+'</div><button class="primary" data-action="bj-ready" data-ready="'+Boolean(me?.ready)+'">'+(me?.ready?'✓ Ты готов · отменить':'↻ Готов к следующему раунду')+'</button>':'')+
      '<button class="secondary" data-action="bj-refresh">Обновить стол</button>';
  }

  function bonusWheelCard(){return '<section class="gamepanel" style="text-align:center"><div class="cf-bonus-wheel-wrap"><div class="cf-bonus-pointer"></div><div class="wheel spinwheel cf-bonus-prize-wheel" id="cf-bonus-wheel"><span class="cf-bonus-label l1" data-prize="million"><small>1 000 000 ✦</small></span><span class="cf-bonus-label l2" data-prize="250k"><small>250 000 ✦</small></span><span class="cf-bonus-label l3" data-prize="500rub"><small>500₽</small></span><span class="cf-bonus-label l4" data-prize="25k"><small>25к₽</small></span><span class="cf-bonus-label l5" data-prize="10k"><small>10к₽</small></span><span class="cf-bonus-label l6" data-prize="5k"><small>5к₽</small></span><span class="cf-bonus-label l7" data-prize="2k"><small>2к₽</small></span><span class="cf-bonus-label l8" data-prize="1k"><small>1к₽</small></span></div></div><div id="cf-bonus-timer" style="font-size:12px;color:#ffdf8b;margin:8px 0">Проверяем доступность…</div>'+primary('🎡 Крутить бесплатно','bonus-wheel')+'<div id="cf-bonus-result" style="min-height:26px;margin-top:12px;color:#ffe09a"></div><p style="color:#9e8ab9;font-size:10px;margin:6px 0 0">Все призы — виртуальные игровые кредиты ✦. Обозначения не являются реальными рублями и не означают денежную выплату.</p></section>'}
  let bonusTimerInterval=null;
  async function refreshBonusStatus(){
    const timer=app.querySelector('#cf-bonus-timer'),button=app.querySelector('[data-action="bonus-wheel"]');
    if(!timer)return;
    try{
      const status=await api('/api/bonus-wheel/status');
      if(status.available){timer.textContent='🎉 Рулетка доступна!';if(button){button.disabled=false;button.textContent='🎡 Крутить бесплатно';}}
      else{
        const left=Math.max(0,new Date(status.nextAvailableAt).getTime()-Date.now());
        const hours=Math.floor(left/3600000),minutes=Math.floor((left%3600000)/60000),seconds=Math.floor((left%60000)/1000);
        timer.textContent='Следующая попытка через '+String(hours).padStart(2,'0')+':'+String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');
        if(button){button.disabled=true;button.textContent='⏳ Уже использовано';}
      }
    }catch(error){timer.textContent='Не удалось проверить таймер';}
  }
  function openBonusWheel(){
    if(app.querySelector('#cf-wheel-modal'))return;
    app.insertAdjacentHTML('beforeend','<div class="modal-backdrop cf-bottom-modal cf-wheel-modal" id="cf-wheel-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-label="Бонусная рулетка"><button type="button" class="modal-close" data-action="close-bonus-wheel" aria-label="Закрыть">×</button><div class="section-title">🎁 Бонусная рулетка дня</div>'+bonusWheelCard()+'</section></div>');
    refreshBonusStatus();if(bonusTimerInterval)clearInterval(bonusTimerInterval);bonusTimerInterval=setInterval(refreshBonusStatus,1000);
  }
  function dailyRewardCard(){const rewards=[500,1000,1500,2500,4000,6000,10000,25000];return '<section class="gamepanel" style="margin-bottom:14px"><div class="section-title" style="margin-top:0">📅 Ежедневные награды</div><p style="color:#c5b6df;font-size:12px;margin:0 0 12px">Забирай награду каждые 24 часа. Заходи подряд, чтобы продвигаться по цепочке из 8 дней.</p><div class="cf-daily-grid">'+rewards.map((v,i)=>'<div class="cf-daily-day" data-daily-day="'+(i+1)+'"><small>ДЕНЬ '+(i+1)+'</small><strong>+'+v.toLocaleString('ru-RU')+'</strong><span>✦ кредитов</span></div>').join('')+'</div><div id="cf-daily-status" style="font-size:12px;color:#ffdf8b;margin:12px 0 8px">Проверяем доступность…</div><button class="primary" data-action="daily" id="cf-daily-claim">🎁 Забрать награду</button><div id="cf-daily-result" style="color:#ffe09a;font-size:12px;margin-top:9px"></div></section>'}
  async function refreshDailyRewardStatus(){const statusEl=app.querySelector('#cf-daily-status'),button=app.querySelector('#cf-daily-claim');if(!statusEl||!button)return;try{const data=await api('/api/daily-reward/status');const rewards=[500,1000,1500,2500,4000,6000,10000,25000];app.querySelectorAll('[data-daily-day]').forEach(el=>{const day=Number(el.dataset.dailyDay);el.classList.toggle('is-claimed',data.available?day<data.streakDay:day<=data.claimedDay);el.classList.toggle('is-current',day===data.streakDay);const amount=el.querySelector('strong');if(amount)amount.textContent='+'+rewards[day-1].toLocaleString('ru-RU')});if(data.available){statusEl.textContent='🎉 Награда дня '+data.streakDay+' доступна!';button.disabled=false;button.textContent='🎁 Забрать +'+rewards[data.streakDay-1].toLocaleString('ru-RU')+' кредитов'}else{const left=Math.max(0,new Date(data.nextAvailableAt).getTime()-Date.now()),h=Math.floor(left/3600000),m=Math.floor(left%3600000/60000),sec=Math.floor(left%60000/1000);statusEl.textContent='Следующая награда через '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');button.disabled=true;button.textContent='⏳ Уже получено'} }catch(error){statusEl.textContent='Не удалось проверить награду';button.disabled=false;button.textContent='↻ Проверить ещё раз'}}
  function openDailyReward(){if(app.querySelector('#cf-daily-modal'))return;app.insertAdjacentHTML('beforeend','<div class="modal-backdrop cf-bottom-modal" id="cf-daily-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-label="Ежедневные награды"><button type="button" class="modal-close" data-action="close-daily-reward" aria-label="Закрыть">×</button>'+dailyRewardCard()+'</section></div>');refreshDailyRewardStatus();if(dailyTimerInterval)clearInterval(dailyTimerInterval);dailyTimerInterval=setInterval(refreshDailyRewardStatus,1000)}
  let dailyTimerInterval=null;
  function closeDailyReward(){app.querySelector('#cf-daily-modal')?.remove();if(dailyTimerInterval){clearInterval(dailyTimerInterval);dailyTimerInterval=null}}
  function bonuses(){return '<div class="section-title">🎁 Бонусы и награды</div><div class="cf-bonus-menu"><button class="cf-bonus-open" data-action="open-daily-reward"><span class="cf-bonus-open-icon">📅</span><span><strong>Ежедневные награды · 8 дней</strong><small>Забирай кредиты каждые 24 часа</small></span></button><button class="cf-bonus-open" data-action="open-bonus-wheel"><span class="cf-bonus-open-icon">🎡</span><span><strong>Бонусная рулетка</strong><small>Бесплатное вращение каждые 24 часа</small></span></button></div>'}
  function profile(){return '<div class="section-title">👤 Мой профиль</div><section class="gamepanel cf-profile-card"><div class="cf-profile-identity"><div class="avatar" id="cf-profile-avatar">🚀</div><div style="min-width:0"><strong id="cf-profile-name">Загрузка профиля…</strong><div id="cf-profile-username" class="cf-profile-muted">Загружаем Telegram</div></div></div><div class="cf-profile-data"><div><small>TELEGRAM ID</small><strong id="cf-profile-id">—</strong></div><div><small>USERNAME</small><strong id="cf-profile-tag">—</strong></div></div><div class="cf-profile-balance"><small>ВИРТУАЛЬНЫЕ КРЕДИТЫ</small><strong>✦ <span id="cf-profile-balance">—</span></strong><p>Используются для ставок внутри игры.</p></div><div class="cf-profile-balance cf-stars-balance"><small>ПОПОЛНЕНИЕ КРЕДИТОВ</small><strong>⭐ Покупка за Telegram Stars</strong><p>Кредиты начисляются только после подтверждения оплаты Telegram.</p><div style="display:grid;gap:8px;margin-top:12px"><button class="widecard" style="margin:0" data-action="buy-credits" data-stars="15"><div style="flex:1;text-align:left"><strong>15 ⭐ → 50 000 кредитов</strong><small>Оплата внутри Telegram</small></div>›</button><button class="widecard" style="margin:0" data-action="buy-credits" data-stars="25"><div style="flex:1;text-align:left"><strong>25 ⭐ → 100 000 кредитов</strong><small>Оплата внутри Telegram</small></div>›</button><button class="widecard" style="margin:0" data-action="buy-credits" data-stars="50"><div style="flex:1;text-align:left"><strong>50 ⭐ → 200 000 кредитов</strong><small>Оплата внутри Telegram</small></div>›</button><button class="widecard" style="margin:0" data-action="buy-credits" data-stars="100"><div style="flex:1;text-align:left"><strong>100 ⭐ → 400 000 кредитов</strong><small>Оплата внутри Telegram</small></div>›</button></div><button class="widecard cf-history-open" style="margin-top:12px;border:1px solid #8b5bd0;background:linear-gradient(110deg,#2c1745,#160d25)" data-action="open-purchase-history" aria-expanded="false"><span style="font-size:20px">🧾</span><div style="flex:1;text-align:left"><strong>История покупок</strong><small>Все пополнения и статусы оплат</small></div><span class="cf-history-chevron">⌄</span></button><div id="cf-payment-history" style="display:none;margin-top:12px;padding:0 10px"></div></div><div class="cf-profile-balance"><small>ЗАЯВКА НА ПОДАРОК</small><strong>🎁 Обмен кредитов на вознаграждение</strong><p>Владелец проверяет заявки вручную. Кредиты резервируются; автоматической отправки подарка нет.</p><div style="display:grid;gap:8px;margin-top:12px"><button class="widecard" style="margin:0" data-action="request-withdrawal" data-credits="100000"><div style="flex:1;text-align:left"><strong>100 000 кредитов</strong><small>Заявка на подарок · справочный эквивалент 15 ⭐</small></div>›</button><button class="widecard" style="margin:0" data-action="request-withdrawal" data-credits="250000"><div style="flex:1;text-align:left"><strong>250 000 кредитов</strong><small>Заявка на подарок · справочный эквивалент 25 ⭐</small></div>›</button><button class="widecard" style="margin:0" data-action="request-withdrawal" data-credits="500000"><div style="flex:1;text-align:left"><strong>500 000 кредитов</strong><small>Заявка на подарок · справочный эквивалент 50 ⭐</small></div>›</button><button class="widecard" style="margin:0" data-action="request-withdrawal" data-credits="1000000"><div style="flex:1;text-align:left"><strong>1 000 000 кредитов</strong><small>Заявка на подарок · справочный эквивалент 100 ⭐</small></div>›</button></div><div id="cf-withdrawal-result" style="font-size:12px;margin-top:10px"></div></div><div id="cf-owner-tools"></div></section><section class="gamepanel"><button class="widecard cf-history-open" style="margin:0;border:1px solid #8b5bd0;background:linear-gradient(110deg,#2c1745,#160d25)" data-action="open-game-history" aria-expanded="false"><span style="font-size:20px">🎮</span><div style="flex:1;text-align:left"><strong>История игр</strong><small>Все раунды, ставки и результаты</small></div><span class="cf-history-chevron">⌄</span></button><div id="cf-profile-history" style="display:none;margin-top:12px"><p class="cf-profile-muted">Загружаем историю…</p></div></section>'+panel('Быстрые действия','<button class="widecard" data-go="games">🎮　Играть　›</button><button class="widecard" data-go="bonuses">🎁　Бонусы и награды　›</button>')}
  function tournaments(){return panel('🏆 Турниры','<div class="bigart">🏆</div><p style="text-align:center;color:#c4b5dd">Турнирная таблица ещё не подключена. Игровые раунды в слотах, костях, рулетке и блэкджеке уже отправляются на сервер.</p>'+primary('К списку игр','games'))}

  function miner(){return panel('💎 МИНЕР','<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:16px;color:#e8d9ff"><label style="display:flex;flex-direction:column;gap:7px;font-size:14px;font-weight:700">РАЗМЕР ПОЛЯ<select id="cf-miner-size" style="background:#160b29;color:white;border:1px solid #7044a8;border-radius:10px;padding:10px;font-size:16px"><option value="3">3 × 3</option><option value="5" selected>5 × 5</option><option value="6">6 × 6</option></select></label><label style="display:flex;flex-direction:column;gap:7px;font-size:14px;font-weight:700">КОЛИЧЕСТВО МИН<select id="cf-miner-mines" style="background:#160b29;color:white;border:1px solid #7044a8;border-radius:10px;padding:10px;font-size:16px"><option value="3">3</option><option value="5" selected>5</option><option value="7">7</option><option value="10">10</option></select></label></div><div id="cf-miner-grid" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">'+Array.from({length:25},(_,i)=>'<button data-miner-tile="'+i+'" style="aspect-ratio:1;border:1px solid #7044a8;border-radius:10px;background:#180b30;color:#d9aaff;font-size:24px">✦</button>').join('')+'</div><div id="cf-miner-multiplier" style="font-size:24px;color:#ffda73;margin:12px 0">1.00×</div><div id="cf-miner-status">Открывай кристаллы и избегай мин</div><div style="margin-top:18px"><label for="cf-bet" style="display:block;margin-bottom:8px;font-size:14px;font-weight:800;letter-spacing:.08em;color:#c9b1eb">РАЗМЕР СТАВКИ</label><input id="cf-bet" aria-label="Размер ставки в виртуальных кредитах" type="number" min="1" max="100000" step="1" value="100" style="display:block;box-sizing:border-box;width:100%;height:54px;padding:0 16px;background:#0b0918;color:white;border:1px solid #7044a8;border-radius:12px;font-size:20px"></div><button class="primary" data-action="miner-start" style="margin-top:12px">Начать игру</button><button class="primary" data-action="miner-cashout" style="display:none;margin-top:8px">Забрать выигрыш</button>');}
  function luckyjet(){return panel('🚀 LUCKY JET','<div id="cf-jet-history" style="display:flex;gap:6px;overflow:hidden;margin:0 0 10px;padding:2px 0;white-space:nowrap"><span style="background:#37206c;color:#c7b6ff;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:900">Загрузка результатов…</span></div><div class="cf-flight" id="cf-jet-scene" style="position:relative;overflow:hidden;isolation:isolate;height:clamp(250px,58vw,340px);min-height:250px;max-height:340px;width:100%;flex:none;box-sizing:border-box;border:1px solid #8b45ff;border-radius:15px;background-color:#0a0718;background-image:url(https://raw.githubusercontent.com/softpasha6-cpu/cosmi-fortune/main/wide_cinematic_sci_fi_space_landscape_wallpaper_a.png);background-position:center;background-size:100% 100%;background-repeat:no-repeat;box-shadow:inset 0 0 22px #0006"><div aria-hidden="true" style="display:none"></div><svg aria-hidden="true" viewBox="0 0 360 240" preserveAspectRatio="none" style="display:none"><defs><linearGradient id="cfJetPath" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffb74a"/><stop offset=".5" stop-color="#ed65ff"/><stop offset="1" stop-color="#b8a0ff"/></linearGradient></defs><path d="M 18 218 C 78 216, 88 194, 124 177 S 177 143, 202 115 S 253 69, 342 18" fill="none" stroke="#b34eff" stroke-opacity=".14" stroke-width="14" stroke-linecap="round"/><path d="M 18 218 C 78 216, 88 194, 124 177 S 177 143, 202 115 S 253 69, 342 18" fill="none" stroke="url(#cfJetPath)" stroke-opacity=".5" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round"/></svg><div class="cf-stars" aria-hidden="true" style="display:none;background-image:radial-gradient(1.5px 1.5px at 8% 18%,#fff 65%,transparent),radial-gradient(1px 1px at 18% 62%,#cdbbff 65%,transparent),radial-gradient(1.5px 1.5px at 29% 28%,#fff 65%,transparent),radial-gradient(1px 1px at 43% 12%,#ffe0a0 65%,transparent),radial-gradient(1px 1px at 52% 53%,#e8d8ff 65%,transparent),radial-gradient(1.5px 1.5px at 67% 21%,#fff 65%,transparent),radial-gradient(1px 1px at 76% 67%,#d8c2ff 65%,transparent),radial-gradient(1.5px 1.5px at 91% 34%,#fff 65%,transparent),radial-gradient(1px 1px at 95% 78%,#ffdb9b 65%,transparent);background-size:100% 100%;opacity:.68"></div><div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,transparent 0%,#a46aff08 48%,transparent 75%);border-bottom:1px solid #b88bff22"></div><div class="cf-trail-glow" style="position:absolute;left:28px;bottom:110px;width:70%;height:5px;border-radius:100%;background:#b53bff;filter:blur(13px);transform-origin:left center;transition:transform .18s linear"></div><div class="cf-trail" id="cf-jet-trail" style="position:absolute;left:28px;bottom:110px;width:70%;height:3px;border-radius:100%;background:linear-gradient(90deg,#ffb02e,#f66bff,#9a6dff,transparent);filter:drop-shadow(0 0 7px #e84fff);transform-origin:left center;transition:transform .18s linear"></div><div style="display:none"></div><div id="cf-jet-rocket-wrap" class="cf-rocket" style="position:absolute;left:12px;bottom:72px;z-index:3;width:clamp(54px,17vw,72px);height:clamp(54px,17vw,72px);display:grid;place-items:center;filter:drop-shadow(0 0 7px #ff8a38) drop-shadow(0 0 12px #9c42ff88);transform-origin:50% 50%;will-change:transform;pointer-events:none"><img src="https://raw.githubusercontent.com/softpasha6-cpu/cosmi-fortune/main/a_high_quality_detailed_glossy_3d_cgi_style_spac.png" alt="Ракета Lucky Jet" draggable="false" style="width:100%;height:100%;object-fit:contain;mix-blend-mode:screen;pointer-events:none;user-select:none"></div><div id="cf-jet-explosion" style="display:none;position:absolute;left:42%;top:28%;font-size:90px;z-index:5">💥</div><div style="position:absolute;top:16px;left:16px;font-size:11px;letter-spacing:.15em;color:#e0b8ff;font-weight:900">COSMIC FLIGHT</div><div style="position:absolute;left:0;right:0;bottom:10px;text-align:center;z-index:4;pointer-events:none"><div id="cf-jet-multiplier" style="font-size:clamp(42px,12vw,58px);line-height:1;font-weight:1000;color:#d56aff;text-shadow:0 0 22px #b52cff">1.00×</div><div id="cf-jet-status" style="margin-top:8px;color:#f0e1ff">Ракета готова к запуску</div></div></div><div style="padding:14px;margin-top:14px;border:1px solid #553080;border-radius:16px;background:linear-gradient(135deg,#1b1030,#0b0816)"><div id="cf-jet-result" style="color:#ffe08a;font-weight:800;margin:8px 0"></div><div style="padding:12px;margin-top:12px;border:1px solid #322651;border-radius:18px;background:linear-gradient(145deg,#211a43,#19132f);box-shadow:inset 0 1px 0 #ffffff08"><div style="display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;margin-bottom:12px;color:#f0eaff"><label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;white-space:nowrap"><input id="cf-jet-autobet-0" type="checkbox" style="width:17px;height:17px;accent-color:#773cff"> Автоставка</label><label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;white-space:nowrap"><input id="cf-jet-autocash-0" type="checkbox" style="width:17px;height:17px;accent-color:#773cff"> Автовывод</label><input id="cf-jet-auto-value-0" class="cf-bet-input" type="number" min="1.1" max="100" step="0.1" value="2.00" style="width:76px;box-sizing:border-box;padding:9px 5px;text-align:center;font-weight:900"></div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:9px"><div style="border-radius:15px;background:#17112d;border:1px solid #30234d;padding:8px"><div style="display:grid;grid-template-columns:38px minmax(0,1fr) 38px;align-items:center;gap:5px"><button type="button" data-jet-adjust="0" data-delta="-1" style="height:38px;border:0;border-radius:11px;background:#211a42;color:#b6a2ef;font-size:27px;font-weight:900">−</button><input class="cf-bet-input" id="cf-bet" type="number" min="1" max="100000" step="1" value="100" style="min-width:0;width:100%;box-sizing:border-box;border:0;background:transparent;text-align:center;font-size:clamp(16px,4.2vw,20px);font-weight:900;color:#fff;padding:4px 0;letter-spacing:-.04em"><button type="button" data-jet-adjust="0" data-delta="1" style="height:38px;border:0;border-radius:11px;background:#211a42;color:#b6a2ef;font-size:27px;font-weight:900">+</button></div><div style="height:1px;background:#30234d;margin:8px 0"></div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px"><button type="button" data-jet-quick="0" data-value="1" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">1</button><button type="button" data-jet-quick="0" data-value="25" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">25</button><button type="button" data-jet-quick="0" data-value="500" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">500</button><button type="button" data-jet-quick="0" data-value="10000" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">10K</button></div></div><button type="button" class="cf-button" data-action="jet-start" data-bet-index="0" style="min-width:0;margin:0;padding:8px 4px;border-radius:18px;background:linear-gradient(120deg,#5622ff,#933dff);border:0;box-shadow:0 5px 0 #2d1768,0 0 18px #6c2dff30;font-size:clamp(13px,3.8vw,17px);font-weight:900;letter-spacing:.02em;min-height:42px;align-self:center">СТАВКА</button></div><button class="cf-button" data-action="jet-cashout" data-bet-index="0" style="display:none;margin-top:8px;min-width:0;padding:10px 6px;background:linear-gradient(105deg,#12dba0,#07835e)">✦ ЗАБРАТЬ ВЫИГРЫШ</button></div><div style="padding:12px;margin-top:12px;border:1px solid #322651;border-radius:18px;background:linear-gradient(145deg,#211a43,#19132f);box-shadow:inset 0 1px 0 #ffffff08"><div style="display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;margin-bottom:12px;color:#f0eaff"><label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;white-space:nowrap"><input id="cf-jet-autobet-1" type="checkbox" style="width:17px;height:17px;accent-color:#773cff"> Автоставка</label><label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;white-space:nowrap"><input id="cf-jet-autocash-1" type="checkbox" style="width:17px;height:17px;accent-color:#773cff"> Автовывод</label><input id="cf-jet-auto-value-1" class="cf-bet-input" type="number" min="1.1" max="100" step="0.1" value="2.00" style="width:76px;box-sizing:border-box;padding:9px 5px;text-align:center;font-weight:900"></div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:9px"><div style="border-radius:15px;background:#17112d;border:1px solid #30234d;padding:8px"><div style="display:grid;grid-template-columns:38px minmax(0,1fr) 38px;align-items:center;gap:5px"><button type="button" data-jet-adjust="1" data-delta="-1" style="height:38px;border:0;border-radius:11px;background:#211a42;color:#b6a2ef;font-size:27px;font-weight:900">−</button><input class="cf-bet-input" id="cf-bet-2" type="number" min="1" max="100000" step="1" value="100" style="min-width:0;width:100%;box-sizing:border-box;border:0;background:transparent;text-align:center;font-size:clamp(16px,4.2vw,20px);font-weight:900;color:#fff;padding:4px 0;letter-spacing:-.04em"><button type="button" data-jet-adjust="1" data-delta="1" style="height:38px;border:0;border-radius:11px;background:#211a42;color:#b6a2ef;font-size:27px;font-weight:900">+</button></div><div style="height:1px;background:#30234d;margin:8px 0"></div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px"><button type="button" data-jet-quick="1" data-value="1" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">1</button><button type="button" data-jet-quick="1" data-value="25" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">25</button><button type="button" data-jet-quick="1" data-value="500" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">500</button><button type="button" data-jet-quick="1" data-value="10000" style="padding:8px 2px;border:0;border-radius:9px;background:#211a42;color:#a998d8;font-size:10px;font-weight:900">10K</button></div></div><button type="button" class="cf-button" data-action="jet-start" data-bet-index="1" style="min-width:0;margin:0;padding:8px 4px;border-radius:18px;background:linear-gradient(120deg,#5622ff,#933dff);border:0;box-shadow:0 5px 0 #2d1768,0 0 18px #6c2dff30;font-size:clamp(13px,3.8vw,17px);font-weight:900;letter-spacing:.02em;min-height:42px;align-self:center">СТАВКА</button></div><button class="cf-button" data-action="jet-cashout" data-bet-index="1" style="display:none;margin-top:8px;min-width:0;padding:10px 6px;background:linear-gradient(105deg,#12dba0,#07835e)">✦ ЗАБРАТЬ ВЫИГРЫШ</button></div><div id="cf-jet-result" style="color:#ffe08a;font-weight:800;margin:8px 0"></div></div><div style="display:flex;gap:8px;margin:16px 0 10px"><button type="button" style="flex:1;border:1px solid #5e3a91;background:#281744;color:#fff;border-radius:10px;padding:11px;font-weight:900">Все</button><button type="button" style="flex:1;border:1px solid #392451;background:#160e25;color:#b9a7d7;border-radius:10px;padding:11px;font-weight:800">Мои</button><button type="button" style="flex:1;border:1px solid #392451;background:#160e25;color:#b9a7d7;border-radius:10px;padding:11px;font-weight:800">Топ</button></div><div style="display:flex;align-items:center;justify-content:space-between;margin:10px 2px;color:#c4b5dd;font-size:12px"><span>Всего ставок <b id="cf-jet-bet-count" style="color:#fff">0</b></span><span style="background:#24143b;border-radius:8px;padding:7px 9px">◷ Пред. раунд</span></div><div id="cf-jet-bets" style="display:grid;gap:7px;margin-bottom:12px;max-height:112px;overflow:auto;overscroll-behavior:contain"><div style="display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;background:linear-gradient(100deg,#39205a,#241438);border:1px solid #5d3685;border-radius:10px;padding:10px;font-size:12px;color:#e8ddff"><span><b style="display:inline-grid;place-items:center;width:25px;height:25px;border-radius:8px;background:#8f64b4;margin-right:7px">CF</b>Cosmic Player</span><span style="background:#5d35a1;border-radius:7px;padding:5px 8px">—</span><b style="color:#f5c66f">—</b></div><div style="display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;background:#21132f;border-radius:10px;padding:10px;font-size:12px;color:#cbb9e1"><span><b style="display:inline-grid;place-items:center;width:25px;height:25px;border-radius:8px;background:#604078;margin-right:7px">CF</b>Ожидание игроков</span><span>—</span><b>—</b></div></div></div>');}
  const renderers={home,games:gameList,slots,dice,roulette,blackjack,miner,luckyjet,bonuses,profile,tournaments};
  let current='home',selected='Больше 7',opened=0;
  function render(name){current=renderers[name]?name:'home';content.innerHTML=renderers[current]();if(current==='luckyjet')startLuckyJetLiveUpdates();else if(jetLiveTimer){clearInterval(jetLiveTimer);jetLiveTimer=null;}if(current==='slots'){api('/api/me').then(d=>{const c=app.querySelector('#cf-rhino-credit');if(c)c.textContent=formatBalance(d.player?.balance??d.balance??d.account?.balance??d.user?.balance??d.credits??0)}).catch(()=>{const c=app.querySelector('#cf-rhino-credit');if(c)c.textContent='—'})}if(current==='luckyjet')jetStartLivePolling();if(current==='bonuses')refreshDailyRewardStatus();if(current==='profile'){renderTelegramProfileImmediately();refreshAccount();}app.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.go===current || (current==='mines'||current==='dice'||current==='wheel'||current==='crash')&&b.dataset.go==='games'));app.scrollTo({top:0,behavior:'instant'});}
  window.cfNavigate=function(name){try{render(name)}catch(error){console.error('Navigation failed',error);say('Не удалось открыть раздел. Перезапусти приложение.')}};
  // Capture taps before Telegram WebView or underlying page handlers can swallow them.
  document.addEventListener('click', function cosmicNavigationCapture(e){
    if(Date.now()<cfBlockClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}
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
  app.addEventListener('change',e=>{if(e.target?.id==='cf-miner-size'){const size=Number(e.target.value),mineSelect=app.querySelector('#cf-miner-mines');if(mineSelect){const max=size*size-1;Array.from(mineSelect.options).forEach(o=>{o.disabled=Number(o.value)>max});if(Number(mineSelect.value)>max)mineSelect.value='3';}const grid=app.querySelector('#cf-miner-grid');if(grid&&!minerRound){grid.style.gridTemplateColumns='repeat('+size+',minmax(0,1fr))';grid.innerHTML=Array.from({length:size*size},(_,i)=>'<button data-miner-tile="'+i+'" style="aspect-ratio:1;border:1px solid #7044a8;border-radius:10px;background:#180b30;color:#d9aaff;font-size:24px">✦</button>').join('')}}});
  let cfGesture=null,cfBlockClickUntil=0;
  document.addEventListener('touchstart',e=>{const p=e.touches&&e.touches[0];if(p)cfGesture={x:p.clientX,y:p.clientY,moved:false};},{passive:true,capture:true});
  document.addEventListener('touchmove',e=>{const p=e.touches&&e.touches[0];if(cfGesture&&p&&Math.hypot(p.clientX-cfGesture.x,p.clientY-cfGesture.y)>8){cfGesture.moved=true;cfBlockClickUntil=Date.now()+900;}},{passive:true,capture:true});
  document.addEventListener('touchend',()=>{if(cfGesture&&cfGesture.moved)cfBlockClickUntil=Date.now()+900;cfGesture=null;},{passive:true,capture:true});
  document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(t&&t.closest('#cf-app [data-go]')&&Date.now()<cfBlockClickUntil){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
  let minerRound=null,jetRound=null,jetRounds=[],jetTimer=null,jetLiveTimer=null;
  function syncBalance(n){const b=app.querySelector('#cf-balance');if(b)b.textContent=formatBalance(n);const p=app.querySelector('#cf-profile-balance');if(p)p.textContent=formatBalance(n)}
  async function minerStart(){const startButton=app.querySelector('[data-action="miner-start"]');if(startButton?.disabled)return;const bet=Number(app.querySelector('#cf-bet')?.value),size=Number(app.querySelector('#cf-miner-size')?.value),mines=Number(app.querySelector('#cf-miner-mines')?.value);if(!Number.isSafeInteger(bet)||bet<1||bet>100000)return say('Ставка должна быть от 1 до 100 000.');if(startButton){startButton.disabled=true;startButton.textContent='Запускаем…'}try{const d=await api('/api/miner/start',{method:'POST',body:JSON.stringify({bet,size,mines})});minerRound=d.round;const grid=app.querySelector('#cf-miner-grid');grid.style.gridTemplateColumns='repeat('+size+',minmax(0,1fr))';grid.innerHTML=Array.from({length:size*size},(_,i)=>'<button data-miner-tile="'+i+'" style="aspect-ratio:1;border:1px solid #7044a8;border-radius:10px;background:#180b30;color:#d9aaff;font-size:24px">✦</button>').join('');app.querySelector('[data-action="miner-start"]').style.display='none';app.querySelector('[data-action="miner-cashout"]').style.display='block';app.querySelector('#cf-miner-status').textContent='Раунд начат — открывай клетки';syncBalance(d.balance)}catch(e){say(e.message)}finally{if(startButton){startButton.disabled=false;startButton.textContent='Начать игру'}}}
  async function minerPick(i){if(!minerRound)return;try{const d=await api('/api/miner/pick',{method:'POST',body:JSON.stringify({roundId:minerRound.id,index:i})});minerRound=d.round;const tile=app.querySelector('[data-miner-tile="'+i+'"]');if(tile){tile.textContent=d.hit?'💣':'💎';tile.disabled=true}app.querySelector('#cf-miner-multiplier').textContent=Number(d.round.multiplier).toFixed(2)+'×';app.querySelector('#cf-miner-status').textContent=d.hit?'Мина! Раунд завершён':'Кристалл найден — забирай выигрыш или продолжай';if(d.finished){minerRound=null;app.querySelector('[data-action="miner-start"]').style.display='block';app.querySelector('[data-action="miner-cashout"]').style.display='none';syncBalance(d.balance)}}catch(e){say(e.message)}}
  async function minerCashout(){if(!minerRound)return;try{const d=await api('/api/miner/cashout',{method:'POST',body:JSON.stringify({roundId:minerRound.id})});minerRound=null;syncBalance(d.balance);app.querySelector('[data-action="miner-start"]').style.display='block';app.querySelector('[data-action="miner-cashout"]').style.display='none';app.querySelector('#cf-miner-status').textContent='Выплата: '+formatBalance(d.payout)+' ✦'}catch(e){say(e.message)}}
  async function refreshLuckyJetLive(){
    if(!app.querySelector('#cf-jet-scene'))return;
    try{
      const d=await api('/api/luckyjet/live');
      const hist=app.querySelector('#cf-jet-history');
      if(hist){
        hist.replaceChildren();
        const items=(d.history||[]).slice().reverse();
        for(const h of items){const el=document.createElement('span');const m=Number(h.multiplier||1);el.textContent=m.toFixed(2)+'×';el.style.cssText='border-radius:8px;padding:6px 10px;font-size:11px;font-weight:900;background:'+(m>=2?'#5a2c9b':'#372b5d')+';color:'+(m>=2?'#fff':'#c9b8ef');hist.appendChild(el)}
        if(!items.length){const el=document.createElement('span');el.textContent='Ожидание первого раунда';el.style.cssText='color:#b9a7d7;font-size:11px;padding:6px';hist.appendChild(el)}
      }
      const bets=app.querySelector('#cf-jet-bets');
      if(bets){
        bets.replaceChildren();
        for(const p of (d.bets||[])){
          const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;background:'+(p.isMe?'linear-gradient(100deg,#39205a,#241438)':'#21132f')+';border:1px solid '+(p.isMe?'#9d63dc':'#39264d')+';border-radius:10px;padding:9px;font-size:12px;color:#e8ddff';
          const name=document.createElement('span');name.textContent=p.name+(p.isMe?' (вы)':'');name.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
          const bet=document.createElement('span');bet.textContent=Number(p.bet).toLocaleString('ru-RU')+' ✦';bet.style.cssText='color:#cdb8f3';
          const result=document.createElement('b');result.textContent=p.status==='cashed_out'?(Number(p.payout)/Math.max(1,Number(p.bet))).toFixed(2)+'×':p.status==='crashed'?'💥':'В полёте';result.style.color=p.status==='cashed_out'?'#7effc4':'#f5c66f';
          row.append(name,bet,result);bets.appendChild(row);
        }
        if(!(d.bets||[]).length){const empty=document.createElement('div');empty.textContent='Ставок в текущем раунде пока нет';empty.style.cssText='padding:12px;text-align:center;color:#a995c6;background:#21132f;border-radius:10px;font-size:12px';bets.appendChild(empty)}
      }
      const count=app.querySelector('#cf-jet-bet-count');if(count)count.textContent=String((d.bets||[]).length);
      const m=app.querySelector('#cf-jet-multiplier'),rocket=app.querySelector('#cf-jet-rocket-wrap'),scene=app.querySelector('#cf-jet-scene');
      if(d.flight&&m&&!jetRound){
        m.textContent=Number(d.flight.multiplier).toFixed(2)+'×';
        const v=Number(d.flight.multiplier),x=Math.min(190,Math.max(0,(v-1)*25)),y=-Math.min(150,Math.max(0,(v-1)*18));
        if(rocket)rocket.style.transform='translate('+x+'px,'+y+'px) rotate('+((Math.atan2(y,x||1)*180/Math.PI)+45)+'deg)';
      }
    }catch(e){/* keep the game view usable during brief network failures */ }
  }
  let jetLiveRequestBusy=false;
  async function jetPollLive(){
    if(jetLiveRequestBusy||!app.querySelector('#cf-jet-scene'))return;
    jetLiveRequestBusy=true;
    try{const d=await api('/api/luckyjet/live');if(app.querySelector('#cf-jet-scene'))jetRenderLive(d);}
    catch(e){/* Ignore temporary network failures to keep animation smooth. */}
    finally{jetLiveRequestBusy=false;}
  }
  function startLuckyJetLiveUpdates(){
    if(jetLiveTimer)clearInterval(jetLiveTimer);
    jetPollLive();
    jetLiveTimer=setInterval(jetPollLive,1800);
  }
  function jetSetButtons(index,active){const start=app.querySelector('[data-action="jet-start"][data-bet-index="'+index+'"]'),cash=app.querySelector('[data-action="jet-cashout"][data-bet-index="'+index+'"]');if(start)start.style.display=active?'none':'block';if(cash)cash.style.display=active?'block':'none';}
  let jetFlightState=null,jetAnimationFrame=0,jetLastTextUpdate=0;
  function jetSmoothAnimation(now){
    const scene=app.querySelector('#cf-jet-scene');
    const wrap=app.querySelector('#cf-jet-rocket-wrap');
    if(scene&&wrap&&jetFlightState){
      const elapsed=Math.max(0,(Date.now()-jetFlightState.startedAt)/1000);
      const m=1+Math.pow(elapsed,1.35)*0.23;
      const rocketSize=Math.min(72,Math.max(54,scene.clientWidth*.17));
      const x=Math.min(Math.max(0,scene.clientWidth-rocketSize-8),Math.max(0,(m-1)*30));
      const y=-Math.min(Math.max(0,scene.clientHeight-rocketSize-12),Math.max(0,(m-1)*22));
      wrap.style.transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) rotate(0deg) scale(1)';
      const trail=app.querySelector('#cf-jet-trail'),glow=app.querySelector('.cf-trail-glow');
      const progress=Math.max(.4,Math.min(1,elapsed/22));
      const transform='translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) rotate(-25deg) scaleX('+progress.toFixed(3)+')';
      if(trail)trail.style.transform=transform;
      if(glow)glow.style.transform=transform;
      if(now-jetLastTextUpdate>100){
        const mult=app.querySelector('#cf-jet-multiplier');
        if(mult){mult.textContent=m.toFixed(2)+'×';mult.style.color='#d56aff';}
        jetLastTextUpdate=now;
      }
    }
    jetAnimationFrame=requestAnimationFrame(jetSmoothAnimation);
  }
  function ensureJetAnimation(){
    if(!jetAnimationFrame)jetAnimationFrame=requestAnimationFrame(jetSmoothAnimation);
  }
  function jetRenderLive(d){jetFlightState=d.flight?{startedAt:Number(d.flight.startedAt),crashAt:Number(d.flight.crashAt)}:null;ensureJetAnimation();const elapsed=d.flight?Date.now()-Number(d.flight.startedAt):0;app.querySelectorAll('[data-action="jet-start"]').forEach(b=>{const idx=Number(b.dataset.betIndex||0),already=jetRounds.some(r=>r.index===idx);if(!already){b.disabled=!!d.flight&&elapsed>750;b.style.opacity=b.disabled?'.48':'1';b.title=b.disabled?'Раунд уже летит — дождись следующего запуска':'';b.textContent=b.disabled?'ОЖИДАНИЕ':'СТАВКА';}});const history=app.querySelector('#cf-jet-history');if(history&&d.history){history.innerHTML=d.history.map(h=>'<span style="flex:0 0 auto;background:'+(h.multiplier>=2?'#4c2582':'#28183c')+';color:'+(h.multiplier>=2?'#e3c8ff':'#c1b0d8')+';border-radius:8px;padding:5px 8px;font-size:11px;font-weight:900">'+Number(h.multiplier).toFixed(2)+'×</span>').join('')||'<span style="color:#b9a7d7">Ожидание первого раунда</span>';}
    const list=app.querySelector('#cf-jet-bets'),count=app.querySelector('#cf-jet-bet-count');if(list&&d.bets){if(count)count.textContent=String(d.bets.length);list.innerHTML=d.bets.map(x=>'<div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:7px;background:'+(x.isMe?'linear-gradient(100deg,#39205a,#241438)':'#21132f')+';border:1px solid '+(x.isMe?'#8756b7':'#39264e')+';border-radius:10px;padding:9px;font-size:12px;color:#e8ddff"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b style="display:inline-grid;place-items:center;width:24px;height:24px;border-radius:8px;background:#604078;margin-right:6px">✦</b>'+String(x.name).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</span><span style="background:#5d35a1;border-radius:7px;padding:5px 7px">'+Number(x.bet).toLocaleString('ru-RU')+'</span><b style="color:'+(x.status==='cashed_out'?'#63ffc0':'#f5c66f')+'">'+(x.status==='cashed_out'?(Number(x.payout)/Math.max(1,Number(x.bet))).toFixed(2)+'×':'—')+'</b></div>').join('')||'<div style="background:#21132f;border-radius:10px;padding:16px;text-align:center;color:#a895c4">Ставок в текущем раунде пока нет</div>';}
    const mult=app.querySelector('#cf-jet-multiplier'),status=app.querySelector('#cf-jet-status'),wrap=app.querySelector('#cf-jet-rocket-wrap');if(d.flight){if(status)status.textContent='РАУНД ИДЁТ · выводи в любой момент';if(wrap)wrap.style.opacity='1';}
    else {if(mult&&jetRounds.length===0){mult.textContent='1.00×';mult.style.color='#d56aff';}if(status)status.textContent='Ожидание раунда — ставки открыты';if(wrap){wrap.style.opacity='1';wrap.style.transform='translate3d(0,0,0) rotate(0deg)';}}
  }
  function jetStartLivePolling(){if(jetLiveTimer)clearInterval(jetLiveTimer);jetPollLive();jetLiveTimer=setInterval(jetPollLive,1800);}
  async function jetStart(index=0){const startButton=app.querySelector('[data-action="jet-start"][data-bet-index="'+index+'"]');if(startButton?.disabled)return;const input=app.querySelector(index===1?'#cf-bet-2':'#cf-bet'),bet=Number(input?.value),auto=app.querySelector('#cf-jet-autocash-'+index)?.checked,autoAt=Number(app.querySelector('#cf-jet-auto-value-'+index)?.value);if(!Number.isSafeInteger(bet)||bet<1||bet>100000)return say('Ставка должна быть от 1 до 100 000.');if(auto&&(!Number.isFinite(autoAt)||autoAt<1.1||autoAt>100))return say('Авто-вывод: от 1.1× до 100×.');if(jetRounds.some(r=>r.index===index))return say('Эта ставка уже участвует в раунде.');if(startButton){startButton.disabled=true;startButton.textContent='Подключаем…'}try{const d=await api('/api/luckyjet/start',{method:'POST',body:JSON.stringify({bet,autoAt:auto?autoAt:null})});const round={id:d.round.id,startedAt:d.round.startedAt,autoAt:auto?autoAt:null,index,bet};jetRounds.push(round);jetRound=round;syncBalance(d.balance);jetSetButtons(index,true);app.querySelector('#cf-jet-status').textContent='🚀 Общий полёт уже идёт';jetStartLivePolling();if(jetTimer)clearInterval(jetTimer);jetTimer=setInterval(async()=>{for(const r of [...jetRounds]){try{const st=await api('/api/luckyjet/status',{method:'POST',body:JSON.stringify({roundId:r.id})});if(st.crashed){jetRounds=jetRounds.filter(x=>x.id!==r.id);jetSetButtons(r.index,false);syncBalance(st.balance);const ex=app.querySelector('#cf-jet-explosion');if(ex){ex.style.display='block';ex.style.animation='cfBlast .8s ease-out forwards';}const m=app.querySelector('#cf-jet-multiplier');if(m){m.textContent='💥 '+Number(st.crashAt).toFixed(2)+'×';m.style.color='#ff6b73';}const status=app.querySelector('#cf-jet-status');if(status)status.textContent='РАКЕТА ВЗОРВАЛАСЬ';}else if(r.autoAt&&Number(st.multiplier)>=r.autoAt){await jetCashout(r.index);}}catch(e){console.warn('LuckyJet bet poll failed',e)}}if(jetRounds.length===0&&jetTimer){clearInterval(jetTimer);jetTimer=null;}},1000);}catch(e){say(e.message)}finally{if(startButton){startButton.disabled=false;startButton.textContent='СТАВКА'}}}
  async function jetCashout(index=0){const r=jetRounds.find(x=>x.index===index);if(!r)return;try{const m=Number(app.querySelector('#cf-jet-multiplier').textContent.replace('×',''));const d=await api('/api/luckyjet/cashout',{method:'POST',body:JSON.stringify({roundId:r.id,multiplier:m})});jetRounds=jetRounds.filter(x=>x.id!==r.id);jetRound=jetRounds[0]||null;jetSetButtons(index,false);syncBalance(d.balance);app.querySelector('#cf-jet-result').textContent='✦ Ставка №'+(index+1)+': выплата '+formatBalance(d.payout)+' при '+d.multiplier.toFixed(2)+'×';app.querySelector('#cf-jet-status').textContent='ВЫВОД УСПЕШЕН · общий полёт продолжается';jetPollLive();}catch(e){say(e.message)}}
  app.addEventListener('click',async e=>{const adj=e.target.closest('[data-jet-adjust]');if(adj){const idx=Number(adj.dataset.jetAdjust),input=app.querySelector(idx===1?'#cf-bet-2':'#cf-bet');if(input){const v=Math.max(1,Math.min(100000,Number(input.value||1)+Number(adj.dataset.delta||0)));input.value=String(v)}return}const quick=e.target.closest('[data-jet-quick]');if(quick){const idx=Number(quick.dataset.jetQuick),input=app.querySelector(idx===1?'#cf-bet-2':'#cf-bet');if(input)input.value=quick.dataset.value;return}
    const mt=e.target.closest('[data-miner-tile]');if(mt){minerPick(Number(mt.dataset.minerTile));return}if(e.target.closest('[data-action="miner-start"]')){minerStart();return}if(e.target.closest('[data-action="miner-cashout"]')){minerCashout();return}const js=e.target.closest('[data-action="jet-start"]');if(js){const idx=Number(js.dataset.betIndex||0);const autoBet=app.querySelector('#cf-jet-autobet-'+idx)?.checked;if(autoBet){say('Автоставка включена: автоматический повтор ставок ещё не подключён.');return}jetStart(idx);return}const jc=e.target.closest('[data-action="jet-cashout"]');if(jc){jetCashout(Number(jc.dataset.betIndex||0));return}const close=e.target.closest('[data-action="close-bonus-wheel"]');if(close){app.querySelector('#cf-wheel-modal')?.remove();if(bonusTimerInterval){clearInterval(bonusTimerInterval);bonusTimerInterval=null;}return}
    const closeDaily=e.target.closest('[data-action="close-daily-reward"]');if(closeDaily){closeDailyReward();return}
    if(e.target.id==='cf-daily-modal'){closeDailyReward();return}
    if(e.target.closest('[data-action="open-daily-reward"]')){openDailyReward();return}
    if(e.target.id==='cf-wheel-modal'){e.target.remove();if(bonusTimerInterval){clearInterval(bonusTimerInterval);bonusTimerInterval=null;}return}
    const go=e.target.closest('[data-go]'); if(go){e.preventDefault();render(go.dataset.go);return}
    const mine=e.target.closest('[data-mine]'); if(mine){say('Эта игра ещё не подключена к серверу.');return}
    const choice=e.target.closest('[data-choice]');if(choice){selected=choice.dataset.choice;app.querySelectorAll('[data-choice],[data-number]').forEach(b=>{b.classList.toggle('is-selected',b===choice);b.style.borderColor=b===choice?'#ffdb73':''});return}const numberChoice=e.target.closest('[data-number]');if(numberChoice){selected=Number(numberChoice.dataset.number);app.querySelectorAll('[data-choice],[data-number]').forEach(b=>{b.classList.toggle('is-selected',b===numberChoice);b.style.borderColor=b===numberChoice?'#ffdb73':''});return}
    const action=e.target.closest('[data-action]');if(!action)return;
    if(action.dataset.action==='open-purchase-history'){
      const box=app.querySelector('#cf-payment-history');if(!box)return;
      const opening=box.style.display==='none'||!box.style.display;box.style.display=opening?'block':'none';action.setAttribute('aria-expanded',String(opening));
      const chev=action.querySelector('.cf-history-chevron');if(chev)chev.textContent=opening?'⌃':'⌄';
      if(opening)loadPaymentHistory();return
    }
    if(action.dataset.action==='open-game-history'){
      const box=app.querySelector('#cf-profile-history');if(!box)return;
      const opening=box.style.display==='none'||!box.style.display;box.style.display=opening?'block':'none';action.setAttribute('aria-expanded',String(opening));
      const chev=action.querySelector('.cf-history-chevron');if(chev)chev.textContent=opening?'⌃':'⌄';
      if(opening){try{const data=await api('/api/me');renderHistoryInProfile(data.history||[])}catch(e){box.textContent='Не удалось загрузить историю игр.'}}return
    }
    if(action.dataset.action==='games'){render('games');return}
    if(action.dataset.action==='bj-open-lobby'){await openBlackjackLobby();return}
    if(action.dataset.action==='bj-close-lobby'){app.querySelector('#cf-bj-lobby-modal')?.remove();return}
    if(action.dataset.action==='bj-lobby-refresh'){await refreshBlackjackLobby();return}
    if(action.dataset.action==='bj-join-lobby'){
      const inviteCode=action.dataset.code||'';
      try{const data=await api('/api/blackjack/rooms/join',{method:'POST',body:JSON.stringify({inviteCode})});blackjackRoomId=data.room.id;app.querySelector('#cf-bj-lobby-modal')?.remove();renderBlackjackRoom(data.room);const b=app.querySelector('#cf-balance');if(b)b.textContent=formatBalance(data.balance)}
      catch(error){say(error.message)}
      return
    }
    if(action.dataset.action==='bj-create'){
      const bet=Number(app.querySelector('#cf-bj-bet')?.value);
      if(!Number.isSafeInteger(bet)||bet<1||bet>100000){say('Ставка должна быть от 1 до 100 000.');return}
      action.disabled=true;
      try{const data=await api('/api/blackjack/rooms',{method:'POST',body:JSON.stringify({bet})});blackjackRoomId=data.room.id;const b=app.querySelector('#cf-balance');if(b)b.textContent=formatBalance(data.balance);renderBlackjackRoom(data.room);}
      catch(error){say(error.message)}finally{action.disabled=false}
      return
    }
    if(action.dataset.action==='bj-join'){
      const inviteCode=app.querySelector('#cf-bj-code')?.value||'';
      try{const data=await api('/api/blackjack/rooms/join',{method:'POST',body:JSON.stringify({inviteCode})});blackjackRoomId=data.room.id;const b=app.querySelector('#cf-balance');if(b)b.textContent=formatBalance(data.balance);renderBlackjackRoom(data.room);}
      catch(error){say(error.message)}
      return
    }
    if(action.dataset.action==='bj-share'){
      const code=app.querySelector('#cf-bj-room')?.querySelector('.bj-invite-panel strong')?.textContent?.trim();
      if(!code){say('Не удалось получить код приглашения.');return}
      const link='https://t.me/CosmicFortune_bot?startapp=bj_'+encodeURIComponent(code);
      const textMsg='Приглашаю тебя за стол блэкджека в Cosmic Fortune! Код стола: '+code;
      const share='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(textMsg);
      if(window.Telegram?.WebApp?.openTelegramLink)window.Telegram.WebApp.openTelegramLink(share);
      else window.open(share,'_blank','noopener');
      return
    }
    if(action.dataset.action==='bj-copy'){
      const code=app.querySelector('#cf-bj-room')?.querySelector('.section-title')?.textContent.split('·').pop()?.trim();
      if(code){try{await navigator.clipboard.writeText(code);say('Код приглашения скопирован')}catch{say('Код приглашения: '+code)}}
      return
    }
    if(action.dataset.action==='bj-refresh'){
      if(!blackjackRoomId)return;
      try{const data=await api('/api/blackjack/rooms/'+blackjackRoomId);renderBlackjackRoom(data.room)}catch(error){say(error.message)}
      return
    }
    if(action.dataset.action==='bj-ready'){
      if(!blackjackRoomId)return;
      action.disabled=true;
      try{const data=await api('/api/blackjack/rooms/'+blackjackRoomId+'/ready',{method:'POST',body:JSON.stringify({ready:action.dataset.ready!=='true'})});renderBlackjackRoom(data.room);await refreshAccount()}
      catch(error){say(error.message)}finally{action.disabled=false}
      return
    }
    if(action.dataset.action==='bj-start'||action.dataset.action==='bj-hit'||action.dataset.action==='bj-stand'||action.dataset.action==='bj-double'){
      if(!blackjackRoomId)return;
      const actionMap={'bj-hit':'hit','bj-stand':'stand','bj-double':'double'};
      const path=action.dataset.action==='bj-start'?'/start':'/action';
      const body=action.dataset.action==='bj-start'?{}:{action:actionMap[action.dataset.action]};
      action.disabled=true;
      try{const data=await api('/api/blackjack/rooms/'+blackjackRoomId+path,{method:'POST',body:JSON.stringify(body)});renderBlackjackRoom(data.room);await refreshAccount()}
      catch(error){say(error.message)}finally{action.disabled=false}
      return
    }
    if(action.dataset.action==='bj-leave'){
      const leavingRoomId=blackjackRoomId;
      if(leavingRoomId){try{await api('/api/blackjack/rooms/'+leavingRoomId+'/leave',{method:'POST',body:JSON.stringify({})})}catch(error){console.warn('Room leave failed',error.message)}}
      blackjackRoomId=null;if(blackjackPoll){clearInterval(blackjackPoll);blackjackPoll=null}render('blackjack');return
    }
    if(action.dataset.action==='open-bonus-wheel'){openBonusWheel();return}
    if(action.dataset.action==='bonus-wheel'){
      const button=action, wheel=app.querySelector('#cf-bonus-wheel'), result=app.querySelector('#cf-bonus-result');
      button.disabled=true;button.textContent='Колесо вращается…';
      try{
        const data=await api('/api/bonus-wheel',{method:'POST',body:JSON.stringify({requestId:crypto.randomUUID()})});
        if(wheel){
          const label=String(data.outcome?.label||'');
          const prizeIndex=label.includes('1 000 000 виртуальных кредитов')?0:label.includes('250 000 виртуальных кредитов')?1:label.includes('500 ₽')?2:label.includes('25 000')?3:label.includes('10 000')?4:label.includes('5 000')?5:label.includes('2 000')?6:7;
          const step=360/8, target=-(prizeIndex*step+step/2);
          wheel.style.transform='rotate(0deg)';void wheel.offsetWidth;
          wheel.style.transform='rotate('+(1800+target)+'deg)';
          await new Promise(resolve=>setTimeout(resolve,5300));
        }
        if(result)result.textContent='🎉 '+(data.outcome?.label||'Результат')+' · баланс '+formatBalance(data.balance)+' ✦';
        const balance=app.querySelector('#cf-balance');if(balance)balance.textContent=formatBalance(data.balance);
        const profileBalance=app.querySelector('#cf-profile-balance');if(profileBalance)profileBalance.textContent=formatBalance(data.balance);
        const slotBalance=app.querySelector('#cf-rhino-credit');if(slotBalance)slotBalance.textContent=formatBalance(data.balance);
        if(game==='slots'){const slotWin=app.querySelector('#cf-rhino-win');if(slotWin)slotWin.textContent=formatBalance(data.payout);}if(game==='slots'){const credit=app.querySelector('#cf-rhino-credit'),win=app.querySelector('#cf-rhino-win');if(credit)credit.textContent=formatBalance(data.balance??0);if(win)win.textContent=formatBalance(data.payout??0)}
        say(data.outcome?.label||'Бонус получен');
      }catch(error){if(result)result.textContent=error.message;say(error.message)}
      finally{button.disabled=false;button.textContent='🎡 Крутить бесплатно'}
      return
    }
    if(action.dataset.action==='slot-bet-minus'||action.dataset.action==='slot-bet-plus'||action.dataset.action==='slot-bet-max'){
      const input=app.querySelector('#cf-bet');if(!input)return;
      const current=Math.max(1,Math.min(100000,Math.floor(Number(input.value)||100)));
      const next=action.dataset.action==='slot-bet-max'?100000:action.dataset.action==='slot-bet-plus'?Math.min(100000,current+Math.max(10,Math.floor(current*.1))):Math.max(1,current-Math.max(10,Math.floor(current*.1)));
      input.value=String(next);input.dispatchEvent(new Event('change',{bubbles:true}));
      return
    }
    if(action.dataset.action==='slot-autoplay'){say('Автоигра будет добавлена после настройки и проверки автоматических раундов.');return}
    if(action.dataset.action==='slot-info'){say('Ставка: от 1 до 100 000 виртуальных кредитов. Результат и баланс рассчитываются сервером.');return}
    if(action.dataset.action==='play-game'){
      const game=action.dataset.game;
      const bet=Number(app.querySelector('#cf-bet')?.value);
      const result=app.querySelector('#cf-game-result');
      if(!Number.isSafeInteger(bet)||bet<1||bet>100000){say('Ставка должна быть от 1 до 100 000.');return}
      const body={game,bet,requestId:crypto.randomUUID()};
      const slotReels=game==='slots'?[0,1,2,3,4].map(i=>app.querySelector('#cf-slot-reel-'+i)):[];let slotSpinFailsafe=null;if(game==='slots'){clearCfSlotWinningCells();slotReels.forEach(el=>{if(el){el.classList.add('is-spinning');el.querySelectorAll('.cf-slot-symbol').forEach((symbol,j)=>{const keys=['rhino','golden-rhino','eagle','flamingo','crocodile','hyena','A','K','Q','J','sun'];symbol.innerHTML=rhinoSymbol(keys[Math.floor(Math.random()*keys.length)]);});}});slotSpinFailsafe=setTimeout(()=>{slotReels.forEach(el=>el?.classList.remove('is-spinning'));action.classList.remove('cf-spinning')},8000)}const diceOne=game==='dice'?app.querySelector('#cf-die-one'):null;const diceTwo=game==='dice'?app.querySelector('#cf-die-two'):null;const diceTotal=game==='dice'?app.querySelector('#cf-dice-total'):null;if(game==='dice'){[diceOne,diceTwo].forEach(d=>{if(d){d.classList.remove('face-1','face-2','face-3','face-4','face-5','face-6');d.classList.add('face-6','is-rolling');}});if(diceTotal)diceTotal.textContent='КОСТИ БРОШЕНЫ…';}const stage=app.querySelector('#cf-game-stage');
      if(stage){stage.classList.add('is-playing');}
      const art=app.querySelector('.bigart');
      if(art){art.classList.remove('anim-dice','anim-slots','anim-cards','anim-wheel');void art.offsetWidth;art.classList.add(game==='dice'?'anim-dice':game==='slots'?'anim-slots':game==='roulette'?'anim-wheel':'anim-cards');}
      if(game==='roulette'){
        if(!['red','black','green'].includes(selected)&&!(Number.isInteger(selected)&&selected>=0&&selected<=36)){say('Выбери цвет или номер от 0 до 36.');return}
        body.choice=selected;
      }
      action.disabled=true;action.setAttribute('aria-busy','true');if(game==='slots'){action.classList.add('cf-spinning');if(result){result.textContent='';result.classList.remove('cf-show-result')}}
      const rouletteWheel=game==='roulette'?app.querySelector('#cf-roulette-wheel'):null;
      const rouletteBall=game==='roulette'?app.querySelector('#cf-roulette-ball'):null;
      if(rouletteWheel){rouletteWheel.style.transition='none';rouletteWheel.style.transform='rotate(0deg)';}if(rouletteBall){rouletteBall.style.setProperty('--ball-angle','0deg');rouletteBall.classList.remove('is-falling');rouletteBall.classList.add('is-spinning');}
      if(game==='roulette'&&result)result.textContent='Шарик разгоняется по дорожке…';
      try{
        const data=await api('/api/game',{method:'POST',body:JSON.stringify(body)});
        const balance=app.querySelector('#cf-balance');if(balance)balance.textContent=formatBalance(data.balance);
        const profileBalance=app.querySelector('#cf-profile-balance');if(profileBalance)profileBalance.textContent=formatBalance(data.balance);
        const slotBalance=app.querySelector('#cf-rhino-credit');if(slotBalance)slotBalance.textContent=formatBalance(data.balance);
        if(game==='slots'){const slotWin=app.querySelector('#cf-rhino-win');if(slotWin)slotWin.textContent=formatBalance(data.payout);}
        if(game==='slots'){await new Promise(resolve=>setTimeout(resolve,350));}if(game==='dice'){await new Promise(resolve=>setTimeout(resolve,1250));}const out=data.outcome||{};if(game==='slots'&&Array.isArray(out.reels)&&out.reels.length===15){for(let i=0;i<5;i++){const el=slotReels[i];if(!el)continue;await new Promise(resolve=>setTimeout(resolve,450+i*220));el.classList.remove('is-spinning');const cells=el.querySelectorAll('.cf-slot-symbol');for(let j=0;j<3;j++){if(cells[j]){setCfSlotSymbol(cells[j],out.reels[i*3+j]);cells[j].style.animation='none';void cells[j].offsetWidth;cells[j].style.animation='';}}el.animate?.([{transform:'translateY(-10px)'},{transform:'translateY(3px)'},{transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});}}if(game==='dice'&&diceOne&&diceTwo&&Number.isInteger(Number(out.roll))){const total=Number(out.roll);const values=Array.isArray(out.dice)&&out.dice.length===2?out.dice:[1,Math.max(1,total-1)];[diceOne,diceTwo].forEach((d,i)=>{d.classList.remove('is-rolling','face-1','face-2','face-3','face-4','face-5','face-6');d.classList.add('face-'+Math.max(1,Math.min(6,Number(values[i])||1)));});if(diceTotal)diceTotal.textContent='СУММА: '+total;}
        if(game==='roulette'&&Number.isInteger(Number(out.number))){const winningNumber=Number(out.number);const ix=rouletteNumbers.indexOf(winningNumber);if(ix>=0&&rouletteWheel&&rouletteBall){const step=360/37;const pocketCenter=ix*step+step/2;const finalRotation=1440-pocketCenter;rouletteWheel.style.transition='transform 5.2s cubic-bezier(.08,.72,.12,1)';void rouletteWheel.offsetWidth;rouletteWheel.style.transform='rotate('+finalRotation+'deg)';const wheelWrap=app.querySelector('.cf-roulette-wheel-wrap');if(wheelWrap)rouletteBall.style.setProperty('--ball-radius',Math.round(wheelWrap.clientWidth*.345)+'px');rouletteBall.style.setProperty('--ball-angle','0deg');rouletteBall.classList.remove('is-spinning','is-slowing','is-falling');rouletteBall.style.animation='none';rouletteBall.style.transform='rotate(0deg) translateY(calc(0px - var(--ball-radius)))';void rouletteBall.offsetWidth;rouletteBall.style.animation='';rouletteBall.classList.add('is-slowing');if(result)result.textContent='Колесо замедляется, шарик катится по секторам…';await new Promise(resolve=>setTimeout(resolve,6300));rouletteBall.classList.remove('is-slowing');rouletteBall.classList.add('is-falling');if(result)result.textContent='Выпало '+winningNumber+' · '+(out.color==='green'?'ЗЕЛЁНОЕ':out.color==='red'?'КРАСНОЕ':'ЧЁРНОЕ');await new Promise(resolve=>setTimeout(resolve,550));}}
        if(game==='slots')highlightCfSlotWinningCells(out.wins,out.reels,data.payout,out.feature);
        let message=out.message||'Раунд завершён';
        if(out.reels)message+=' · '+out.reels.join(' ');
        if(out.roll)message+=' · выпало '+out.roll;
        if(out.number!==undefined)message+=' · номер '+out.number+' ('+out.color+')';
        if(out.playerTotal!==undefined)message+=' · ты '+out.playerTotal+' / дилер '+out.dealerTotal;
        if(result){if(game==='slots'){
          const details=[];
          if(out.feature==='free-spins')details.push('🎁 Бесплатные вращения: '+(out.freeSpinsLeft||0));
          if(out.feature==='super-respin')details.push('🦏 Super Respin · носорогов: '+(out.rhinoCount||0)+' · осталось: '+(out.respinsLeft||0));
          if(out.featureState?.mode==='free-spins')details.push('Бонус продолжается');
          if(out.featureState?.mode==='super-respin')details.push('Респин продолжается');
          if(out.wins?.length)details.push('Выигрышных линий: '+out.wins.length);
          result.textContent=(out.message||'Раунд завершён')+(details.length?' · '+details.join(' · '):'')+' · выплата: '+formatBalance(data.payout)+' ✦';
          result.classList.add('cf-show-result');
        }else result.textContent=message+' Ставка: '+formatBalance(data.bet)+' · выплата: '+formatBalance(data.payout)+' ✦';}
        await refreshAccount();
        const me=await api('/api/me');
        if(current==='profile')renderHistoryInProfile(me.history||[]);
      }catch(error){if(result)result.textContent=error.message;say(error.message)}
      finally{if(slotSpinFailsafe)clearTimeout(slotSpinFailsafe);app.querySelector('#cf-game-stage')?.classList.remove('is-playing');if(game==='dice'){[diceOne,diceTwo].forEach(d=>d?.classList.remove('is-rolling'));}if(game==='slots'){slotReels.forEach(el=>el?.classList.remove('is-spinning'));action.classList.remove('cf-spinning')}action.disabled=false;action.removeAttribute('aria-busy')}
      return
    }
    if(action.dataset.action==='roll'){say('Открой раздел «Кости» для игры.');return}
    if(['crash','collect','referral'].includes(action.dataset.action)){say('Эта функция пока не подключена к серверу.');return}
    if(action.dataset.action==='history'){
      try{
        const data=await api('/api/me');
        let target=app.querySelector('#cf-history-list');
        if(!target){content.insertAdjacentHTML('beforeend','<div class="section-title">История раундов</div><div id="cf-history-list"></div>');target=app.querySelector('#cf-history-list')}
        target.innerHTML=data.history.length?data.history.slice(0,10).map(r=>'<div class="widecard"><div style="flex:1"><strong>'+({slots:'🎰 Слоты',dice:'🎲 Кости',roulette:'🎡 Рулетка',blackjack:'🃏 Блэкджек'}[r.game]||r.game)+'</strong><small>Ставка '+formatBalance(r.bet)+' · выплата '+formatBalance(r.payout)+' ✦</small></div></div>').join(''):'<p style="color:#c5b6df">Раундов пока нет.</p>';
      }catch(error){say(error.message)}
      return
    }
    if(action.dataset.action==='buy-credits'){const stars=Number(action.dataset.stars);action.disabled=true;try{const d=await api('/api/stars/invoice',{method:'POST',body:JSON.stringify({stars})});if(!telegram?.openInvoice)throw new Error('Открой мини-приложение через Telegram.');telegram.openInvoice(d.url,status=>{if(status==='paid'){say('Платёж подтверждён. Обновляем баланс…');setTimeout(()=>{refreshAccount();loadPaymentHistory()},1000)}else if(status==='failed')say('Оплата не прошла; кредиты не начислены.')})}catch(e){say(e.message)}finally{action.disabled=false}return}
    if(action.dataset.action==='request-withdrawal'){action.disabled=true;try{const d=await api('/api/stars/withdrawals',{method:'POST',body:JSON.stringify({credits:Number(action.dataset.credits)})});const el=app.querySelector('#cf-withdrawal-result');if(el)el.textContent=d.message+' ID: '+d.request.id;const b=app.querySelector('#cf-balance');if(b)b.textContent=formatBalance(d.balance);say('Заявка создана.');await refreshAccount()}catch(e){say(e.message)}finally{action.disabled=false}return}
    if(action.dataset.action==='owner-webhook-setup'){action.disabled=true;try{let d;try{d=await api('/api/owner/payment-webhook/setup',{method:'POST',body:JSON.stringify({})})}catch(e){if(!e.message.includes('уже настроен'))throw e;if(!confirm(e.message+' Заменить webhook?'))throw e;d=await api('/api/owner/payment-webhook/setup',{method:'POST',body:JSON.stringify({confirmReplace:true})})}say(d.message);await loadOwnerTools()}catch(e){say(e.message)}finally{action.disabled=false}return}
    if(action.dataset.action==='owner-refresh'){await loadOwnerTools();return}
    if(action.dataset.action==='owner-review'){const id=action.dataset.id,review=action.dataset.review;if(!confirm(review==='paid'?'Подтверждаешь, что подарок уже отправлен?':'Отклонить заявку и вернуть кредиты?'))return;action.disabled=true;try{await api('/api/owner/withdrawals/'+encodeURIComponent(id)+'/review',{method:'POST',body:JSON.stringify({action:review,note:review==='paid'?'Подарок отправлен вручную':'Заявка отклонена'})});say('Заявка обновлена.');await loadOwnerTools();await refreshAccount()}catch(e){say(e.message)}finally{action.disabled=false}return}
    if(action.dataset.action==='daily'){action.disabled=true;const statusEl=app.querySelector('#cf-daily-status'),resultEl=app.querySelector('#cf-daily-result');try{const data=await api('/api/daily-reward/claim',{method:'POST',body:JSON.stringify({})});const balance=app.querySelector('#cf-balance');if(balance)balance.textContent=formatBalance(data.balance);const profileBalance=app.querySelector('#cf-profile-balance');if(profileBalance)profileBalance.textContent=formatBalance(data.balance);if(resultEl)resultEl.textContent='🎉 День '+data.streakDay+': начислено +'+formatBalance(data.reward)+' виртуальных кредитов!';await refreshDailyRewardStatus();await refreshAccount();say('Ежедневная награда получена: +'+formatBalance(data.reward)+' ✦')}catch(error){if(statusEl)statusEl.textContent=error.message;await refreshDailyRewardStatus()}finally{if(action.isConnected)action.disabled=false}return}
    if(action.dataset.action==='referral'){say('Реферальная система пока не реализована.');return}
    if(action.dataset.action==='settings'){say('Настройки пока не реализованы.');return}
  });
  async function loadPaymentHistory(){
    const t=app.querySelector('#cf-payment-history');if(!t)return;
    const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const dateTime=value=>{
      if(!value)return '';
      const date=new Date(value);
      if(Number.isNaN(date.getTime()))return '';
      return new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(date);
    };
    const statusNames={pending:'Ожидает оплаты',paid:'Оплачено',cancelled:'Отменено',refunded:'Возврат'};
    try{
      const d=await api('/api/stars/purchases');
      const purchases=Array.isArray(d.purchases)?d.purchases:[];
      t.innerHTML='<div style="font-size:13px;font-weight:800;color:#e8d7ff;margin-bottom:10px">История покупок</div>'+
      (purchases.length?purchases.map(p=>{
        const paid=p.status==='paid';
        const eventTime=paid?(p.paid_at||p.paidAt||p.created_at||p.createdAt):(p.created_at||p.createdAt);
        const timeLabel=paid?'Оплачено: ':'Создано: ';
        const dateLabel=dateTime(eventTime);
        const status=escapeHtml(statusNames[p.status]||p.status||'Статус неизвестен');
        const stars=escapeHtml(p.stars);
        const credits=escapeHtml(formatBalance(p.credits));
        return '<div class="cf-history-row" style="align-items:flex-start;padding:13px 0"><span class="cf-history-icon">⭐</span><div style="flex:1;min-width:0"><strong>Пополнение баланса</strong><small>'+stars+' Telegram Stars → '+credits+' виртуальных кредитов</small><small>'+timeLabel+escapeHtml(dateLabel||'Дата не указана')+'</small><small>'+status+'</small></div></div>';
      }).join(''):'<p class="cf-profile-muted">Покупок пока нет.</p>');
    }catch(e){t.textContent='История покупок недоступна.'}
  }
  async function loadOwnerTools(){const t=app.querySelector('#cf-owner-tools');if(!t)return;if(String(telegram?.initDataUnsafe?.user?.id||'')!=='8522347927'){t.innerHTML='';return}t.innerHTML='<section class="gamepanel"><div class="section-title">🛡 Админ-панель владельца</div><p class="cf-profile-muted">Настрой обработчик платежей и вручную обрабатывай заявки на подарки.</p><button class="primary" data-action="owner-webhook-setup">🔗 Подключить обработчик платежей Stars</button><button class="widecard" data-action="owner-refresh">↻ Обновить заявки</button><div id="cf-owner-summary"></div><div id="cf-owner-requests">Загрузка…</div><p><a href="https://fragment.com/" target="_blank" rel="noopener">Открыть Fragment для вывода доступного дохода →</a></p></section>';try{const [d,s]=await Promise.all([api('/api/owner/withdrawals'),api('/api/owner/stars-status')]);const summary=app.querySelector('#cf-owner-summary');if(summary)summary.innerHTML='<div class="cf-profile-data"><div><small>ОПЛАЧЕНО STARS</small><strong>'+formatBalance(s.sales.stars)+' ⭐</strong></div><div><small>ПРОДАНО КРЕДИТОВ</small><strong>'+formatBalance(s.sales.credits)+'</strong></div><div><small>ЗАЯВОК ОЖИДАЮТ</small><strong>'+s.pendingWithdrawals+'</strong></div></div>';const box=app.querySelector('#cf-owner-requests');if(!box)return;box.innerHTML=d.requests.length?d.requests.map(r=>'<div class="cf-history-row" style="display:block"><strong>'+String(r.first_name||'Игрок').replace(/[<>]/g,'')+' '+(r.username?'@'+String(r.username).replace(/[<>]/g,''):'')+'</strong><small>Telegram ID: '+r.telegram_id+'</small><small>'+formatBalance(r.credits)+' кредитов · эквивалент '+r.stars+' ⭐ · '+({pending:'Ожидает',paid:'Подарок отправлен',rejected:'Отклонена'}[r.status]||r.status)+'</small><small>Заявка: '+r.id+'</small>'+(r.status==='pending'?'<div style="display:flex;gap:8px;margin-top:8px"><button class="primary" data-action="owner-review" data-review="paid" data-id="'+r.id+'">Подарок отправлен</button><button class="widecard" data-action="owner-review" data-review="rejected" data-id="'+r.id+'">Отклонить / вернуть</button></div>':'')+'</div>').join(''):'<p class="cf-profile-muted">Заявок пока нет.</p>'}catch(e){const box=app.querySelector('#cf-owner-requests');if(box)box.textContent=e.message}}
  function renderHistoryInProfile(rows){
    const box=app.querySelector('#cf-profile-history');if(!box)return;
    const names={slots:'🎰 Слоты',dice:'🎲 Кости',roulette:'🎡 Рулетка',blackjack:'🃏 Блэкджек',bonus_wheel:'🎡 Бонусная рулетка'};
    const dateFmt=new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    box.innerHTML=rows.length?rows.map(r=>{const payout=Number(r.payout)||0,bet=Number(r.bet)||0;let outcome='Раунд завершён';if(r.outcome&&typeof r.outcome.message==='string')outcome=r.outcome.message;else if(r.outcome&&typeof r.outcome.label==='string')outcome=r.outcome.label;return '<div class="cf-history-row"><span class="cf-history-icon">'+(names[r.game]||'🎮') .split(' ')[0]+'</span><div class="cf-history-main"><strong>'+(names[r.game]||r.game)+'</strong><small>Ставка: '+formatBalance(bet)+' · '+dateFmt.format(new Date(r.createdAt))+'</small><small>'+outcome.replace(/[<>]/g,'')+'</small></div><span class="cf-history-payout">+'+formatBalance(payout)+' ✦</span></div>'}).join(''):'<p class="cf-profile-muted">Игровых раундов пока нет.</p>';
  }
  // Entry is open; keep Telegram initData authentication and server-backed game logic.
  render('home');
  refreshAccount();
  loadCfSlotImages();
})();