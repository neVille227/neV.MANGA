// Gabarit commun : en-tête, navigation, pied de page, recherche. Tout texte dynamique est échappé.
export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const initials = (name) =>
  String(name).split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();

const NAV = [
  ["/", "Accueil", "home"],
  ["/oeuvres", "Œuvres", "oeuvres"],
  ["/beyond", "PROJECT: BEYOND", "beyond"],
  ["/bibliotheque", "Bibliothèque", "bibliotheque"],
  ["/studio", "Studio", "studio"],
];

export const BEYOND_NAV = [
  ["/beyond/histoire", "Histoire"],
  ["/beyond/sagas", "Sagas"],
  ["/beyond/personnages", "Personnages"],
  ["/beyond/familles", "Familles"],
  ["/beyond/nereth", "Néréth"],
  ["/beyond/chronologie", "Chronologie"],
  ["/beyond/continuite", "Continuité"],
];

export function layout({ title, description, section = "", path = "/", body, intro = false, base = "" }) {
  const nav = NAV.map(([href, label, key]) => `<a href="${href}" class="nav-link${section === key ? " active" : ""}"${section === key ? ' aria-current="page"' : ""}>${esc(label)}</a>`).join("");
  const sub = section === "beyond" && path !== "/beyond"
    ? `<nav class="subnav" aria-label="PROJECT: BEYOND">${BEYOND_NAV.map(([h, l]) => `<a href="${h}"${path === h || path.startsWith(h + "/") ? ' class="on" aria-current="page"' : ""}>${esc(l)}</a>`).join("")}</nav>`
    : "";
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#090a0d"><meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website">
<link rel="manifest" href="/manifest.webmanifest">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<script src="/boot.js"></script>
<script src="/app.js" defer></script>
</head>
<body>
${intro ? `<div class="intro" id="intro" aria-hidden="true"><div class="intro-rings"><i></i><i></i><i></i></div><div class="intro-mark"><span>n</span><b>V</b></div><p class="intro-line">Les histoires prennent forme</p><button class="intro-skip" type="button" id="intro-skip" tabindex="-1">Passer</button></div>` : ""}
<a class="skip" href="#main">Aller au contenu</a>
<header class="header" id="header">
  <a class="brand" href="/" aria-label="neV.MANGA, accueil"><span class="brand-mark">n<span>V</span></span><span class="brand-name">neV<span>.</span>MANGA</span></a>
  <nav class="main-nav" id="main-nav" aria-label="Navigation principale">${nav}</nav>
  <div class="header-actions"><button class="icon-btn" id="search-open" type="button" aria-label="Rechercher">⌕</button><button class="menu-toggle" id="menu-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button></div>
</header>
${sub}
<main id="main" tabindex="-1">
${body}
</main>
<footer class="footer"><a class="brand footer-brand" href="/">neV<span>.</span>MANGA</a><span>UN ESPACE DE CRÉATION ET DE FICTION</span><span>© <span id="year">2026</span> neV.MANGA</span></footer>
<div class="search" id="search" hidden><div class="search-box" role="dialog" aria-modal="true" aria-label="Recherche"><div class="search-top"><b>Recherche neV.MANGA</b><button type="button" id="search-close" aria-label="Fermer">×</button></div><input id="search-input" type="search" placeholder="Personnage, État, saga, arc…" autocomplete="off" maxlength="60"><div id="search-results" class="search-results"><p>Commence à saisir pour rechercher.</p></div></div></div>
</body>
</html>`;
}

export const portrait = (p, cls = "") =>
  p.img
    ? `<div class="portrait ${cls}"><img src="${esc(p.img)}" alt="Portrait de ${esc(p.name)}" loading="lazy" decoding="async"></div>`
    : `<div class="portrait portrait-empty ${cls}" role="img" aria-label="Portrait de ${esc(p.name)} à intégrer"><span>${esc(initials(p.name))}</span><small>Portrait à intégrer</small></div>`;

export const pageHead = (kicker, title, lead, extra = "") => `<section class="page-head"><div class="wrap">
<div class="kicker reveal">${esc(kicker)}</div><h1 class="reveal d1">${title}</h1>${lead ? `<p class="lead reveal d2">${lead}</p>` : ""}${extra}</div></section>`;
