# neV.MANGA

Site **dynamique** (Node.js ≥ 22, sans dépendance) : pages rendues côté serveur, aucune page statique.

## Lancer
`node server.js` (PORT par défaut 3000). Santé : `/api/health`.

## Architecture
- `server.js` : routeur, en-têtes de sécurité (CSP, HSTS, X-Frame-Options…), limitation de débit, sitemap, robots.
- `lib/data.js` : lit `data/content.json`, résout les images de `assets/`.
- `lib/html.js` : gabarit commun (en-tête, navigation, intro, recherche).
- `lib/pages.js` : toutes les pages. Les manques de canon affichent « À compléter par l'auteur ».
- `public/` : `styles.css`, `app.js`, `boot.js`.

## Routes
`/`, `/oeuvres`, `/beyond`, `/beyond/histoire`, `/beyond/sagas`, `/beyond/sagas/:n`, `/beyond/personnages`, `/beyond/personnages/:slug`, `/beyond/familles`, `/beyond/nereth` (cartes), `/beyond/chronologie`, `/beyond/continuite`, `/bibliotheque`, `/galerie` (vide, non finalisée), `/studio`, `/api/content`, `/api/search?q=`.

## Ajouter des images (aucun code à modifier)
- Portrait : `assets/<slug-du-personnage>.webp` (ex. `akira-sei.webp`) ; .avif/.jpg/.png acceptés.
- Photo de famille : `assets/famille-<slug>.webp`.
- Cartes : `assets/carte-nereth.webp`, `carte-nereth-axes.webp`, `capitales-nereth.webp`.
