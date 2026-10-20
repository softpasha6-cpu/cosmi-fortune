(() => {
  const css = document.createElement('style');
  css.id = 'cf-bottom-nav-fix';
  css.textContent = `
    #cf-app { padding-bottom: calc(88px + env(safe-area-inset-bottom)) !important; }
    #cf-app .bottom, #cf-app.cf-games-active .bottom {
      position: fixed !important; z-index: 2147483001 !important;
      left: 0 !important; right: 0 !important; bottom: 0 !important;
      width: 100% !important; max-width: none !important;
      height: auto !important; min-height: 68px !important;
      display: grid !important; grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 0 !important; margin: 0 !important;
      padding: 7px 8px calc(7px + env(safe-area-inset-bottom)) !important;
      border-radius: 15px 15px 0 0 !important; box-sizing: border-box !important;
      background: linear-gradient(180deg, #160b28fa, #080512ff) !important;
    }
    #cf-app .bottom button {
      display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      gap: 4px !important; width: 100% !important; min-width: 0 !important;
      min-height: 49px !important; padding: 4px 0 !important; margin: 0 !important;
      border: 0 !important; border-radius: 10px !important;
      background: transparent !important; color: #bca9d8 !important;
      font-size: 11px !important; line-height: 1.15 !important;
      white-space: nowrap !important; box-sizing: border-box !important;
    }
    #cf-app .bottom button.active { color: #ffe18a !important; background: #ffffff0d !important; }
    #cf-app .bottom .navicon { display: block !important; font-size: 21px !important; line-height: 1 !important; }
    #cf-app .cf-home-page { height: auto !important; min-height: 0 !important; overflow: visible !important; }
    #cf-app .cf-home-redesign { padding-bottom: 16px !important; }
    #cf-app.cf-games-active { overflow-y: auto !important; height: auto !important; min-height: 100dvh !important; padding-bottom: calc(88px + env(safe-area-inset-bottom)) !important; }
    #cf-app.cf-games-active .shell { height: auto !important; min-height: 100dvh !important; overflow: visible !important; }
    #cf-app.cf-games-active #cf-content { height: auto !important; min-height: 0 !important; overflow: visible !important; padding: 0 14px 20px !important; }
    @media(max-width:380px) { #cf-app .bottom { padding-left: 4px !important; padding-right: 4px !important; } #cf-app .bottom button { font-size: 10px !important; } }
  `;
  document.head.appendChild(css);
  function apply() {
    const app = document.getElementById('cf-app');
    const nav = app && app.querySelector('.bottom');
    if (nav) nav.style.setProperty('display', 'grid', 'important');
  }
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();