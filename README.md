# DL WMS – Générateur de transfert < seuil (V2.2 – OFFLINE)

## Objectif
Importer **Inventaire actuel (Langelier)** + **Arrivages conteneur** et générer la liste des produits dont le **stock futur < seuil** (défaut 20).

## Important (Excel en mode 100% offline)
Un fichier **Excel (.xlsx)** est un **ZIP** interne. Un navigateur ne peut pas le lire nativement **sans librairie JS externe**.

➡️ Solution OFFLINE fournie :
1) Convertis ton Excel en CSV avec le convertisseur inclus
2) Importe le CSV dans l'app

## 1) Ouvrir l'app
- Double-clique `index.html` (Chrome/Edge recommandé)

## 2) Convertir Excel → CSV (Windows laptop)
Option A (facile): **double-clique** `convert_xlsx_to_csv.bat`
- Détecte automatiquement `py -3` ou `python`
- Ça te demande le chemin du fichier Excel
- Ça te sort un CSV dans le même dossier (même nom + `.csv`)

Option B (manuel):
```bash
python convert_xlsx_to_csv.py "C:\chemin\fichier.xlsx"
```

## 3) Importer dans l'app
- Import **CSV Inventaire**
- Import **CSV Conteneur**
- Clique **⚡ Générer la liste**
- **⬇️ Export CSV** (uniquement “À transférer”)



## Revérification avant de figer la version
Checklist rapide recommandée avant de livrer:
- Ouvrir `index.html` et confirmer la version affichée (**V2.2**) dans le titre, l’en-tête et le pied de page.
- Importer 2 CSV de test (inventaire + conteneur) et valider que le bouton **⚡ Générer la liste** produit des résultats.
- Vérifier que **⬇️ Export CSV** n’exporte que les lignes **À transférer**.
- Fermer/réouvrir la page et confirmer la restauration du cache local.

## Compatibilité Windows améliorée
- L’app web accepte maintenant automatiquement les CSV séparés par **virgule**, **point-virgule** ou **tabulation**.
- Les nombres de type `1 234`, `1,234`, `1.234`, `1,5` sont mieux interprétés.
- Les items sont fusionnés sans sensibilité à la casse (`abc` = `ABC`) pour éviter les doublons.

## Formats
Le convertisseur prend la **1ère feuille** du fichier.
Si tu veux une feuille précise, tu peux la spécifier:
```bash
python convert_xlsx_to_csv.py "fichier.xlsx" --sheet "NomDeFeuille"
```

Astuce Windows/Excel:
- Le script exporte par défaut en **UTF-8 BOM** (meilleure compatibilité accents sous Excel Windows).
- Tu peux choisir un séparateur différent si ton Excel attend `;`:
```bash
python convert_xlsx_to_csv.py "fichier.xlsx" --delimiter ";"
```

© 2026 – DL WMS
