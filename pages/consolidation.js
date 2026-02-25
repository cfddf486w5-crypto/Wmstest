import { getAll, put, remove, logEvent } from '../js/store.js';
import { modal, toast } from '../js/ui.js';

function parseSub(path) { return path.split('/')[2] || ''; }

export async function renderConsolidation(root, path) {
  const sub = parseSub(path);
  const sessions = await getAll('consolidation_sessions');
  const moves = await getAll('consolidation_moves');
  const target = root.querySelector('#consolidation-content');
  if (!sub) {
    target.innerHTML = `<div class="grid-2"><a class="tile card-glass" href="#/consolidation/charger">Charger</a><a class="tile card-glass" href="#/consolidation/optimiser">Optimiser</a><a class="tile card-glass" href="#/consolidation/historique">Historique</a><a class="tile card-glass" href="#/consolidation/statistiques">Statistiques</a></div><div class="row wrap"><span class="status-pill">Sessions en attente: ${sessions.filter(s=>!s.closed).length}</span><span class="status-pill">Pièces: ${sessions.reduce((a,s)=>a+(s.items?.reduce((x,y)=>x+y.qty,0)||0),0)}</span></div>`;
    return;
  }
  if (sub === 'charger') {
    const current = sessions.find((s) => !s.closed) || await put('consolidation_sessions', { id: `CONS-${Date.now()}`, items: [], closed: false, zone: 'A' });
    target.innerHTML = `<label>Scan SKU</label><input id="scan" placeholder="Scanner puis Entrée" autofocus /><div id="list" class="list"></div><button id="done" class="btn">Terminer session</button>`;
    const input = target.querySelector('#scan');
    const list = target.querySelector('#list');
    const draw = async () => {
      const fresh = (await getAll('consolidation_sessions')).find((s) => s.id === current.id);
      list.innerHTML = (fresh.items || []).map((it) => `<div class="list-item row"><span>${it.sku}</span><strong>x${it.qty}</strong><button data-sku="${it.sku}" class="btn secondary">Supprimer</button></div>`).join('') || '<p>Aucun scan</p>';
      list.querySelectorAll('button').forEach((b)=>b.onclick=async()=>{fresh.items=fresh.items.filter(i=>i.sku!==b.dataset.sku); await put('consolidation_sessions',fresh); draw();});
    };
    await draw();
    input.onkeydown = async (e) => {
      if (e.key !== 'Enter') return;
      const sku = input.value.trim(); if (!sku) return;
      const fresh = (await getAll('consolidation_sessions')).find((s)=>s.id===current.id);
      const f = fresh.items.find((i)=>i.sku===sku); if (f) f.qty += 1; else fresh.items.push({ sku, qty: 1 });
      await put('consolidation_sessions', fresh); await logEvent('consolidation', 'scan', { sku }); input.value=''; draw();
    };
    target.querySelector('#done').onclick = async ()=>{ current.closed=true; await put('consolidation_sessions', current); toast('Session archivée'); window.location.hash='#/consolidation/historique'; };
    setTimeout(()=>input.focus(), 60);
  } else if (sub === 'optimiser') {
    const grouped = {};
    sessions.filter((s)=>s.closed).forEach((s)=> (s.items||[]).forEach((it)=> grouped[it.sku]=(grouped[it.sku]||0)+it.qty));
    const rows = Object.entries(grouped).map(([sku, qty], i)=>({ id:`MOV-${Date.now()}-${i}`, sku, qty, reason:'Regroupement SKU et réduction déplacements' }));
    target.innerHTML = `<div class="list">${rows.map((m)=>`<div class="list-item"><strong>${m.sku}</strong> x${m.qty}<div class="inline-actions"><button class="btn secondary" data-why="${m.reason}">Pourquoi ?</button></div></div>`).join('')}</div><button id="apply" class="btn">Appliquer</button>`;
    target.querySelectorAll('[data-why]').forEach((b)=>b.onclick=()=>modal({title:'Pourquoi ce move ?', body:b.dataset.why, actions:[{label:'OK'}]}));
    target.querySelector('#apply').onclick = async ()=>{ for (const r of rows) await put('consolidation_moves', r); await logEvent('consolidation','moves_applied',{count:rows.length}); toast('Moves appliqués'); };
  } else if (sub === 'historique') {
    target.innerHTML = `<h3>Sessions</h3><div class="list">${sessions.map((s)=>`<div class="list-item">${s.id} - ${(s.items||[]).length} SKU - ${s.closed?'Fermée':'Ouverte'}</div>`).join('') || '<p>Vide</p>'}</div><h3>Moves</h3><div class="list">${moves.map((m)=>`<div class="list-item">${m.sku} x${m.qty}</div>`).join('') || '<p>Vide</p>'}</div>`;
  } else if (sub === 'statistiques') {
    target.innerHTML = `<p>KPIs consolidation</p><div class="grid-3"><div class="list-item"><div class="kpi">${sessions.length}</div>Sessions</div><div class="list-item"><div class="kpi">${moves.length}</div>Moves</div><div class="list-item"><div class="kpi">${sessions.reduce((a,s)=>a+((s.items||[]).reduce((x,y)=>x+y.qty,0)),0)}</div>Pièces</div></div><div class="canvas-wrap"><canvas id="cons-chart" width="320" height="160"></canvas></div>`;
    const c = target.querySelector('#cons-chart'); const ctx = c.getContext('2d');
    const vals = [sessions.length, moves.length, Math.max(1, sessions.reduce((a,s)=>a+((s.items||[]).length),0))];
    ctx.fillStyle = '#0f2a56'; ctx.fillRect(0,0,c.width,c.height); vals.forEach((v,i)=>{ctx.fillStyle='#65b0ff';ctx.fillRect(20+i*90,140-v*10,50,v*10);});
  }
}
