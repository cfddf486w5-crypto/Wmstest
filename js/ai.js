import { getAll, put } from './store.js';

function score(text, q) {
  const t = text.toLowerCase();
  return q.toLowerCase().split(/\s+/).reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
}

export async function askAI(question, module = 'global') {
  const [faq, notes] = await Promise.all([getAll('ai_faq'), getAll('ai_notes')]);
  const pool = [...faq.filter((x) => x.module === module || x.module === 'global'), ...notes.filter((x) => x.module === module || x.module === 'global')];
  const ranked = pool.map((x) => ({ ...x, s: score(`${x.q} ${x.a}`, question) })).sort((a, b) => b.s - a.s);
  const top = ranked[0];
  const response = top?.s > 0 ? top.a : 'Résumé: Vérifier le workflow standard. Étapes: scanner, contrôler quantité, valider statut. Pourquoi: garantir la traçabilité. Où cliquer: tuiles du module puis action principale.';
  await put('ai_chat', { module, question, response, date: new Date().toISOString() });
  return `Résumé: ${response}\nÉtapes: 1) Ouvrir le module 2) Scanner/éditer 3) Valider.\nPourquoi: maintenir la qualité des stocks.\nOù cliquer: dashboard ${module}.`;
}

export async function addNote(module, q, a) {
  return put('ai_notes', { module, q, a });
}
