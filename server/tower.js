import crypto from 'node:crypto';

export function registerTowerRoutes({ app, pool, requireUser }) {
  let ready;
  const ensureTable = () => ready ||= pool.query(`
    CREATE TABLE IF NOT EXISTS tower_rounds (
      id UUID PRIMARY KEY,
      telegram_id BIGINT NOT NULL REFERENCES players(telegram_id) ON DELETE CASCADE,
      request_id UUID NOT NULL,
      bet BIGINT NOT NULL CHECK (bet > 0),
      floors INTEGER NOT NULL CHECK (floors = 15),
      traps INTEGER NOT NULL CHECK (traps IN (1,2)),
      safe_lanes JSONB NOT NULL,
      picked JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','won','lost')),
      payout BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ,
      UNIQUE(telegram_id, request_id)
    );
    ALTER TABLE tower_rounds DROP CONSTRAINT IF EXISTS tower_rounds_floors_check;\n    ALTER TABLE tower_rounds ADD CONSTRAINT tower_rounds_floors_check CHECK (floors = 15);\n    CREATE INDEX IF NOT EXISTS tower_rounds_player_active_idx ON tower_rounds(telegram_id,status);
  `);

  app.post('/api/tower/start', requireUser, async (req,res,next) => {
    const bet=Number(req.body?.bet), floors=Number(req.body?.floors), traps=Number(req.body?.traps), requestId=req.body?.requestId;
    if(!Number.isSafeInteger(bet)||bet<1||bet>100000) return res.status(400).json({error:'Ставка должна быть от 1 до 100 000.'});
    if(floors!==15||![1,2].includes(traps)) return res.status(400).json({error:'В игре всегда 15 этажей. Выбери 1 или 2 ловушки.'});
    if(typeof requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(requestId)) return res.status(400).json({error:'Некорректный идентификатор раунда.'});
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      await ensureTable();
      const existing=await client.query('SELECT * FROM tower_rounds WHERE telegram_id=$1 AND request_id=$2',[req.player.telegram_id,requestId]);
      if(existing.rowCount){const r=existing.rows[0];await client.query('COMMIT');return res.json({roundId:r.id,floors:r.floors,traps:r.traps,nextFloor:(r.picked||[]).length,picked:r.picked||[],status:r.status,balance:Number((await pool.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id])).rows[0].balance),replayed:true});}
      const active=await client.query("SELECT * FROM tower_rounds WHERE telegram_id=$1 AND status='active' ORDER BY created_at DESC LIMIT 1 FOR UPDATE",[req.player.telegram_id]);
      if(active.rowCount){const r=active.rows[0];const bal=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);await client.query('COMMIT');return res.json({roundId:r.id,floors:r.floors,traps:r.traps,nextFloor:(r.picked||[]).length,picked:r.picked||[],status:'active',balance:Number(bal.rows[0].balance),resumed:true});}
      const player=await client.query('SELECT balance FROM players WHERE telegram_id=$1 FOR UPDATE',[req.player.telegram_id]);
      const balance=Number(player.rows[0]?.balance||0);
      if(balance<bet){await client.query('ROLLBACK');return res.status(400).json({error:'Недостаточно виртуальных кредитов.'});}
      const safeCount=3-traps;
      const safeLanes=Array.from({length:floors},()=>{const a=[];while(a.length<safeCount){const n=crypto.randomInt(0,3);if(!a.includes(n))a.push(n);}return a;});
      const id=crypto.randomUUID();
      const after=balance-bet;
      await client.query('UPDATE players SET balance=$2,updated_at=NOW() WHERE telegram_id=$1',[req.player.telegram_id,after]);
      await client.query('INSERT INTO tower_rounds(id,telegram_id,request_id,bet,floors,traps,safe_lanes) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',[id,req.player.telegram_id,requestId,bet,floors,traps,JSON.stringify(safeLanes)]);
      await client.query('COMMIT');
      res.json({roundId:id,floors,traps,nextFloor:0,status:'active',balance:after});
    } catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);} finally{client.release();}
  });

  app.post('/api/tower/cashout', requireUser, async (req,res,next) => {
    const roundId=String(req.body?.roundId||'');
    if(!/^[a-f0-9-]{36}$/i.test(roundId)) return res.status(400).json({error:'Некорректный раунд.'});
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      await ensureTable();
      const q=await client.query('SELECT * FROM tower_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE',[roundId,req.player.telegram_id]);
      if(!q.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Раунд не найден.'});}
      const r=q.rows[0],picked=Array.isArray(r.picked)?r.picked:[],safeCount=3-Number(r.traps);
      if(r.status!=='active'){await client.query('ROLLBACK');return res.status(409).json({error:'Раунд уже завершён или приз забран.'});}
      if(!picked.length){await client.query('ROLLBACK');return res.status(400).json({error:'Сначала открой хотя бы одну безопасную дверь.'});}
      const multiplier=Number((0.97/Math.pow(safeCount/3,picked.length)).toFixed(2));
      const payout=Math.floor(Number(r.bet)*multiplier);
      const updated=await client.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1 RETURNING balance',[req.player.telegram_id,payout]);
      const balance=Number(updated.rows[0].balance);
      await client.query("UPDATE tower_rounds SET status='won',payout=$2,finished_at=NOW() WHERE id=$1",[roundId,payout]);
      await client.query("INSERT INTO game_transactions(telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES($1,'tower',$2,$3,$4,$5::jsonb,$6)",[req.player.telegram_id,r.bet,payout,balance,JSON.stringify({floors:r.floors,traps:r.traps,picked,reached:picked.length,won:true,cashout:true,multiplier,message:'Приз забран досрочно.'}),r.request_id]);
      await client.query('COMMIT');
      res.json({status:'won',payout,multiplier,balance,reached:picked.length,message:'Приз успешно забран.'});
    } catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);} finally{client.release();}
  });

  app.post('/api/tower/pick', requireUser, async (req,res,next) => {
    const roundId=String(req.body?.roundId||''),floor=Number(req.body?.floor),lane=Number(req.body?.lane);
    if(!/^[a-f0-9-]{36}$/i.test(roundId)||!Number.isInteger(floor)||!Number.isInteger(lane)||lane<0||lane>2) return res.status(400).json({error:'Некорректный выбор двери.'});
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      await ensureTable();
      const q=await client.query('SELECT * FROM tower_rounds WHERE id=$1 AND telegram_id=$2 FOR UPDATE',[roundId,req.player.telegram_id]);
      if(!q.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Раунд не найден.'});}
      const r=q.rows[0],picked=Array.isArray(r.picked)?r.picked:[],safe=Array.isArray(r.safe_lanes)?r.safe_lanes:JSON.parse(r.safe_lanes||'[]');
      if(r.status!=='active'){await client.query('ROLLBACK');return res.status(409).json({error:'Этот раунд уже завершён.'});}
      if(floor!==picked.length||floor>=Number(r.floors)){await client.query('ROLLBACK');return res.status(409).json({error:'Выбирай двери по порядку, начиная снизу.'});}
      const wonFloor=(safe[floor]||[]).includes(lane);
      picked.push(lane);
      if(!wonFloor){
        await client.query("UPDATE tower_rounds SET picked=$2::jsonb,status='lost',finished_at=NOW() WHERE id=$1",[roundId,JSON.stringify(picked)]);
        const bal=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);
        const balance=Number(bal.rows[0].balance);
        await client.query("INSERT INTO game_transactions(telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES($1,'tower',$2,0,$3,$4::jsonb,$5)",[req.player.telegram_id,r.bet,balance,JSON.stringify({floors:r.floors,traps:r.traps,picked,reached:floor,won:false,message:'Ловушка! Подъём завершён.'}),r.request_id]);
        await client.query('COMMIT');
        return res.json({safe:false,status:'lost',floor,reached:floor,balance,payout:0,message:'💥 ЛОВУШКА! Ты проиграл.'});
      }
      const finished=picked.length===Number(r.floors);
      let payout=0,balance;
      if(finished){
        const safeCount=3-Number(r.traps),probability=Math.pow(safeCount/3,Number(r.floors)),multiplier=Number((0.97/probability).toFixed(2));
        payout=Math.floor(Number(r.bet)*multiplier);
        const updated=await client.query('UPDATE players SET balance=balance+$2,updated_at=NOW() WHERE telegram_id=$1 RETURNING balance',[req.player.telegram_id,payout]);
        balance=Number(updated.rows[0].balance);
        await client.query("UPDATE tower_rounds SET picked=$2::jsonb,status='won',payout=$3,finished_at=NOW() WHERE id=$1",[roundId,JSON.stringify(picked),payout]);
        await client.query("INSERT INTO game_transactions(telegram_id,game,bet,payout,balance_after,outcome,idempotency_key) VALUES($1,'tower',$2,$3,$4,$5::jsonb,$6)",[req.player.telegram_id,r.bet,payout,balance,JSON.stringify({floors:r.floors,traps:r.traps,picked,reached:r.floors,won:true,multiplier,message:'Вершина покорена!'}),r.request_id]);
      } else {
        await client.query('UPDATE tower_rounds SET picked=$2::jsonb WHERE id=$1',[roundId,JSON.stringify(picked)]);
        const bal=await client.query('SELECT balance FROM players WHERE telegram_id=$1',[req.player.telegram_id]);balance=Number(bal.rows[0].balance);
      }
      await client.query('COMMIT');
      const safeCount=3-Number(r.traps),cashout=finished?payout:Math.floor(Number(r.bet)*(0.97/Math.pow(safeCount/3,picked.length)));\n      res.json({safe:true,status:finished?'won':'active',floor,reached:picked.length,balance,payout,cashout,message:finished?'👑 ВЕРШИНА ПОКОРЕНА!':'✨ Дверь безопасна! Поднимайся выше.'});
    } catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);} finally{client.release();}
  });
}
