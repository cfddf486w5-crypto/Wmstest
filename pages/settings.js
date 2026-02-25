import { getAll, put } from '../js/store.js';
import { toast } from '../js/ui.js';

export async function renderSettings(root) {
  const target = root.querySelector('#settings-content');
  const settings = (await getAll('app_settings'))[0];
  const users = await getAll('users');
  target.innerHTML = `<label>Utilisateur actif</label><input id='active' value='${settings?.activeUser||''}'/><button id='save-user' class='btn'>Enregistrer</button><h3>Utilisateurs</h3><div class='list'>${users.map(u=>`<div class='list-item'>${u.name}</div>`).join('')}</div><input id='new-user' placeholder='Ajouter utilisateur'/><button id='add-user' class='btn secondary'>Ajouter</button><h3>Import</h3><select id='enc'><option>UTF-8</option><option ${settings?.importEncoding==='Latin-1'?'selected':''}>Latin-1</option></select><h3>UI</h3><label><input id='anim' type='checkbox' ${settings?.animations?'checked':''}/> Animations</label><h3>Sauvegarde</h3><div class='inline-actions'><button id='exp-json' class='btn'>Export JSON</button><input id='imp-json' type='file' accept='application/json'/></div>`;
  target.querySelector('#add-user').onclick = async()=>{ const name=target.querySelector('#new-user').value.trim(); if(!name) return; await put('users',{id:crypto.randomUUID(),name}); toast('Utilisateur ajouté'); window.location.reload(); };
  target.querySelector('#save-user').onclick = async()=>{ await put('app_settings',{id:'main', ...settings, activeUser: target.querySelector('#active').value.trim(), importEncoding: target.querySelector('#enc').value, animations:target.querySelector('#anim').checked}); toast('Paramètres sauvegardés'); };
  target.querySelector('#exp-json').onclick = async()=>{
    const dump = {};
    const stores = ['app_settings','users','logs_global','consolidation_sessions','consolidation_moves','inventaire_items','inventaire_imports','shipping_shipments','shipping_pallets','shipping_scans','remise_remises','remise_scrap_log','remise_rebox','remise_tasks','ai_notes','ai_chat','ai_faq'];
    for (const s of stores) dump[s] = await getAll(s);
    const blob = new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='dlwms-backup.json'; a.click();
  };
  target.querySelector('#imp-json').onchange = (e)=>{ const file=e.target.files[0]; if(!file)return; const fr=new FileReader(); fr.onload=async()=>{ const dump=JSON.parse(fr.result); for(const [store,arr] of Object.entries(dump)){ if(Array.isArray(arr)) for(const row of arr) await put(store,row);} toast('Backup importé'); }; fr.readAsText(file); };
}
