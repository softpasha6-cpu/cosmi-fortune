# Cosmic Fortune

Telegram Mini App frontend + Node.js API + PostgreSQL. Game credits are virtual only; there are no deposits, cash-outs, or real-money payouts.

## Repository layout

- `index.html`, `app.js`: GitHub Pages frontend
- `server/server.js`: API, Telegram `initData` HMAC verification, game engine
- `server/schema.sql`: persistent players and round history
- `render.yaml`: Render web service and PostgreSQL blueprint

## Deploy the backend

1. Deploy this repository on Render using the Blueprint option and `render.yaml`.
2. Set `BOT_TOKEN` as a private environment variable in Render to the token for `@CosmicFortune_bot`. Do not put it in GitHub or the frontend.
3. Let Render create the PostgreSQL database. The API initializes its tables on startup.
4. Copy the HTTPS URL of the deployed web service, e.g. `https://your-service.onrender.com`.
5. Open the Mini App in Telegram, tap **⚙ Сервер**, and paste that URL. It is saved in this browser's local storage.
6. Check `https://your-service.onrender.com/health`; it should return `{"ok":true,"database":"connected"}`.

## Security notes

- The API verifies Telegram Web App `initData` using the bot token on the server and rejects signatures older than 24 hours.
- The client never sends a trusted user ID; identity comes from the signed Telegram payload.
- Game results are generated server-side. Balance changes use a PostgreSQL row lock and a transaction.
- This is a virtual-credit demo, not a real-money gambling or payout system.
- Before production, add rate limiting, abuse monitoring, automated tests, database backups, and review Telegram/platform/legal requirements.
