(() => {
  const DATA = window.NEV_MANGA_DATA;
  if (!DATA) return;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const initials = name => name.split(/\s+/).map(x => x[0]).slice(0,2).join("").toUpperCase();
  const worksGrid = $("#works-grid");
  const projectPanel = $("#project-panel");
  let activeTab = "overview";

  $("#year").textContent = new Date().getFullYear();
  const workCard = () => `<article class="work-card" data-status="development"><div class="work-art"><span>BEYOND</span></div><div class="work-card-body"><div class="work-card-meta"><span>UNIVERS N°001</span><span>EN DÉVELOPPEMENT</span></div><h3>PROJECT: BEYOND</h3><p>${escapeHTML(DATA.project.summary)}</p><div class="work-card-foot"><span>AVENTURE · FANTASTIQUE</span><a href="#beyond">Explorer ↗</a></div></div></article>`;
  function renderWorks() {
    const q = ($("#work-search").value || "").toLowerCase();
    const status = $("#work-filter").value;
    const visible = ("project beyond " + DATA.project.summary).toLowerCase().includes(q) && (status === "all" || status === "development");
    worksGrid.innerHTML = visible ? workCard() : '<div class="empty-state">Aucune œuvre ne correspond à cette recherche.</div>';
  }
  $("#work-search").addEventListener("input", renderWorks);
  $("#work-filter").addEventListener("change", renderWorks);
  renderWorks();

  $("#project-summary").textContent = DATA.project.summary;
  $("#project-facts").innerHTML = [
    ["MONDE", DATA.project.world],["ÉVÉNEMENT FONDATEUR",DATA.project.event],["STATUT",DATA.project.status],["FORMAT", "Manga en préparation"]
  ].map(([k,v]) => `<div class="fact"><small>${escapeHTML(k)}</small><b>${escapeHTML(v)}</b></div>`).join("");

  function renderTab(tab) {
    activeTab = tab;
    $$(".tab").forEach(b => { const on=b.dataset.tab===tab; b.classList.toggle("active",on); b.setAttribute("aria-selected",String(on)); });
    if (tab === "overview") {
      projectPanel.innerHTML = `<h3 class="panel-heading">Un monde transformé, pas effondré.</h3><p class="panel-intro">${escapeHTML(DATA.project.summary)} L’histoire se construit à travers plusieurs trajectoires autonomes, des enjeux institutionnels et des explorations.</p><div class="notice"><b>Repère de continuité.</b> ${escapeHTML(DATA.project.notes)}</div><div class="saga-grid">${DATA.sagas.map(s=>`<article class="saga-card"><span>ARCHITECTURE NARRATIVE</span><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.summary)}</p></article>`).join("")}</div><p class="panel-intro" style="margin-top:18px">Architecture de référence : six sagas et trente arcs. Les titres définitifs des sagas et des arcs seront affichés après validation du découpage.</p>`;
    } else if (tab === "characters") {
      projectPanel.innerHTML = `<h3 class="panel-heading">Personnages</h3><p class="panel-intro">Sept personnages principaux sont répertoriés dans la base de travail. Les portraits ne sont pas encore attachés à leurs fiches : les emplacements visuels restent volontairement neutres.</p><div class="character-grid">${DATA.characters.map((c,i)=>`<article class="character-card" role="button" tabindex="0" data-character="${i}"><div class="character-placeholder">${escapeHTML(initials(c.name))}</div><small>${escapeHTML(c.role.toUpperCase())}</small><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.summary)}</p><span class="view-detail">Consulter la fiche ↗</span></article>`).join("")}</div><h3 class="panel-heading" style="margin-top:40px">Personnages secondaires & entourage</h3><p class="panel-intro">Registre des autres personnages nommés dans les documents de travail. Leurs fiches détaillées et leurs visuels seront complétés après vérification de chaque information.</p><div class="character-grid">${(DATA.secondaryCharacters||[]).map((c,i)=>`<article class="character-card secondary-character" tabindex="0" data-secondary="${i}"><div class="character-placeholder">${escapeHTML(initials(c.name))}</div><small>PERSONNAGE SECONDAIRE</small><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.role)}</p><span class="view-detail">Voir les informations disponibles ↗</span></article>`).join("")}</div>`;
      $(".character-card[data-character]").forEach(card => {
        const open=()=>showCharacter(Number(card.dataset.character));
        card.addEventListener("click",open);
        card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
      });
      $(".secondary-character").forEach(card => {
        const open=()=>showSecondary(Number(card.dataset.secondary));
        card.addEventListener("click",open);
        card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
      });
    } else if (tab === "world") {
      projectPanel.innerHTML = `<h3 class="panel-heading">Les cinq États de Néréth</h3><p class="panel-intro">Aperçu territorial fondé sur le dossier de référence de l’univers. Les coordonnées, distances et populations ne sont pas fixées dans la documentation actuelle.</p><div class="state-grid">${DATA.states.map(s=>`<article class="state-card"><small>ÉTAT DE NÉRÉTH</small><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.identity)}</p><p class="state-data"><b>Capitale :</b> ${escapeHTML(s.capital)}<br><b>Centres :</b> ${escapeHTML(s.centres)}<br><b>Régions :</b> ${escapeHTML(s.regions)}</p><p>${escapeHTML(s.note)}</p></article>`).join("")}</div>`;
    } else if (tab === "timeline") {
      projectPanel.innerHTML = `<h3 class="panel-heading">Récit & chronologie</h3><p class="panel-intro">L’architecture de travail comprend six sagas et trente arcs de référence. Le détail des titres, des chapitres et des dates sera publié ici à partir des documents narratifs consolidés.</p><div class="notice">L’Éveil constitue le repère mondial de l’année 0. Le récit principal commence après plusieurs années d’adaptation des sociétés ; les repères précis de chaque arc doivent rester synchronisés avec la chronologie de référence.</div><div class="saga-grid">${DATA.sagas.map(s=>`<article class="saga-card"><span>ORDRE NARRATIF</span><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.summary)}</p></article>`).join("")}</div><div class="notice"><b>Lecture des chapitres.</b> Aucun chapitre finalisé n’est actuellement publié dans le portail. L’espace de lecture sera activé lorsque les pages validées seront intégrées.</div>`;
    } else {
      projectPanel.innerHTML = `<h3 class="panel-heading">Règles de continuité</h3><p class="panel-intro">La bibliothèque doit conserver la distinction entre canon, cadre de travail, proposition et donnée à préciser.</p><ul class="principle-list">${DATA.principles.map(p=>`<li>${escapeHTML(p)}</li>`).join("")}</ul><div class="notice">Références consultées pour cette première intégration : dossier UNIVERS V1.1 et dossier de consolidation V3.0. Le dossier V4.0 n’est pas disponible dans les fichiers accessibles à cette session ; ses éventuelles mises à jour devront être vérifiées avant intégration.</div>`;
    }
  }
  $$(".tab").forEach(b=>b.addEventListener("click",()=>renderTab(b.dataset.tab)));
  renderTab("overview");

  const detailOverlay=$("#detail-overlay"), detailContent=$("#detail-content");
  function showCharacter(i) {
    const c=DATA.characters[i]; if(!c)return;
    detailContent.innerHTML=`<div class="detail-meta">${escapeHTML(c.role.toUpperCase())} · ${escapeHTML(c.status.toUpperCase())}</div><h2>${escapeHTML(c.name)}</h2><p><b>Âge :</b> ${escapeHTML(c.age)}<br><b>Origine :</b> ${escapeHTML(c.origin)}</p><h3>Personnalité et trajectoire</h3><p>${escapeHTML(c.summary)}</p><h3>Capacité</h3><p><b>${escapeHTML(c.ability)}</b><br>${escapeHTML(c.abilitySummary)}</p><h3>Relations</h3><p>${escapeHTML(c.relations)}</p><div class="notice">Illustration : ${escapeHTML(c.visual)}. Aucun visuel définitif n’est substitué à une référence originale.</div>`;
    detailOverlay.hidden=false; $("#detail-close").focus();
  }
  function showSecondary(i) {
    const c=(DATA.secondaryCharacters||[])[i]; if(!c)return;
    detailContent.innerHTML=`<div class="detail-meta">PERSONNAGE SECONDAIRE</div><h2>${escapeHTML(c.name)}</h2><p><b>Rôle connu :</b> ${escapeHTML(c.role)}</p><h3>Repère documentaire</h3><p>${escapeHTML(c.note)}</p><div class="notice">Fiche partielle. Les informations non établies ne sont pas complétées artificiellement. Illustration : à intégrer après validation.</div>`;
    detailOverlay.hidden=false; $("#detail-close").focus();
  }
  function closeDetail(){detailOverlay.hidden=true;}
  $("#detail-close").addEventListener("click",closeDetail);
  detailOverlay.addEventListener("click",e=>{if(e.target===detailOverlay)closeDetail();});

  const menu=$("#menu-toggle"), nav=$("#main-nav");
  menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");}));
  const routes=["home","works","beyond","library","studio"];
  function markRoute(){const hash=location.hash.slice(1)||"home";$$(".desktop-nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===hash));}
  window.addEventListener("hashchange",markRoute);markRoute();

  const searchOverlay=$("#search-overlay"), globalSearch=$("#global-search"), results=$("#search-results");
  function openSearch(){searchOverlay.hidden=false;globalSearch.value="";results.innerHTML="<p>Commence à saisir pour rechercher dans le portail.</p>";globalSearch.focus();}
  function closeSearch(){searchOverlay.hidden=true;}
  $("#search-open").addEventListener("click",openSearch);$("#search-close").addEventListener("click",closeSearch);
  searchOverlay.addEventListener("click",e=>{if(e.target===searchOverlay)closeSearch();});
  globalSearch.addEventListener("input",()=>{
    const q=globalSearch.value.trim().toLowerCase(); if(!q){results.innerHTML="<p>Commence à saisir pour rechercher dans le portail.</p>";return;}
    const hits=[];
    if(("project beyond "+DATA.project.summary).toLowerCase().includes(q))hits.push(["PROJECT: BEYOND","Univers n°001","#beyond"]);
    DATA.characters.forEach((c,i)=>{if((c.name+" "+c.summary+" "+c.ability).toLowerCase().includes(q))hits.push([c.name,"Personnage","#beyond",i]);});
    DATA.states.forEach(s=>{if((s.name+" "+s.identity+" "+s.capital).toLowerCase().includes(q))hits.push([s.name,"État de Néréth","#beyond"]);});
    (DATA.secondaryCharacters||[]).forEach((c,i)=>{if((c.name+" "+c.role+" "+c.note).toLowerCase().includes(q))hits.push([c.name,"Personnage secondaire","#beyond", "s"+i]);});
    results.innerHTML=hits.length?hits.map(h=>`<a class="search-result" href="${h[2]}" data-hit="${h[3]??""}"><b>${escapeHTML(h[0])}</b><span> — ${escapeHTML(h[1])}</span></a>`).join(""):"<p>Aucun résultat.</p>";
    $$(".search-result",results).forEach(a=>a.addEventListener("click",()=>{closeSearch();if(a.dataset.hit!==""){renderTab("characters");setTimeout(()=>{const value=a.dataset.hit;if(value.startsWith("s"))showSecondary(Number(value.slice(1)));else showCharacter(Number(value));},0);}else renderTab("overview");}));
  });

  const STORAGE_KEY="nev-manga-local-drafts-v1";
  function getDrafts(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return [];}}
  function saveDrafts(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));return true;}catch{return false;}}
  function renderDrafts(){
    const list=$("#draft-list"),drafts=getDrafts();
    list.innerHTML=drafts.length?drafts.map((d,i)=>`<article class="draft-item"><div class="draft-item-head"><div><h4>${escapeHTML(d.title)}</h4><small>${escapeHTML(d.category)} · ${new Date(d.created).toLocaleString("fr-FR")}</small></div><button type="button" data-delete-draft="${i}">Supprimer</button></div><p>${escapeHTML(d.body)}</p></article>`).join(""):'<p class="panel-intro">Aucun brouillon enregistré sur cet appareil.</p>';
    $$("[data-delete-draft]",list).forEach(b=>b.addEventListener("click",()=>{const d=getDrafts();d.splice(Number(b.dataset.deleteDraft),1);saveDrafts(d);renderDrafts();}));
  }
  $("#draft-form").addEventListener("submit",e=>{
    e.preventDefault();
    const drafts=getDrafts();drafts.unshift({title:$("#draft-title").value.trim(),category:$("#draft-category").value,body:$("#draft-body").value.trim(),created:new Date().toISOString()});
    if(!saveDrafts(drafts)){alert("Le navigateur ne permet pas d’enregistrer ce brouillon.");return;}
    e.target.reset();renderDrafts();
  });
  $("#clear-drafts").addEventListener("click",()=>{if(confirm("Effacer tous les brouillons enregistrés sur cet appareil ?")){saveDrafts([]);renderDrafts();}});
  renderDrafts();
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeSearch();closeDetail();}});
})();