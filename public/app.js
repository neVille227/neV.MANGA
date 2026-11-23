(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  // ---- menu mobile ----
  const menu = $("#menu-toggle"), nav = $("#main-nav");
  menu?.addEventListener("click", () => { const open = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); });

  // ---- intro animée (accueil, une fois par session) ----
  const intro = $("#intro");
  const root = document.documentElement;
  function endIntro() {
    if (!intro || !root.classList.contains("intro-on")) return;
    intro.classList.add("done");
    setTimeout(() => root.classList.remove("intro-on"), 700);
    try { sessionStorage.setItem("nevIntro", "1"); } catch { /* ignoré */ }
  }
  if (intro && root.classList.contains("intro-on")) {
    $("#intro-skip")?.addEventListener("click", endIntro);
    intro.addEventListener("click", endIntro);
    setTimeout(endIntro, 3600);
  }

  // ---- apparition au défilement ----
  const reveals = $$(".reveal");
  if (calm || !("IntersectionObserver" in window)) reveals.forEach((el) => el.classList.add("in"));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  // ---- compteurs ----
  $$("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count); if (calm || !end) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }); io.observe(el);
  });

  // ---- parallaxe légère + en-tête ----
  const header = $("#header");
  const par = $$("[data-parallax]");
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header?.classList.toggle("scrolled", y > 8);
      if (!calm) par.forEach((el) => { el.style.transform = `translate3d(0, ${Math.round(y * Number(el.dataset.parallax))}px, 0)`; });
      const line = $(".chrono-line"), chrono = $("#chrono");
      if (line && chrono) { const r = chrono.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height)); line.style.transform = `scaleY(${p})`; }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---- inclinaison des cartes (souris uniquement) ----
  if (!calm && matchMedia("(hover:hover)").matches) {
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-3px)`; });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  // ---- transition de page ----
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || calm || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault(); document.body.classList.add("leaving");
    setTimeout(() => { location.href = u.href; }, 220);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("leaving"); });

  // ---- carte de Néréth ----
  $$(".map-tab").forEach((b) => b.addEventListener("click", () => {
    $$(".map-tab").forEach((x) => x.classList.toggle("on", x === b));
    $$(".map-fig").forEach((f) => f.classList.toggle("on", f.dataset.mapFig === b.dataset.map));
  }));
  $("#map-zoom")?.addEventListener("click", (e) => { const m = $("#map"); const on = m.classList.toggle("zoom"); e.target.textContent = on ? "Réduire" : "Agrandir"; });

  // ---- recherche (API serveur) ----
  const box = $("#search"), input = $("#search-input"), out = $("#search-results");
  let timer;
  const openSearch = () => { box.hidden = false; input.value = ""; out.innerHTML = "<p>Commence à saisir pour rechercher.</p>"; input.focus(); };
  const closeSearch = () => { box.hidden = true; };
  $("#search-open")?.addEventListener("click", openSearch);
  $("#search-close")?.addEventListener("click", closeSearch);
  box?.addEventListener("click", (e) => { if (e.target === box) closeSearch(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); } });
  input?.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { out.innerHTML = "<p>Commence à saisir pour rechercher.</p>"; return; }
    timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`); const j = await r.json();
        out.innerHTML = j.results?.length ? j.results.map((h) => `<a class="hit" href="${esc(h.url)}"><b>${esc(h.title)}</b><span>${esc(h.kind)}</span></a>`).join("") : "<p>Aucun résultat.</p>";
      } catch { out.innerHTML = "<p>Recherche indisponible.</p>"; }
    }, 180);
  });

  // ---- brouillons locaux (Studio) ----
  const form = $("#draft-form");
  if (form) {
    const KEY = "nev-manga-local-drafts-v1";
    const get = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
    const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch { return false; } };
    const list = $("#draft-list");
    const draw = () => {
      const drafts = get();
      list.innerHTML = drafts.length ? drafts.map((d, i) => `<article class="draft"><div><h3>${esc(d.title)}</h3><small>${esc(d.category)} · ${esc(new Date(d.created).toLocaleString("fr-FR"))}</small></div><p>${esc(d.body)}</p><button type="button" data-del="${i}">Supprimer</button></article>`).join("") : '<p class="muted">Aucun brouillon enregistré sur cet appareil.</p>';
      $$("[data-del]", list).forEach((b) => b.addEventListener("click", () => { const d = get(); d.splice(Number(b.dataset.del), 1); save(d); draw(); }));
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = get(); d.unshift({ title: $("#draft-title").value.trim(), category: $("#draft-category").value, body: $("#draft-body").value.trim(), created: new Date().toISOString() });
      if (!save(d)) { alert("Le navigateur ne permet pas d'enregistrer ce brouillon."); return; }
      form.reset(); draw();
    });
    $("#clear-drafts")?.addEventListener("click", () => { if (confirm("Effacer tous les brouillons enregistrés sur cet appareil ?")) { save([]); draw(); } });
    draw();
  }
})();
