// Serveur neV.MANGA — application Node dynamique, sans dépendance externe.
// Les pages sont rendues côté serveur à partir de data/content.json.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData, search } from "./lib/data.js";
import { pages } from "./lib/pages.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;
const assetsDir = path.join(root, "assets");

const clientFiles = {
  "/styles.css": ["public/styles.css", "text/css; charset=utf-8"],
  "/app.js": ["public/app.js", "text/javascript; charset=utf-8"],
  "/boot.js": ["public/boot.js", "text/javascript; charset=utf-8"],
  "/manifest.webmanifest": ["manifest.webmanifest", "application/manifest+json; charset=utf-8"],
};
const assetTypes = { ".webp": "image/webp", ".avif": "image/avif", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'self'",
  "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'",
].join("; ");

// ---- limitation de débit en mémoire (par IP) ----
const buckets = new Map();
function limited(ip, key, max) {
  const now = Date.now(), id = `${key}:${ip}`;
  const b = buckets.get(id);
  if (!b || now - b.start > 60_000) { buckets.set(id, { start: now, n: 1 }); return false; }
  b.n += 1;
  return b.n > max;
}
setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (now - b.start > 60_000) buckets.delete(k); }, 60_000).unref();

const clientIp = (req) => String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "?").split(",")[0].trim();
const origin = (req) => `${String(req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${String(req.headers["x-forwarded-host"] || req.headers.host || "localhost").split(",")[0]}`;

function send(req, res, status, type, body, cache = "no-cache") {
  const headers = {
    "Content-Type": type,
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": CSP,
  };
  if (String(req.headers["x-forwarded-proto"] || "").split(",")[0] === "https") headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  res.writeHead(status, headers);
  res.end(req.method === "HEAD" ? undefined : body);
}
const html = (req, res, status, body) => send(req, res, status, "text/html; charset=utf-8", body);
const json = (req, res, status, value) => send(req, res, status, "application/json; charset=utf-8", JSON.stringify(value));

async function mapsFor(data) {
  const wanted = ["carte-nereth", "carte-nereth-axes", "capitales-nereth"];
  const archive = data.galleryArchive || [];
  const out = [];
  for (const src of wanted) {
    const item = archive.find((g) => g.src === src);
    try { await readFile(path.join(assetsDir, `${src}.webp`)); } catch { continue; }
    out.push({ src: `/assets/${src}.webp`, title: item?.title || src, caption: item?.caption || "" });
  }
  return out;
}

const routes = new Map([
  ["/", (d) => pages.home(d)],
  ["/oeuvres", (d, q) => pages.oeuvres(d, q)],
  ["/beyond", (d) => pages.beyond(d)],
  ["/beyond/histoire", (d) => pages.histoire(d)],
  ["/beyond/sagas", (d) => pages.sagas(d)],
  ["/beyond/personnages", (d) => pages.personnages(d)],
  ["/beyond/familles", (d) => pages.familles(d)],
  ["/beyond/chronologie", (d) => pages.chronologie(d)],
  ["/beyond/continuite", (d) => pages.continuite(d)],
  ["/bibliotheque", () => pages.bibliotheque()],
  ["/galerie", () => pages.galerie()],
  ["/studio", () => pages.studio()],
]);

function allPaths(d) {
  return [...routes.keys(), "/beyond/nereth",
    ...d.sagas.map((s) => `/beyond/sagas/${s.n}`),
    ...d.people.map((p) => `/beyond/personnages/${p.slug}`)];
}

const server = createServer(async (req, res) => {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "HEAD") return json(req, res, 405, { error: "METHOD_NOT_ALLOWED" });
  if ((req.url || "").length > 2000) return json(req, res, 414, { error: "URI_TOO_LONG" });
  const url = new URL(req.url || "/", "http://localhost");
  let pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const ip = clientIp(req);

  try {
    if (pathname === "/api/health") return json(req, res, 200, { status: "ok", service: "neV.MANGA" });
    if (limited(ip, "all", 240)) { res.setHeader?.("Retry-After", "60"); return json(req, res, 429, { error: "TOO_MANY_REQUESTS" }); }

    if (clientFiles[pathname]) {
      const [file, type] = clientFiles[pathname];
      return send(req, res, 200, type, await readFile(path.join(root, file)), "public, max-age=300");
    }
    if (pathname.startsWith("/assets/")) {
      let name = "";
      try { name = decodeURIComponent(pathname.slice(8)); } catch { /* nom invalide */ }
      const type = assetTypes[path.extname(name).toLowerCase()];
      const full = path.join(assetsDir, name);
      if (type && !name.includes("..") && !name.includes("/") && full.startsWith(assetsDir + path.sep)) {
        try { return send(req, res, 200, type, await readFile(full), "public, max-age=86400"); } catch { /* absent */ }
      }
      return html(req, res, 404, pages.notFound(await loadData(root)));
    }

    if (pathname === "/robots.txt") return send(req, res, 200, "text/plain; charset=utf-8", `User-agent: *\nAllow: /\nSitemap: ${origin(req)}/sitemap.xml\n`);

    const data = await loadData(root);
    if (pathname === "/api/content") return json(req, res, 200, { project: data.project, characters: data.characters, secondaryCharacters: data.secondaryCharacters, states: data.states, sagas: data.sagas, arcs: data.arcs, families: data.families.map(({ photo, members, ...f }) => ({ ...f, members: members.map((m) => m.label) })), principles: data.principles, world: data.world });
    if (pathname === "/api/search") {
      if (limited(ip, "search", 60)) return json(req, res, 429, { error: "TOO_MANY_REQUESTS" });
      return json(req, res, 200, { results: search(data, (url.searchParams.get("q") || "").slice(0, 60)) });
    }
    if (pathname === "/sitemap.xml") {
      const o = origin(req);
      return send(req, res, 200, "application/xml; charset=utf-8", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allPaths(data).map((p) => `  <url><loc>${o}${p === "/" ? "/" : p}</loc></url>`).join("\n")}\n</urlset>\n`);
    }

    if (pathname === "/beyond/nereth") return html(req, res, 200, pages.nereth(data, await mapsFor(data)));
    const route = routes.get(pathname);
    if (route) return html(req, res, 200, route(data, url.searchParams));
    let m = /^\/beyond\/sagas\/(\d{1,2})$/.exec(pathname);
    if (m) { const page = pages.saga(data, Number(m[1])); if (page) return html(req, res, 200, page); }
    m = /^\/beyond\/personnages\/([a-z0-9-]{1,80})$/.exec(pathname);
    if (m) { const page = pages.personnage(data, m[1]); if (page) return html(req, res, 200, page); }
    return html(req, res, 404, pages.notFound(data));
  } catch (error) {
    console.error("neV.MANGA server error:", error?.name || "Error", error?.message || "");
    return json(req, res, 500, { error: "SERVER_ERROR" });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`neV.MANGA server listening on port ${port}`));
