# neV.MANGA — Portail officiel

Portail éditorial et espace de consultation du studio indépendant neV.MANGA.

## Espaces disponibles
- Accueil éditorial et catalogue filtrable des œuvres.
- Fiche de présentation de PROJECT: BEYOND.
- Registre de sept personnages principaux et des personnages secondaires/familles déjà nommés dans les dossiers.
- Fiches consultables des personnages avec distinction des données établies et des informations à compléter.
- Présentation des cinq États de Néréth.
- Architecture narrative complète : six sagas et trente arcs.
- Recherche transversale dans les œuvres, personnages et États.
- Bibliothèque structurée pour les documents, galeries, chronologies et chapitres.
- Espace Studio avec sauvegarde locale de brouillons.
- Navigation responsive, menu mobile, page 404, sitemap et manifeste web.

## Architecture technique
Application **dynamique** (serveur Node.js sans dépendance externe) :
- `server.js` : serveur HTTP, API `/api/content` et `/api/health`, génération de `/content.js`, `/robots.txt` et `/sitemap.xml` selon l'adresse du site.
- `data/content.json` : données éditoriales structurées de PROJECT: BEYOND (modifiables sans toucher à l'interface).
- `index.html`, `styles.css`, `app.js` : interface du portail (navigation, recherche, fiches, onglets).
- `404.html`, `manifest.webmanifest` : pages et fichiers de support.

## Lancer en local
```bash
npm start   # http://localhost:3000
```

## Hébergement
Service web Render (Node) : commande de démarrage `npm start`, test de santé `/api/health`.

## Prochaines intégrations
Les brouillons de l'espace Studio restent dans le stockage local du navigateur : ils ne sont ni sécurisés comme un espace administrateur, ni synchronisés entre appareils. Les comptes (neV.ID), rôles, base de données, téléversement partagé et publication de chapitres sont à brancher ensuite. Les portraits et planches originales ne sont pas remplacés par des images inventées. Aucun chapitre finalisé n'est présenté comme publié.

## Références éditoriales intégrées
- PROJECT: BEYOND — Dossier de référence UNIVERS V1.1.
- PROJECT: BEYOND — Dossier de consolidation V3.0.

Les informations explicitement validées sont prioritaires. Les éléments à préciser ne sont pas présentés comme des faits établis.
