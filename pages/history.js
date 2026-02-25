import { getAll } from '../js/store.js';

export async function renderHistory(root) {
  const logs = await getAll('logs_global');
  const target = root.querySelector('#history-content');
  target.innerHTML = `<div class='row wrap'><input id='module' placeholder='Filtre module'/><input id='date' type='date'/></div><div id='timeline' class='list'></div>`;
  const time = target.querySelector('#timeline');
  const draw = ()=>{
    const m = target.querySelector('#module').value.toLowerCase();
    const d = target.querySelector('#date').value;
    time.innerHTML = logs.filter((l)=> (!m || l.module.includes(m)) && (!d || l.date.startsWith(d))).sort((a,b)=>b.date.localeCompare(a.date)).map((l)=>`<div class='list-item'><strong>${l.module}</strong> · ${l.action}<div class='small'>${new Date(l.date).toLocaleString('fr-FR')}</div></div>`).join('') || '<p>Aucun log</p>';
  };
  target.querySelector('#module').oninput = draw;
  target.querySelector('#date').onchange = draw;
  draw();
}
