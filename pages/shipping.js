import { getAll, put, logEvent } from '../js/store.js';
import { toast } from '../js/ui.js';
import { exportCSV, exportExcelLike, printPDF } from '../js/export.js';

const sid = (n)=>`EXP${String(n).padStart(6,'0')}`;
const pid = (n)=>`PAL${String(n).padStart(6,'0')}`;

export async function renderShipping(root, path) {
  const sub = path.split('/')[2] || '';
  const target = root.querySelector('#shipping-content');
  const shipments = await getAll('shipping_shipments');
  const pallets = await getAll('shipping_pallets');
  if (!sub) {
    target.innerHTML = `<div class="grid-2"><a class="tile card-glass" href="#/shipping/create">Créer expédition</a><a class="tile card-glass" href="#/shipping/scan">Palette & scan</a><a class="tile card-glass" href="#/shipping/history">Historique</a><a class="tile card-glass" href="#/shipping/exports">Exports</a><a class="tile card-glass" href="#/shipping/settings">Settings</a></div><div class="row wrap"><span class="status-pill">Expéditions: ${shipments.length}</span><span class="status-pill">Palettes: ${pallets.length}</span></div>`;
    return;
  }
  if (sub === 'create') {
    target.innerHTML = `<label>Transporteur</label><input id="carrier" placeholder="DHL / UPS / GLS"/><button id="create" class="btn">Créer</button><div class="list">${shipments.map(s=>`<div class='list-item'>${s.id} - ${s.carrier} - ${s.status}</div>`).join('')}</div>`;
    target.querySelector('#create').onclick = async()=>{ const carrier=target.querySelector('#carrier').value.trim()||'Transporteur'; const ship=await put('shipping_shipments',{id:sid(shipments.length+1),carrier,status:'Nouveau',zones:['Zone A']}); await logEvent('shipping','create_shipment',ship); toast('Expédition créée'); window.location.hash='#/shipping'; };
  } else if (sub === 'scan') {
    const active = shipments.find((s)=>s.status!=='Fermé') || shipments[0];
    if (!active) { target.innerHTML = '<p>Créez une expédition d’abord.</p>'; return; }
    target.innerHTML = `<p>Expédition active: ${active.id}</p><button id="new-pallet" class="btn">Créer palette</button><input id="scan" placeholder="Scanner commande/colis/tote"/><button id="ready" class="btn secondary">Valider palette</button><button id="ship" class="btn">Expédier palette</button><div id="lines" class="list"></div>`;
    let pallet;
    target.querySelector('#new-pallet').onclick = async()=>{ pallet = await put('shipping_pallets',{id:pid(pallets.length+1),shipmentId:active.id,status:'Nouveau',lines:[]}); toast(`Palette ${pallet.id}`); };
    const draw = ()=>{ target.querySelector('#lines').innerHTML = pallet ? pallet.lines.map((l)=>`<div class='list-item'>${l.code}</div>`).join('') : '<p>Aucune palette</p>'; };
    target.querySelector('#scan').onkeydown = async(e)=>{ if(e.key!=='Enter' || !pallet) return; const code=e.target.value.trim(); if(!code) return; pallet.lines.push({code}); await put('shipping_scans',{id:crypto.randomUUID(), palletId:pallet.id, code}); await put('shipping_pallets',pallet); e.target.value=''; draw(); };
    target.querySelector('#ready').onclick = async()=>{ if(!pallet) return; pallet.status='Prête'; await put('shipping_pallets',pallet); toast('Palette prête'); };
    target.querySelector('#ship').onclick = async()=>{ if(!pallet) return; pallet.status='Expédiée'; await put('shipping_pallets',pallet); active.status='Expédié'; await put('shipping_shipments',active); await logEvent('shipping','ship_pallet',{palletId:pallet.id, shipmentId:active.id}); toast('Palette expédiée'); };
  } else if (sub === 'history') {
    const logs = await getAll('logs_global');
    target.innerHTML = `<div class="list">${logs.filter(l=>l.module==='shipping').map((l)=>`<div class='list-item'>${l.date} - ${l.action}</div>`).join('') || '<p>Vide</p>'}</div>`;
  } else if (sub === 'exports') {
    target.innerHTML = `<div class='inline-actions'><button id='csv' class='btn'>CSV</button><button id='xls' class='btn secondary'>Excel (CSV)</button><button id='pdf' class='btn secondary'>PDF print</button></div>`;
    target.querySelector('#csv').onclick = ()=>exportCSV('expeditions', shipments);
    target.querySelector('#xls').onclick = ()=>exportExcelLike('expeditions', shipments);
    target.querySelector('#pdf').onclick = ()=>printPDF('Expéditions', `<table><tr><th>ID</th><th>Transporteur</th><th>Statut</th></tr>${shipments.map(s=>`<tr><td>${s.id}</td><td>${s.carrier}</td><td>${s.status}</td></tr>`).join('')}</table>`);
  } else if (sub === 'settings') {
    target.innerHTML = `<label>Zones actives</label><div class='row wrap'><label><input type='checkbox' checked/>Zone A</label><label><input type='checkbox' checked/>Zone B</label><label><input type='checkbox'/>Zone C</label><label><input type='checkbox'/>Zone D</label></div><p class='small'>Préférences persistées dans paramètres globaux.</p>`;
  }
}
