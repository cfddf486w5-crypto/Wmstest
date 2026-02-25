import { registerRoute, navigate, getRoute } from './router.js';
import { seedData } from './store.js';
import { askAI } from './ai.js';
import { modal } from './ui.js';
import { renderModules } from '../pages/modules.js';
import { renderConsolidation } from '../pages/consolidation.js';
import { renderRemise } from '../pages/remise.js';
import { renderShipping } from '../pages/shipping.js';
import { renderInventaire } from '../pages/inventaire.js';
import { renderHistory } from '../pages/history.js';
import { renderSettings } from '../pages/settings.js';

const app = document.getElementById('app');
const title = document.getElementById('page-title');
const subtitle = document.getElementById('page-subtitle');
const aiMessages = document.getElementById('ai-messages');

async function mount(page, renderer, pageTitle, pageSubtitle) {
  const html = await fetch(`pages/${page}.html`).then((r)=>r.text());
  app.innerHTML = html;
  title.textContent = pageTitle;
  subtitle.textContent = pageSubtitle;
  renderer(app, getRoute());
  document.querySelectorAll('[data-nav]').forEach((n)=>n.classList.toggle('active', n.getAttribute('href') === `#/${page}`));
}

registerRoute('/modules', ()=>mount('modules', renderModules, 'DL WMS', 'Dashboard des modules'));
registerRoute('/consolidation/*', ()=>mount('consolidation', renderConsolidation, 'Consolidation', 'Chargement, optimisation, historique, stats'));
registerRoute('/consolidation', ()=>window.location.hash='#/consolidation/');
registerRoute('/remise/*', ()=>mount('remise', renderRemise, 'Remise en stock', 'Workflow remises et bins'));
registerRoute('/remise', ()=>window.location.hash='#/remise/');
registerRoute('/shipping/*', ()=>mount('shipping', renderShipping, 'Suivi expédition', 'Expéditions, palettes, scans, exports'));
registerRoute('/shipping', ()=>window.location.hash='#/shipping/');
registerRoute('/inventaire/*', ()=>mount('inventaire', renderInventaire, 'Inventaire', 'Scan, recherche, import, history'));
registerRoute('/inventaire', ()=>window.location.hash='#/inventaire/');
registerRoute('/history', ()=>mount('history', renderHistory, 'Historique global', 'Timeline complète'));
registerRoute('/settings', ()=>mount('settings', renderSettings, 'Paramètres', 'Utilisateurs, zones, sauvegardes'));

window.addEventListener('hashchange', navigate);
window.addEventListener('load', async () => {
  await seedData();
  if (!location.hash) location.hash = '#/modules';
  navigate();
});

const moduleOfRoute = () => (getRoute().split('/')[1] || 'global');
document.getElementById('ai-send').onclick = async () => {
  const input = document.getElementById('ai-input');
  const q = input.value.trim();
  if (!q) return;
  const module = moduleOfRoute();
  const r = await askAI(q, module);
  aiMessages.innerHTML = `<div class='list-item'><strong>Q:</strong> ${q}</div><div class='list-item'><strong>IA:</strong><br>${r.replace(/\n/g,'<br>')}</div>` + aiMessages.innerHTML;
  input.value = '';
};
document.getElementById('ai-why').onclick = () => {
  const module = moduleOfRoute();
  modal({ title: `Pourquoi ? (${module})`, body: `Règles du module ${module}: respecter les scans, valider les statuts, tracer chaque action dans l'historique global.`, actions:[{label:'Fermer'}] });
};

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('btn-install').hidden = false;
});
document.getElementById('btn-install').onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
