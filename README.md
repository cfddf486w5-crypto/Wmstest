# DL WMS (PWA Offline)

Application WMS iPhone-first en HTML/CSS/JS vanilla, sans API ni dépendance externe.

## Lancer en local
```bash
python3 -m http.server 8080
```
Puis ouvrir `http://localhost:8080`.

## Installation PWA sur iPhone (Safari)
1. Ouvrir l’app dans Safari.
2. Bouton Partager.
3. **Ajouter à l’écran d’accueil**.
4. Ouvrir l’icône **DL WMS** (mode standalone).

## Routes hash
- `#/modules`
- `#/consolidation`, `#/consolidation/charger`, `#/consolidation/optimiser`, `#/consolidation/historique`, `#/consolidation/statistiques`
- `#/remise`, `#/remise/generer`, `#/remise/suivant`, `#/remise/verifier`, `#/remise/bins`
- `#/shipping`, `#/shipping/create`, `#/shipping/scan`, `#/shipping/history`, `#/shipping/exports`, `#/shipping/settings`
- `#/inventaire`, `#/inventaire/scan`, `#/inventaire/recherche`, `#/inventaire/import`, `#/inventaire/history`
- `#/history`
- `#/settings`

## Données offline
- Stockage principal: `IndexedDB` (DB `dlwms_db_v1`)
- Fallback: `localStorage` (`dlwms_<store>`)
- Stores: settings, users, logs, consolidation, remise, shipping, inventaire, IA (FAQ/notes/chat).

## Arborescence
- `index.html` shell + IA + navbar
- `css/` thème/layout/composants
- `js/` app/router/store/ui/ai/export
- `pages/` HTML + JS par module
- `sw.js` precache cache-first
- `manifest.webmanifest`

## Export
- CSV / “Excel” (CSV)
- PDF simple via `window.print()`

## Contraintes respectées
- 100% offline-first
- 0 framework, 0 CDN, 0 API
- Compatible GitHub Pages (hash routing)
