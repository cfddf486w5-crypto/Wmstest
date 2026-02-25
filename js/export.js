import { csvDownload, toast } from './ui.js';

export function exportCSV(name, data) {
  if (!data.length) return toast('Aucune donnée à exporter.');
  const headers = Object.keys(data[0]);
  const rows = [headers, ...data.map((d) => headers.map((h) => d[h]))];
  csvDownload(`${name}.csv`, rows);
  toast(`Export ${name}.csv généré.`);
}

export function exportExcelLike(name, data) {
  exportCSV(`${name}_excel`, data);
}

export function printPDF(title, html) {
  const w = window.open('', '_blank');
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial;padding:16px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #888;padding:6px}</style></head><body><h1>${title}</h1>${html}</body></html>`);
  w.document.close();
  w.print();
}
