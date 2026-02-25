import { getAll, put, logEvent } from '../js/store.js';
import { modal, toast } from '../js/ui.js';

const statusList = ['Nouveau','En traitement','Complété'];
const rid = (n) => `LAVREM${String(n).padStart(4,'0')}`;

export async function renderRemise(root, path) {
  const sub = path.split('/')[2] || '';
  const target = root.querySelector('#remise-content');
  const remises = await getAll('remise_remises');
  if (!sub) {
    target.innerHTML = `<div class="grid-2"><a class="tile card-glass" href="#/remise/generer">Générer</a><a class="tile card-glass" href="#/remise/suivant">Suivant</a><a class="tile card-glass" href="#/remise/verifier">Vérifier</a><a class="tile card-glass" href="#/remise/bins">Bins</a></div><div class="row wrap">${statusList.map(s=>`<span class="status-pill">${s}: ${remises.filter(r=>r.status===s).length}</span>`).join('')}</div>`;
    return;
  }
  if (sub === 'generer') {
    target.innerHTML = `<button id="new" class="btn">Nouvelle remise</button><input id="scan" placeholder="Scan item (1 scan=1 pièce)"/><div id="items" class="list"></div><button id="complete" class="btn">Compléter remise</button>`;
    let current;
    target.querySelector('#new').onclick = async()=>{
      const id = rid(remises.length + 1);
      current = await put('remise_remises', { id, status:'Nouveau', items:[], createdAt:new Date().toISOString() });
      toast(`Remise ${id} créée`);
    };
    const draw = ()=>{ if(!current) return; target.querySelector('#items').innerHTML = current.items.map((it,i)=>`<div class="list-item row"><span>${it.sku} x${it.qty}</span><button data-i="${i}" class="btn secondary">Actions</button></div>`).join(''); target.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
      const idx=Number(b.dataset.i); modal({title:'Action item',body:'Choisissez',actions:[
        {label:'Briser',kind:'warn',onClick:async()=>{const bin=prompt('Scanner bac ScrapboxX'); if(!/^Scrapbox/i.test(bin||'')){toast('Bac invalide');return;} await put('remise_scrap_log',{remiseId:current.id, sku:current.items[idx].sku, bin}); current.items.splice(idx,1); await put('remise_remises',current); draw();}},
        {label:'Rebox',onClick:async()=>{await put('remise_rebox',{remiseId:current.id, sku:current.items[idx].sku}); current.items.splice(idx,1); await put('remise_remises',current); draw();}},
        {label:'Supprimer',kind:'danger',onClick:async()=>{current.items.splice(idx,1); await put('remise_remises',current); draw();}},
        {label:'Annuler'}]}); }); };
    target.querySelector('#scan').onkeydown = async(e)=>{ if(e.key!=='Enter' || !current) return; const sku=e.target.value.trim(); if(!sku) return; const f=current.items.find(i=>i.sku===sku); if(f) f.qty += 1; else current.items.push({sku,qty:1,bin:''}); await put('remise_remises',current); e.target.value=''; draw();};
    target.querySelector('#complete').onclick = async()=>{ if(!current) return; current.status='En traitement'; current.items.sort((a,b)=>a.sku.localeCompare(b.sku)); await put('remise_remises',current); await logEvent('remise','complete_prepare',{id:current.id}); toast('Liste optimisée générée'); };
  } else if (sub === 'suivant') {
    const active = remises.find((r)=>r.status==='En traitement');
    if (!active) { target.innerHTML = '<p>Aucune remise en traitement.</p>'; return; }
    const pending = active.items.find((i)=>i.qty>0);
    target.innerHTML = pending ? `<p>Remise ${active.id}</p><p>Produit: <strong>${pending.sku}</strong> restant ${pending.qty}</p><input id="scan-product" placeholder="Scanner produit"/><input id="scan-bin" placeholder="Scanner bin"/><button id="force" class="btn secondary">Forcer</button>` : `<p>Tout confirmé.</p>`;
    if (pending) {
      target.querySelector('#scan-product').onkeydown = async(e)=>{ if(e.key!=='Enter') return; pending.qty -= 1; await put('remise_remises',active); toast(pending.qty===0?'Produit confirmé':'Scan accepté'); if(pending.qty===0) target.querySelector('#scan-bin').focus(); };
      target.querySelector('#scan-bin').onkeydown = async(e)=>{ if(e.key!=='Enter') return; if(pending.qty>0){toast('Scans produits obligatoires');return;} pending.bin=e.target.value.trim(); await put('remise_tasks',{remiseId:active.id, sku:pending.sku, bin:pending.bin}); active.items=active.items.filter(i=>i!==pending); if(!active.items.length) active.status='Complété'; await put('remise_remises',active); toast('Remise complète / prochain'); window.location.hash='#/remise/suivant'; };
      target.querySelector('#force').onclick = async()=>{ const j=prompt('Justification'); if(!j) return; pending.qty=0; await logEvent('remise','force',{id:active.id,sku:pending.sku,j}); await put('remise_remises',active); toast('Forçage enregistré'); };
    }
  } else if (sub === 'verifier' || sub === 'bins') {
    target.innerHTML = `<div class="list">${remises.map((r)=>`<div class="list-item">${r.id} - ${r.status} - ${r.items?.length||0} lignes</div>`).join('') || '<p>Aucune remise</p>'}</div>`;
  }
}
