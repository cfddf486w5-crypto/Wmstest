import { getAll, put, logEvent } from '../js/store.js';
import { toast } from '../js/ui.js';
import { exportCSV } from '../js/export.js';

export async function renderInventaire(root, path) {
  const sub = path.split('/')[2] || '';
  const target = root.querySelector('#inventaire-content');
  const items = await getAll('inventaire_items');
  if (!sub) {
    target.innerHTML = `<div class="grid-2"><a class="tile card-glass" href="#/inventaire/scan">Scan</a><a class="tile card-glass" href="#/inventaire/recherche">Recherche</a><a class="tile card-glass" href="#/inventaire/import">Import CSV</a><a class="tile card-glass" href="#/inventaire/history">Historique</a></div><button id='export' class='btn'>Export CSV inventaire</button>`;
    target.querySelector('#export').onclick = ()=>exportCSV('inventaire', items);
    return;
  }
  if (sub === 'scan') {
    target.innerHTML = `<input id='sku' placeholder='SKU'/><input id='bin' placeholder='BIN'/><input id='qty' type='number' value='1'/><div class='inline-actions'><button id='plus' class='btn'>+</button><button id='minus' class='btn secondary'>-</button></div>`;
    const save = async(sign)=>{ const sku=target.querySelector('#sku').value.trim(); const bin=target.querySelector('#bin').value.trim(); const qty=Number(target.querySelector('#qty').value||1)*sign; if(!sku||!bin)return; const ex=items.find(i=>i.sku===sku&&i.bin===bin); if(ex){ex.qty=(ex.qty||0)+qty; await put('inventaire_items', ex);} else await put('inventaire_items',{id:`${sku}-${bin}`,sku,bin,description:'',qty}); await logEvent('inventaire','scan',{sku,bin,qty}); toast('Mouvement enregistré'); };
    target.querySelector('#plus').onclick = ()=>save(1);
    target.querySelector('#minus').onclick = ()=>save(-1);
  } else if (sub === 'recherche') {
    target.innerHTML = `<input id='q' placeholder='Filtrer SKU/BIN/description'/><div id='res' class='list'></div>`;
    const res = target.querySelector('#res');
    const draw = ()=>{ const q=target.querySelector('#q').value.toLowerCase(); res.innerHTML = items.filter(i=>`${i.sku} ${i.bin} ${i.description||''}`.toLowerCase().includes(q)).map(i=>`<div class='list-item'>${i.sku} | ${i.bin} | qty ${i.qty}</div>`).join(''); };
    target.querySelector('#q').oninput = draw; draw();
  } else if (sub === 'import') {
    target.innerHTML = `<input type='file' id='file' accept='.csv'/><p class='small'>Format: sku,bin,description,qty</p>`;
    target.querySelector('#file').onchange = (e)=>{ const file=e.target.files[0]; if(!file) return; const fr=new FileReader(); fr.onload=async()=>{ const lines=String(fr.result).split(/\r?\n/).filter(Boolean); for(const line of lines.slice(1)){ const [sku,bin,description,qty]=line.split(','); await put('inventaire_items',{id:`${sku}-${bin}`,sku,bin,description,qty:Number(qty||0)}); } await put('inventaire_imports',{id:crypto.randomUUID(), name:file.name, rows:lines.length-1}); toast('Import terminé');}; fr.readAsText(file); };
  } else if (sub === 'history') {
    const logs = await getAll('logs_global');
    target.innerHTML = `<div class='list'>${logs.filter(l=>l.module==='inventaire').map(l=>`<div class='list-item'>${l.date} - ${l.action} - ${l.data?.sku||''}</div>`).join('')||'<p>Vide</p>'}</div>`;
  }
}
