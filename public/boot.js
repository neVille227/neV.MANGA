// Exécuté avant l'affichage : prépare les animations (sans JavaScript, le site reste lisible).
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  try {
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm && location.pathname === "/" && !sessionStorage.getItem("nevIntro")) d.classList.add("intro-on");
  } catch (e) { /* stockage indisponible */ }
})();
