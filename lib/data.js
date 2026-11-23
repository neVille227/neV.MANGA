// Chargement et indexation des données éditoriales de PROJECT: BEYOND.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const slugify = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const IMAGE_EXT = [".webp", ".avif", ".jpg", ".jpeg", ".png"];
let cache = null;
let cachedAt = 0;

export async function loadData(root) {
  if (cache && Date.now() - cachedAt < 30_000) return cache;
  const raw = JSON.parse(await readFile(path.join(root, "data", "content.json"), "utf-8"));
  let files = new Set();
  try { files = new Set(await readdir(path.join(root, "assets"))); } catch { /* dossier absent */ }

  // Une image est trouvée par son champ `image` ou, à défaut, par le nom du personnage (ex. akira-sei.webp).
  const findImage = (...names) => {
    for (const n of names.filter(Boolean)) {
      for (const ext of IMAGE_EXT) if (files.has(n + ext)) return `/assets/${n}${ext}`;
    }
    return null;
  };

  const main = raw.characters.map((c) => ({ ...c, kind: "main", slug: slugify(c.name), img: findImage(c.image, slugify(c.name)) }));
  const secondary = raw.secondaryCharacters.map((c) => ({ ...c, kind: "secondary", slug: slugify(c.name), img: findImage(c.image, slugify(c.name)) }));
  const people = [...main, ...secondary];
  const byName = new Map(people.map((p) => [slugify(p.name), p]));
  const findPerson = (label) => {
    const base = slugify(label.split("—")[0].trim());
    if (byName.has(base)) return byName.get(base);
    return main.find((p) => slugify(p.name.split(" ")[0]) === base) || null; // « Darel — membre… » → Darel VOSSAN
  };

  const sagas = raw.sagas.map((s, i) => {
    const m = /(\d+)\D+(\d+)/.exec(s.range) || [];
    const from = Number(m[1]), to = Number(m[2]);
    return { ...s, n: i + 1, from, to, arcs: raw.arcs.filter((a) => a.n >= from && a.n <= to) };
  });

  const families = (raw.families || []).map((f) => {
    const slug = slugify(f.name.replace(/^Famille\s+/i, ""));
    return {
      ...f, slug,
      photo: findImage(f.photo, `famille-${slug}`, `famille-${slug}-photo`),
      members: f.members.map((label) => ({ label, person: findPerson(label) })),
    };
  });

  const states = raw.states.map((s) => ({ ...s, slug: slugify(s.name) }));
  cache = { ...raw, main, secondary, people, sagas, families, states, hasImage: (u) => Boolean(u) };
  cachedAt = Date.now();
  return cache;
}

export function search(data, q) {
  const needle = slugify(q).replace(/-/g, " ");
  if (needle.length < 2) return [];
  const norm = (s) => slugify(s).replace(/-/g, " ");
  const hits = [];
  for (const p of data.people) {
    if (norm(`${p.name} ${p.summary || ""} ${p.role || ""} ${p.ability || ""}`).includes(needle))
      hits.push({ title: p.name, kind: p.kind === "main" ? "Personnage" : "Personnage secondaire", url: `/beyond/personnages/${p.slug}` });
  }
  for (const s of data.states) if (norm(`${s.name} ${s.identity} ${s.capital} ${s.regions}`).includes(needle)) hits.push({ title: s.name, kind: "État de Néréth", url: `/beyond/nereth#${s.slug}` });
  for (const s of data.sagas) if (norm(s.name).includes(needle)) hits.push({ title: s.name, kind: "Saga", url: `/beyond/sagas/${s.n}` });
  for (const a of data.arcs) if (norm(`${a.title} ${a.desc}`).includes(needle)) {
    const saga = data.sagas.find((s) => a.n >= s.from && a.n <= s.to);
    hits.push({ title: `Arc ${a.n} — ${a.title}`, kind: "Arc narratif", url: `/beyond/sagas/${saga ? saga.n : 1}#arc-${a.n}` });
  }
  for (const f of data.families) if (norm(f.name).includes(needle)) hits.push({ title: f.name, kind: "Famille", url: `/beyond/familles#${f.slug}` });
  return hits.slice(0, 25);
}
