export function renderModules(root) {
  const modules = [
    ['Consolidation', '#/consolidation'],['Inventaire', '#/inventaire'],['Suivi expédition', '#/shipping'],['Remise en stock', '#/remise'],['Historique', '#/history'],['Paramètres', '#/settings']
  ];
  const grid = root.querySelector('#modules-grid');
  grid.innerHTML = modules.map(([name, href]) => `<a class="tile card-glass" href="${href}"><strong>${name}</strong><span class="small">Accéder au module</span></a>`).join('');
}
