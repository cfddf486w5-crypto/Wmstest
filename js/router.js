const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function getRoute() {
  const raw = window.location.hash || '#/modules';
  const path = raw.slice(1);
  return path.startsWith('/') ? path : `/${path}`;
}

export async function navigate() {
  const path = getRoute();
  const exact = routes.get(path);
  if (exact) return exact({ path });
  const prefix = [...routes.keys()].find((r) => r.endsWith('/*') && path.startsWith(r.replace('/*', '')));
  if (prefix) return routes.get(prefix)({ path });
  window.location.hash = '#/modules';
}
