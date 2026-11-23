// Pages rendues côté serveur à partir de data/content.json. Aucun récit n'est inventé :
// là où le texte de l'auteur manque, un emplacement explicite est affiché.
import { esc, initials, layout, portrait, pageHead } from "./html.js";

const TODO = (what) => `<div class="todo"><b>À compléter par l'auteur</b><span>${esc(what)}</span></div>`;
const arrow = '<span aria-hidden="true">→</span>';
const romans = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function stats(d) {
  return [
    [d.sagas.length, "sagas"], [d.arcs.length, "arcs"], [d.states.length, "États"], [d.main.length, "personnages principaux"],
  ].map(([n, l], i) => `<div class="stat reveal d${i + 1}"><b data-count="${n}">${n}</b><span>${esc(l)}</span></div>`).join("");
}

export const pages = {
  home(d) {
    const body = `
<section class="hero">
  <div class="hero-bg" aria-hidden="true"><i class="orb o1" data-parallax="0.12"></i><i class="orb o2" data-parallax="-0.08"></i><i class="grid-lines"></i></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <div class="kicker reveal"><span class="pulse"></span> STUDIO INDÉPENDANT · UNIVERS ORIGINAUX</div>
      <h1 class="hero-title reveal d1">Les histoires<br>prennent <span>forme.</span></h1>
      <p class="lead reveal d2">Un espace pour découvrir les œuvres, explorer leurs univers et suivre leur construction, de la première idée aux pages finalisées.</p>
      <div class="actions reveal d3"><a class="btn" href="/beyond">Explorer PROJECT: BEYOND ${arrow}</a><a class="link" href="/oeuvres">Voir les œuvres ${arrow}</a></div>
    </div>
    <div class="hero-art reveal d2" data-parallax="0.05">
      <div class="orbit a"></div><div class="orbit b"></div><div class="core core-logo"><img src="/assets/logo-nev-manga.webp" alt="Logo neV.MANGA" decoding="async"></div>
    </div>
  </div>
  <a class="scroll-cue" href="#univers" aria-label="Descendre">DÉCOUVRIR <i></i></a>
</section>
<section class="banner reveal" aria-label="Bannière neV.MANGA"><img src="/assets/banniere-nev-manga.webp" alt="neV.MANGA — Independent Manga Studio. Beyond the frame." decoding="async"></section>
<div class="ticker" aria-hidden="true"><div class="ticker-track"><span>FICTION</span><i>✳</i><span>CRÉATION</span><i>✳</i><span>UNIVERS</span><i>✳</i><span>NARRATION</span><i>✳</i><span>FICTION</span><i>✳</i><span>CRÉATION</span><i>✳</i><span>UNIVERS</span><i>✳</i><span>NARRATION</span><i>✳</i></div></div>
<section class="section" id="univers"><div class="wrap">
  <div class="kicker reveal">01 / UNIVERS N°001</div>
  <a class="feature reveal d1 tilt" href="/beyond">
    <div class="feature-bg" aria-hidden="true"><i class="orbit a"></i><i class="orbit b"></i></div>
    <div class="feature-copy"><small>${esc(d.project.genre.toUpperCase())}</small><h2>PROJECT:<br><span>BEYOND</span></h2><p>${esc(d.project.summary)}</p><span class="btn">Entrer dans l'univers ${arrow}</span></div>
  </a>
  <div class="stats">${stats(d)}</div>
</div></section>
<section class="section alt"><div class="wrap split">
  <div><div class="kicker reveal">02 / STUDIO</div><h2 class="h2 reveal d1">De l'idée<br>à <span>l'œuvre.</span></h2><p class="lead reveal d2">Le studio organise les projets autour de quatre étapes : conception, développement, continuité et production.</p><a class="btn reveal d3" href="/studio">Ouvrir le studio ${arrow}</a></div>
  <ol class="steps">${[["Concevoir", "Définir le concept et les fondations."], ["Développer", "Construire les personnages et les récits."], ["Consolider", "Vérifier la cohérence et la continuité."], ["Produire", "Préparer les chapitres et les supports."]].map(([t, s], i) => `<li class="reveal d${i + 1}"><span>0${i + 1}</span><b>${t}</b><small>${s}</small></li>`).join("")}</ol>
</div></section>`;
    return layout({ title: "neV.MANGA — Studio & univers", description: "neV.MANGA — portail des œuvres, univers et créations manga.", section: "home", path: "/", body, intro: true });
  },

  oeuvres(d, q) {
    const term = (q.get("q") || "").trim().slice(0, 60).toLowerCase();
    const status = q.get("statut") || "all";
    const visible = (`project beyond ${d.project.summary} ${d.project.genre}`.toLowerCase().includes(term)) && (status === "all" || status === "development");
    const card = `<a class="work reveal tilt" href="/beyond"><div class="work-art" aria-hidden="true"><i class="orbit a"></i><i class="orbit b"></i><span>BEYOND</span></div><div class="work-body"><div class="meta"><span>UNIVERS N°001</span><span>EN DÉVELOPPEMENT</span></div><h3>PROJECT: BEYOND</h3><p>${esc(d.project.summary)}</p><div class="meta foot"><span>${esc(d.project.genre.toUpperCase())}</span><b>Explorer ${arrow}</b></div></div></a>`;
    const body = `${pageHead("01 / CATALOGUE", 'Les œuvres<span class="dot">.</span>', "Les projets du studio neV.MANGA.")}
<section class="section tight"><div class="wrap">
<form class="toolbar reveal" method="get" action="/oeuvres" role="search"><label class="field"><span aria-hidden="true">⌕</span><input name="q" type="search" value="${esc(term)}" placeholder="Rechercher une œuvre…" aria-label="Rechercher une œuvre" maxlength="60"></label>
<select name="statut" aria-label="Filtrer par statut"><option value="all"${status === "all" ? " selected" : ""}>Tous les statuts</option><option value="development"${status === "development" ? " selected" : ""}>En développement</option><option value="published"${status === "published" ? " selected" : ""}>Publié</option></select><button class="btn small" type="submit">Filtrer</button></form>
<div class="works">${visible ? card : '<div class="empty">Aucune œuvre ne correspond à cette recherche.</div>'}</div></div></section>`;
    return layout({ title: "Les œuvres — neV.MANGA", description: "Catalogue des œuvres du studio neV.MANGA.", section: "oeuvres", path: "/oeuvres", body });
  },

  beyond(d) {
    const tiles = [
      ["/beyond/histoire", "Histoire", "Le monde, l'Éveil et le point de départ du récit."],
      ["/beyond/sagas", "Sagas", `${d.sagas.length} sagas et ${d.arcs.length} arcs, chacune sur sa page.`],
      ["/beyond/personnages", "Personnages", `${d.main.length} personnages principaux et ${d.secondary.length} figures de leur entourage.`],
      ["/beyond/familles", "Familles", `${d.families.length} familles identifiées, avec leurs membres.`],
      ["/beyond/nereth", "Néréth", `La carte, ${d.states.length} États, leurs capitales et leurs régions.`],
      ["/beyond/chronologie", "Chronologie", "Les arcs dans l'ordre, du premier au dernier."],
      ["/beyond/continuite", "Continuité", "Les règles qui distinguent le canon des hypothèses."],
    ].map(([h, t, s], i) => `<a class="tile reveal d${(i % 4) + 1} tilt" href="${h}"><span class="num">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(s)}</p><b>Ouvrir ${arrow}</b></a>`).join("");
    const body = `
<section class="beyond-hero"><div class="hero-bg" aria-hidden="true"><i class="orb o1" data-parallax="0.14"></i><i class="orb o2" data-parallax="-0.1"></i><i class="grid-lines"></i><i class="orbit a"></i><i class="orbit b"></i></div>
<div class="wrap">
<div class="kicker reveal">02 / UNIVERS N°001 · ŒUVRE ORIGINALE</div>
<h1 class="mega reveal d1">PROJECT:<br><span>BEYOND</span></h1>
<p class="sub reveal d2">${esc(d.project.subtitle)}</p>
<p class="lead reveal d3">${esc(d.project.summary)}</p>
<div class="facts reveal d4">
<div><small>MONDE</small><b>${esc(d.project.world)}</b></div><div><small>ÉVÉNEMENT FONDATEUR</small><b>${esc(d.project.event)}</b></div><div><small>STATUT</small><b>${esc(d.project.status)}</b></div><div><small>GENRE</small><b>${esc(d.project.genre)}</b></div></div>
<div class="actions reveal d5"><a class="btn" href="/beyond/histoire">Commencer par l'histoire ${arrow}</a><a class="link" href="/beyond/nereth">Voir la carte de Néréth ${arrow}</a></div>
</div></section>
<section class="section"><div class="wrap"><div class="kicker reveal">EXPLORER L'UNIVERS</div><div class="tiles">${tiles}</div></div></section>`;
    return layout({ title: "PROJECT: BEYOND — neV.MANGA", description: d.project.summary, section: "beyond", path: "/beyond", body });
  },

  histoire(d) {
    const body = `${pageHead("HISTOIRE", 'Un monde transformé,<br><span>pas effondré.</span>', esc(d.project.summary))}
<section class="section tight"><div class="wrap narrow">
<article class="story-block reveal"><small>LE MONDE</small><h2>${esc(d.project.world)}</h2><p>Cinq États, ${esc(d.world.total)} sur ${esc(d.world.area)}. Chaque État adapte sa société aux manifestations surnaturelles à sa manière.</p></article>
<article class="story-block reveal"><small>L'ÉVÉNEMENT FONDATEUR</small><h2>${esc(d.project.event)}</h2><p>L'Éveil marque le début d'une ère où le surnaturel apparaît sans faire s'effondrer le monde contemporain.</p></article>
<article class="story-block reveal"><small>REPÈRE DE CONTINUITÉ</small><h2>L'Écho</h2><p>${esc(d.project.notes)}</p></article>
${TODO("Récit d'introduction complet : l'histoire racontée du début, à rédiger ou à fournir. Aucun texte n'est inventé en attendant.")}
<div class="next-row reveal"><a class="btn" href="/beyond/sagas">Découvrir les sagas ${arrow}</a><a class="link" href="/beyond/personnages">Rencontrer les personnages ${arrow}</a></div>
</div></section>`;
    return layout({ title: "Histoire — PROJECT: BEYOND", description: "Introduction à l'univers de PROJECT: BEYOND.", section: "beyond", path: "/beyond/histoire", body });
  },

  sagas(d) {
    const cards = d.sagas.map((s, i) => `<a class="saga reveal d${(i % 3) + 1} tilt" href="/beyond/sagas/${s.n}"><span class="roman">${romans[s.n]}</span><small>${esc(s.range.toUpperCase())}</small><h3>${esc(s.name.replace(/^Saga [IVX]+\s*—\s*/, ""))}</h3><p>${s.arcs.length} arcs · consulter la saga</p><b>Ouvrir ${arrow}</b></a>`).join("");
    const body = `${pageHead("RÉCIT", 'Les sagas<span class="dot">.</span>', `Architecture de référence : ${d.sagas.length} sagas et ${d.arcs.length} arcs. Chaque saga a sa propre page.`)}
<section class="section tight"><div class="wrap"><div class="sagas">${cards}</div>
<div class="notice reveal"><b>Note de cohérence.</b> Les données actuelles comptent ${d.sagas.length} sagas (I à ${romans[d.sagas.length]}). Si le découpage validé est de 5 sagas, la liste sera ajustée dès confirmation de l'auteur.</div></div></section>`;
    return layout({ title: "Les sagas — PROJECT: BEYOND", description: "Les sagas de PROJECT: BEYOND.", section: "beyond", path: "/beyond/sagas", body });
  },

  saga(d, n) {
    const s = d.sagas.find((x) => x.n === n);
    if (!s) return null;
    const prev = d.sagas.find((x) => x.n === n - 1), next = d.sagas.find((x) => x.n === n + 1);
    const arcs = s.arcs.map((a, i) => `<article class="arc reveal d${(i % 3) + 1}" id="arc-${a.n}"><span class="arc-n">${String(a.n).padStart(2, "0")}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p></div></article>`).join("");
    const body = `${pageHead(`SAGA ${romans[s.n]} · ${s.range.toUpperCase()}`, esc(s.name.replace(/^Saga [IVX]+\s*—\s*/, "")), `${s.arcs.length} arcs dans cette partie du récit.`)}
<section class="section tight"><div class="wrap narrow"><div class="arcs">${arcs}</div>
<div class="pager reveal">${prev ? `<a href="/beyond/sagas/${prev.n}">← Saga ${romans[prev.n]}</a>` : "<span></span>"}<a href="/beyond/sagas">Toutes les sagas</a>${next ? `<a href="/beyond/sagas/${next.n}">Saga ${romans[next.n]} →</a>` : "<span></span>"}</div></div></section>`;
    return layout({ title: `${s.name} — PROJECT: BEYOND`, description: `${s.name} : ${s.arcs.length} arcs.`, section: "beyond", path: `/beyond/sagas/${s.n}`, body });
  },

  personnages(d) {
    const main = d.main.map((c, i) => `<a class="char reveal d${(i % 3) + 1} tilt" href="/beyond/personnages/${c.slug}">${portrait(c)}<div class="char-body"><small>${esc(c.role.toUpperCase())}</small><h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p><b>Consulter la fiche ${arrow}</b></div></a>`).join("");
    const sec = d.secondary.map((c, i) => `<a class="char small reveal d${(i % 4) + 1}" href="/beyond/personnages/${c.slug}">${portrait(c, "sm")}<div class="char-body"><small>SECONDAIRE</small><h3>${esc(c.name)}</h3><p>${esc(c.role)}</p></div></a>`).join("");
    const body = `${pageHead("PERSONNAGES", 'Ceux qui avancent<span class="dot">.</span>', `${d.main.length} personnages principaux. Les portraits sont intégrés au fur et à mesure que les images originales sont fournies.`)}
<section class="section tight"><div class="wrap"><div class="chars">${main}</div>
<h2 class="h3 reveal">Entourage et personnages secondaires</h2><div class="chars dense">${sec}</div></div></section>`;
    return layout({ title: "Personnages — PROJECT: BEYOND", description: "Les personnages de PROJECT: BEYOND.", section: "beyond", path: "/beyond/personnages", body });
  },

  personnage(d, slug) {
    const c = d.people.find((p) => p.slug === slug);
    if (!c) return null;
    const idx = d.main.findIndex((p) => p.slug === slug);
    const fam = d.families.find((f) => f.members.some((m) => m.person && m.person.slug === slug));
    const detail = c.kind === "main"
      ? `<dl class="dl"><div><dt>Âge</dt><dd>${esc(c.age)}</dd></div><div><dt>Origine</dt><dd>${esc(c.origin)}</dd></div><div><dt>Statut</dt><dd>${esc(c.status)}</dd></div></dl>
<h2 class="h3">Personnalité et trajectoire</h2><p>${esc(c.summary)}</p>
<h2 class="h3">Capacité</h2><p><b>${esc(c.ability)}</b><br>${esc(c.abilitySummary)}</p>
<h2 class="h3">Relations</h2><p>${esc(c.relations)}</p>`
      : `<dl class="dl"><div><dt>Rôle connu</dt><dd>${esc(c.role)}</dd></div></dl><h2 class="h3">Repère documentaire</h2><p>${esc(c.note)}</p><div class="notice">Fiche partielle : les informations non établies ne sont pas complétées artificiellement.</div>`;
    const prev = idx > 0 ? d.main[idx - 1] : null, next = idx >= 0 && idx < d.main.length - 1 ? d.main[idx + 1] : null;
    const body = `<section class="section"><div class="wrap profile"><div class="profile-img reveal">${portrait(c, "lg")}</div>
<div class="profile-body"><div class="kicker reveal">${c.kind === "main" ? esc(c.role.toUpperCase()) : "PERSONNAGE SECONDAIRE"}</div><h1 class="reveal d1">${esc(c.name)}</h1><div class="reveal d2">${detail}${fam ? `<p><a class="link" href="/beyond/familles#${fam.slug}">${esc(fam.name)} ${arrow}</a></p>` : ""}</div>
<div class="pager">${prev ? `<a href="/beyond/personnages/${prev.slug}">← ${esc(prev.name)}</a>` : "<span></span>"}<a href="/beyond/personnages">Tous les personnages</a>${next ? `<a href="/beyond/personnages/${next.slug}">${esc(next.name)} →</a>` : "<span></span>"}</div></div></div></section>`;
    return layout({ title: `${c.name} — PROJECT: BEYOND`, description: c.summary || c.role, section: "beyond", path: `/beyond/personnages/${slug}`, body });
  },

  familles(d) {
    const cards = d.families.map((f, i) => `<article class="family reveal d${(i % 2) + 1}" id="${esc(f.slug)}">
${f.photo ? `<div class="family-photo"><img src="${esc(f.photo)}" alt="Photo de la ${esc(f.name)}" loading="lazy" decoding="async"></div>` : `<div class="family-photo empty" role="img" aria-label="Photo de famille à intégrer"><small>FAMILLE · 0${i + 1}</small><b>${esc(f.name.replace(/^Famille\s+/i, ""))}</b><span>Photo de famille à intégrer</span></div>`}
<div class="family-body"><small>${esc(f.place.toUpperCase())}</small><h3>${esc(f.name)}</h3><p>${esc(f.summary)}</p>
<ul>${f.members.map((m) => `<li>${m.person ? `<a href="/beyond/personnages/${m.person.slug}">${esc(m.label)}</a>` : esc(m.label)}</li>`).join("")}</ul></div></article>`).join("");
    const body = `${pageHead("FAMILLES", 'Les familles de Néréth<span class="dot">.</span>', "Répertoire des familles identifiées. Les liens non confirmés restent à préciser ; les photos sont ajoutées dès qu'elles sont fournies.")}
<section class="section tight"><div class="wrap"><div class="families">${cards}</div>
<div class="notice reveal"><b>Règle documentaire.</b> Aucune image générique ne remplace les illustrations officielles.</div></div></section>`;
    return layout({ title: "Familles — PROJECT: BEYOND", description: "Les familles de Néréth.", section: "beyond", path: "/beyond/familles", body });
  },

  nereth(d, maps) {
    const states = d.states.map((s, i) => `<article class="state reveal d${(i % 3) + 1}" id="${esc(s.slug)}"><small>ÉTAT DE NÉRÉTH</small><h3>${esc(s.name)}</h3><p>${esc(s.identity)}</p>
<dl class="dl"><div><dt>Capitale</dt><dd>${esc(s.capital)}</dd></div><div><dt>Population</dt><dd>${esc(s.population)}</dd></div><div><dt>Centres</dt><dd>${esc(s.centres)}</dd></div><div><dt>Régions</dt><dd>${esc(s.regions)}</dd></div></dl><p class="muted">${esc(s.note)}</p></article>`).join("");
    const tabs = maps.map((m, i) => `<button type="button" class="map-tab${i === 0 ? " on" : ""}" data-map="${i}">${esc(m.title)}</button>`).join("");
    const figs = maps.map((m, i) => `<figure class="map-fig${i === 0 ? " on" : ""}" data-map-fig="${i}"><div class="map-stage"><img src="${esc(m.src)}" alt="${esc(m.title)}" loading="${i === 0 ? "eager" : "lazy"}" decoding="async"></div><figcaption>${esc(m.caption)}</figcaption></figure>`).join("");
    const body = `${pageHead("NÉRÉTH", 'Le monde<span class="dot">.</span>', `Néréth compte ${esc(d.world.total)} sur ${esc(d.world.area)} ; échelle : ${esc(d.world.scale)}.`)}
<section class="section tight"><div class="wrap">
${maps.length ? `<div class="map reveal" id="map"><div class="map-tabs" role="tablist">${tabs}</div>${figs}<div class="map-tools"><button type="button" id="map-zoom">Agrandir</button></div></div>` : TODO("Carte de Néréth : déposer la carte dans le dossier assets (carte-nereth.webp).")}
<div class="kicker reveal">LES CINQ ÉTATS</div><div class="states">${states}</div>
<section class="countries reveal"><div class="kicker">HISTOIRE ET FONCTIONNEMENT DE CHAQUE PAYS</div>
${TODO("Histoire et fonctionnement de chaque pays (Vérénia, Drakor, Eldoria, Nocterre, Solméra) : contenu non finalisé, à fournir par l'auteur. Rien n'est inventé en attendant.")}</section>
</div></section>`;
    return layout({ title: "Néréth — PROJECT: BEYOND", description: "La carte et les États de Néréth.", section: "beyond", path: "/beyond/nereth", body });
  },

  chronologie(d) {
    const rail = d.sagas.map((s) => `<section class="chrono-saga"><header class="chrono-head reveal"><span>${esc(s.range.toUpperCase())}</span><h2><a href="/beyond/sagas/${s.n}">${esc(s.name)}</a></h2></header>
${s.arcs.map((a, i) => `<article class="chrono-arc reveal d${(i % 3) + 1}"><i class="dot-mark" aria-hidden="true"></i><span class="arc-n">${String(a.n).padStart(2, "0")}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p></div></article>`).join("")}</section>`).join("");
    const body = `${pageHead("CHRONOLOGIE", `Les ${d.arcs.length} arcs<span class="dot">.</span>`, "Repère mondial : l'Éveil apparaît en année 0. Les dates précises de chaque arc restent liées à la chronologie consolidée.")}
<section class="section tight"><div class="wrap narrow"><div class="chrono" id="chrono"><i class="chrono-line" aria-hidden="true"></i>${rail}</div></div></section>`;
    return layout({ title: "Chronologie — PROJECT: BEYOND", description: "Les arcs de PROJECT: BEYOND dans l'ordre.", section: "beyond", path: "/beyond/chronologie", body });
  },

  continuite(d) {
    const body = `${pageHead("CONTINUITÉ", 'Les règles<span class="dot">.</span>', "La bibliothèque distingue le canon, le cadre de travail, la proposition et la donnée à préciser.")}
<section class="section tight"><div class="wrap narrow"><ol class="rules">${d.principles.map((p, i) => `<li class="reveal d${(i % 3) + 1}"><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(p)}</p></li>`).join("")}</ol>
<div class="notice reveal">Références de cette édition : Dossier maître V4.0 (issu de la Consolidation V3.0).</div></div></section>`;
    return layout({ title: "Continuité — PROJECT: BEYOND", description: "Règles de continuité de PROJECT: BEYOND.", section: "beyond", path: "/beyond/continuite", body });
  },

  bibliotheque() {
    const c = [["▧", "Galerie visuelle", "Illustrations de référence et designs validés.", "NON FINALISÉE", "/galerie"], ["▤", "Documents", "Dossiers d'univers, continuité, fiches.", "RÉFÉRENCES STRUCTURÉES", null], ["▣", "Chapitres", "Accès aux chapitres une fois les pages publiées.", "AUCUN CHAPITRE PUBLIÉ", null], ["◷", "Chronologies", "Repères temporels et arcs narratifs.", "CONSULTER", "/beyond/chronologie"]]
      .map(([i, t, p, s, h], k) => { const inner = `<span class="lib-icon">${i}</span><h3>${t}</h3><p>${p}</p><small>${s}</small>`; return h ? `<a class="lib reveal d${k + 1} tilt" href="${h}">${inner}</a>` : `<div class="lib reveal d${k + 1}">${inner}</div>`; }).join("");
    const body = `${pageHead("RESSOURCES", 'La bibliothèque<span class="dot">.</span>', "Les ressources de travail sont organisées par catégorie, et complétées au fil des validations.")}<section class="section tight"><div class="wrap"><div class="libs">${c}</div></div></section>`;
    return layout({ title: "Bibliothèque — neV.MANGA", description: "Ressources du studio neV.MANGA.", section: "bibliotheque", path: "/bibliotheque", body });
  },

  galerie() {
    const body = `${pageHead("GALERIE", 'La galerie<span class="dot">.</span>', "Cet espace n'est pas encore finalisé.")}<section class="section tight"><div class="wrap narrow">${TODO("Galerie : contenu en cours de définition avec l'auteur. Rien n'est affiché tant qu'il n'est pas validé.")}<p class="reveal"><a class="link" href="/bibliotheque">← Retour à la bibliothèque</a></p></div></section>`;
    return layout({ title: "Galerie — neV.MANGA", description: "Galerie neV.MANGA (non finalisée).", section: "bibliotheque", path: "/galerie", body });
  },

  studio() {
    const body = `${pageHead("ESPACE DE TRAVAIL LOCAL", 'Studio<span class="dot">.</span>', "Zone de préparation locale pour rédiger et conserver des notes de travail sur cet appareil.")}
<section class="section tight"><div class="wrap narrow"><div class="notice reveal">Cet espace n'est pas un compte administrateur sécurisé. Les brouillons restent dans le navigateur utilisé et ne sont ni publiés ni partagés avec d'autres appareils.</div>
<form id="draft-form" class="draft-form reveal"><label for="draft-title">Titre du brouillon</label><input id="draft-title" required maxlength="100" placeholder="Ex. Fiche de personnage — …"><label for="draft-category">Catégorie</label><select id="draft-category"><option>Personnage</option><option>Univers</option><option>Scénario</option><option>Illustration</option><option>Note de production</option></select><label for="draft-body">Contenu</label><textarea id="draft-body" rows="6" required maxlength="5000" placeholder="Écris ici une note de travail…"></textarea><button class="btn" type="submit">Enregistrer le brouillon +</button></form>
<div class="draft-head"><h2 class="h3">Mes brouillons</h2><button id="clear-drafts" class="subtle" type="button">Tout effacer</button></div><div id="draft-list" class="draft-list"></div></div></section>`;
    return layout({ title: "Studio — neV.MANGA", description: "Espace de travail local neV.MANGA.", section: "studio", path: "/studio", body });
  },

  notFound() {
    const body = `<section class="nf"><div><div class="kicker">ERREUR</div><h1>404</h1><p>Cette page n'existe pas ou n'est plus disponible.</p><a class="btn" href="/">Retour à l'accueil ${arrow}</a></div></section>`;
    return layout({ title: "Page introuvable — neV.MANGA", description: "Page introuvable.", section: "", path: "/404", body });
  },
};
