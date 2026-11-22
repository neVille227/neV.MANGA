// Serveur neV.MANGA — application Node sans dépendance externe.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;

const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/manifest.webmanifest": ["manifest.webmanifest", "application/manifest+json; charset=utf-8"],
};

async function loadContent() {
  return JSON.parse(await readFile(path.join(root, "data", "content.json"), "utf-8"));
}

function baseUrl(request) {
  const host = request.headers["x-forwarded-host"] || request.headers.host || "localhost";
  const proto = request.headers["x-forwarded-proto"] || "http";
  return `${proto.split(",")[0]}://${host.split(",")[0]}`;
}

function send(response, status, type, body, cache = "no-cache") {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const method = request.method || "GET";
  const { pathname } = new URL(request.url || "/", "http://localhost");

  if (method !== "GET" && method !== "HEAD") {
    send(response, 405, "application/json", JSON.stringify({ error: "METHOD_NOT_ALLOWED" }));
    return;
  }

  try {
    if (pathname === "/api/health") {
      send(response, 200, "application/json", JSON.stringify({ status: "ok", service: "neV.MANGA" }));
      return;
    }
    if (pathname === "/api/content") {
      send(response, 200, "application/json; charset=utf-8", JSON.stringify(await loadContent()));
      return;
    }
    // Les données éditoriales sont servies dynamiquement au format attendu par l'interface.
    if (pathname === "/content.js") {
      const data = await loadContent();
      send(response, 200, "text/javascript; charset=utf-8", `window.NEV_MANGA_DATA = ${JSON.stringify(data)};`);
      return;
    }
    if (pathname === "/robots.txt") {
      send(response, 200, "text/plain; charset=utf-8", `User-agent: *\nAllow: /\nSitemap: ${baseUrl(request)}/sitemap.xml\n`);
      return;
    }
    if (pathname === "/sitemap.xml") {
      send(response, 200, "application/xml; charset=utf-8",
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${baseUrl(request)}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`);
      return;
    }
    const entry = files[pathname];
    if (entry) {
      const body = await readFile(path.join(root, entry[0]));
      send(response, 200, entry[1], request.method === "HEAD" ? undefined : body, entry[0] === "index.html" ? "no-cache" : "public, max-age=3600");
      return;
    }
    const notFound = await readFile(path.join(root, "404.html"));
    send(response, 404, "text/html; charset=utf-8", request.method === "HEAD" ? undefined : notFound);
  } catch (error) {
    console.error("neV.MANGA server error:", error?.name || "Error");
    send(response, 500, "application/json", JSON.stringify({ error: "SERVER_ERROR" }));
  }
});

server.listen(port, "0.0.0.0", () => console.log(`neV.MANGA server listening on port ${port}`));
