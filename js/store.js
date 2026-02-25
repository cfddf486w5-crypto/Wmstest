const DB_NAME = 'dlwms_db_v1';
const DB_VERSION = 1;
const STORES = [
  'app_settings','users','logs_global','consolidation_sessions','consolidation_moves',
  'inventaire_items','inventaire_imports','shipping_shipments','shipping_pallets','shipping_scans',
  'remise_remises','remise_scrap_log','remise_rebox','remise_tasks','ai_notes','ai_chat','ai_faq'
];

const hasIDB = typeof indexedDB !== 'undefined';
let dbPromise;

function openDB() {
  if (!hasIDB) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  return dbPromise;
}

function lsKey(store){ return `dlwms_${store}`; }
function lsRead(store){ return JSON.parse(localStorage.getItem(lsKey(store)) || '[]'); }
function lsWrite(store, arr){ localStorage.setItem(lsKey(store), JSON.stringify(arr)); }

export async function getAll(store) {
  const db = await openDB();
  if (!db) return lsRead(store);
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function put(store, value) {
  const entity = { createdAt: new Date().toISOString(), ...value };
  if (!entity.id) entity.id = crypto.randomUUID();
  const db = await openDB();
  if (!db) {
    const all = lsRead(store).filter((x) => x.id !== entity.id);
    all.push(entity);
    lsWrite(store, all);
    return entity;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(entity);
    tx.oncomplete = () => resolve(entity);
    tx.onerror = () => resolve(entity);
  });
}

export async function remove(store, id) {
  const db = await openDB();
  if (!db) {
    lsWrite(store, lsRead(store).filter((x) => x.id !== id));
    return;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export async function logEvent(module, action, data = {}) {
  return put('logs_global', { module, action, data, date: new Date().toISOString() });
}

export async function seedData() {
  const settings = await getAll('app_settings');
  if (!settings.length) {
    await put('app_settings', {
      id: 'main',
      activeUser: 'Operateur 1',
      zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
      importEncoding: 'UTF-8',
      animations: true
    });
  }
  const faq = await getAll('ai_faq');
  if (!faq.length) {
    const modules = ['global','consolidation','remise','shipping','inventaire'];
    const rows = [];
    modules.forEach((m) => {
      for (let i = 1; i <= 10; i++) {
        rows.push({ id: `${m}-${i}`, module: m, q: `${m}: question fréquente ${i}`, a: `Réponse ${i} du module ${m}: vérifier les scans, valider et suivre le statut.` });
      }
    });
    for (const r of rows) await put('ai_faq', r);
  }
}
