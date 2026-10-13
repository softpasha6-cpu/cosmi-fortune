const DEFAULT_API_BASE = '';
function apiBase() {
  return (localStorage.getItem('cosmicApiBase') || DEFAULT_API_BASE).replace(/\/$/, '');
}
function configureApi() {
  const value = prompt('Вставь HTTPS URL опубликованного Cosmic Fortune API', apiBase());
  if (value === null) return;
  const clean = value.trim().replace(/\/$/, '');
  if (clean && !/^https:\/\//i.test(clean)) return notify('Нужен HTTPS-адрес сервера.');
  if (clean) localStorage.setItem('cosmicApiBase', clean);
  else localStorage.removeItem('cosmicApiBase');
  connectApi();
}
function notify(message) {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg && typeof tg.showAlert === 'function') tg.showAlert(message);
  else alert(message);
}
function initData() {
  return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp.initData : '';
}
async function api(path, options = {}) {
  const base = apiBase();
  if (!base) throw new Error('Сервер ещё не настроен. Нажми «⚙ Сервер» и укажи URL API после публикации.');
  const signedData = initData();
  if (!signedData) throw new Error('Открой приложение через Telegram, чтобы пройти авторизацию.');
  const response = await fetch(base + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': signedData, ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({ error: 'Некорректный ответ сервера' }));
  if (!response.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}
function setBalance(value) {
  document.getElementById('balance').textContent = Number(value).toLocaleString('ru-RU') + ' ✦';
}
function setStatus(text, good = false) {
  const el = document.getElementById('api-status');
  el.textContent = text;
  el.style.color = good ? '#a6f0b3' : '#c9b9e8';
}
function renderHistory(rows) {
  const box = document.getElementById('history');
  box.replaceChildren();
  if (!rows.length) {
    const row = document.createElement('div'); row.className = 'rate';
    row.textContent = 'Пока нет сыгранных раундов'; box.appendChild(row); return;
  }
  for (const item of rows.slice(0, 10)) {
    const row = document.createElement('div'); row.className = 'rate';
    const left = document.createElement('span');
    left.textContent = ({slots:'🎰 Слоты',roulette:'🎡 Рулетка',blackjack:'🃏 Блэкджек',dice:'🎲 Кости'}[item.game] || item.game) + ' · ставка ' + Number(item.bet).toLocaleString('ru-RU');
    const right = document.createElement('span');
    right.textContent = 'выплата ' + Number(item.payout).toLocaleString('ru-RU') + ' ✦';
    right.style.color = '#ffd36a';
    row.append(left, right); box.appendChild(row);
  }
}
async function connectApi() {
  setStatus('Подключаемся…');
  try {
    const data = await api('/api/me');
    setBalance(data.player.balance);
    setStatus('Сервер подключён · баланс сохранён', true);
    renderHistory(data.history || []);
    document.getElementById('game-result').textContent = 'Готово! Выбери игру и сделай ставку виртуальными кредитами.';
  } catch (e) {
    setStatus('Нет соединения с сервером');
    document.getElementById('balance').textContent = '—';
    document.getElementById('game-result').textContent = e.message;
  }
}
async function play(game) {
  const bet = Number(document.getElementById('bet').value);
  if (!Number.isSafeInteger(bet) || bet < 1 || bet > 100000) return notify('Введи ставку от 1 до 100 000 виртуальных кредитов.');
  let choice;
  if (game === 'roulette') {
    choice = prompt('Выбери цвет рулетки: red (красный) или black (чёрный)', 'red');
    if (choice === null) return;
    choice = choice.trim().toLowerCase();
    if (choice === 'красный') choice = 'red';
    if (choice === 'чёрный' || choice === 'черный') choice = 'black';
    if (!['red', 'black'].includes(choice)) return notify('Выбери red или black.');
  }
  const result = document.getElementById('game-result');
  result.textContent = 'Раунд выполняется на сервере…';
  try {
    const data = await api('/api/game', { method: 'POST', body: JSON.stringify({ game, bet, choice }) });
    setBalance(data.balance);
    setStatus('Сервер подключён · баланс сохранён', true);
    const out = data.outcome || {};
    let details = out.message || 'Раунд завершён';
    if (out.reels) details += ' · ' + out.reels.join(' ');
    if (out.roll) details += ' · выпало ' + out.roll;
    if (out.number !== undefined) details += ' · номер ' + out.number + ' (' + out.color + ')';
    if (out.playerTotal !== undefined) details += ' · ты ' + out.playerTotal + ' / дилер ' + out.dealerTotal;
    result.textContent = details + ' Ставка: ' + bet.toLocaleString('ru-RU') + ' · выплата: ' + Number(data.payout).toLocaleString('ru-RU') + ' · баланс: ' + Number(data.balance).toLocaleString('ru-RU');
    const me = await api('/api/me');
    renderHistory(me.history || []);
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
  } catch (e) {
    result.textContent = e.message;
    setStatus('Проверь подключение');
  }
}
function exchangeDemo() {
  notify('Обмен на Telegram Stars не подключён. Здесь только виртуальные кредиты без денежных выплат.');
}
(function initTelegram() {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
    const profile = document.getElementById('profile');
    if (user && profile) {
      profile.textContent = 'Привет, ' + ([user.first_name, user.last_name].filter(Boolean).join(' ') || 'космический путешественник') + '!';
    }
  } catch (e) { console.warn('Telegram WebApp init failed', e); }
})();
document.addEventListener('DOMContentLoaded', connectApi);
