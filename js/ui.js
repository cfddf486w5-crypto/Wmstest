export function el(tag, attrs = {}, html = '') {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  if (html) node.innerHTML = html;
  return node;
}

export function toast(message) {
  const root = document.getElementById('toast-root');
  const t = el('div', { class: 'toast card-glass' }, message);
  root.innerHTML = '';
  root.appendChild(t);
  setTimeout(() => { if (root.contains(t)) t.remove(); }, 2600);
}

export function modal({ title, body, actions = [] }) {
  const root = document.getElementById('modal-root');
  const backdrop = el('div', { class: 'modal-backdrop' });
  const content = el('div', { class: 'modal card-glass' });
  content.innerHTML = `<h3>${title}</h3><div>${body}</div>`;
  const actionsWrap = el('div', { class: 'inline-actions' });
  actions.forEach((a) => {
    const b = el('button', { class: `btn ${a.kind || 'secondary'}` }, a.label);
    b.onclick = () => { a.onClick?.(); backdrop.remove(); };
    actionsWrap.appendChild(b);
  });
  content.appendChild(actionsWrap);
  backdrop.appendChild(content);
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  root.innerHTML = '';
  root.appendChild(backdrop);
}

export function csvDownload(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
