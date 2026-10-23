// Shared helpers for talking to the MangaDex API (the database the MangaDesk reader is built on).

const API = "https://api.mangadex.org";
const COVER_BASE = "https://uploads.mangadex.org/covers";

export const CONTENT_RATINGS = ["safe", "suggestive"];

export const COUNTRIES = {
  JP: ["ja"],
  KR: ["ko"],
  CN: ["zh", "zh-hk"],
};

export async function mdFetch(path, params = {}) {
  const url = new URL(API + path);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) url.searchParams.append(key, String(item));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "MangaDesk/1.0 (https://mangadesk.base44.app)",
    },
    signal: AbortSignal.timeout(9000),
  });

  if (res.status === 429) throw new Error("Manga database is rate limiting, try again shortly");
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Manga database error ${res.status} for ${path} — ${detail.slice(0, 300)}`);
  }

  return res.json();
}

export function pickText(obj) {
  if (!obj || typeof obj !== "object") return "";
  for (const key of ["en", "ja-ro", "ja", "ko", "zh", "zh-hk"]) {
    if (obj[key]) return obj[key];
  }
  const first = Object.values(obj).find((v) => typeof v === "string");
  return first || "";
}

export function cleanDescription(text) {
  return (text || "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 900);
}

export function countryOf(language) {
  if (language === "ja") return "JP";
  if (language === "ko") return "KR";
  if (language === "zh" || language === "zh-hk") return "CN";
  return (language || "").toUpperCase() || "??";
}

export function coverUrl(manga, size) {
  const rel = (manga.relationships || []).find((r) => r.type === "cover_art");
  const file = rel?.attributes?.fileName;
  if (!file) return "";
  return `${COVER_BASE}/${manga.id}/${file}${size ? `.${size}.jpg` : ""}`;
}

export function normalizeManga(manga, size) {
  const a = manga.attributes || {};
  const altTitles = (a.altTitles || []).map((t) => pickText(t)).filter(Boolean);

  return {
    id: manga.id,
    title: pickText(a.title) || altTitles[0] || "Untitled",
    description: cleanDescription(pickText(a.description)),
    cover: coverUrl(manga, size),
    country: countryOf(a.originalLanguage),
    status: a.status || "",
    year: a.year || null,
    rating: a.rating ?? null,
    contentRating: a.contentRating || "safe",
    tags: (a.tags || [])
      .map((t) => t.attributes?.name?.en || "")
      .filter(Boolean)
      .slice(0, 10)
      .map((t) => t.toUpperCase()),
    authors: (manga.relationships || [])
      .filter((r) => r.type === "author" || r.type === "artist")
      .map((r) => r.attributes?.name)
      .filter(Boolean),
  };
}

export function chapterLabel(attrs) {
  const parts = [];
  if (attrs.volume) parts.push(`Vol. ${attrs.volume}`);
  if (attrs.chapter) parts.push(`Ch. ${attrs.chapter}`);
  return parts.join(" ") || "Oneshot";
}

export function normalizeChapter(chapter) {
  const a = chapter.attributes || {};
  const mangaRel = (chapter.relationships || []).find((r) => r.type === "manga");
  const groupRel = (chapter.relationships || []).find((r) => r.type === "scanlation_group");

  return {
    id: chapter.id,
    label: chapterLabel(a),
    title: a.title || "",
    language: a.translatedLanguage || "en",
    group: groupRel?.attributes?.name || "No Group",
    readableAt: a.readableAt || a.publishAt || "",
    pages: a.pages || 0,
    externalUrl: a.externalUrl || "",
    mangaId: mangaRel?.id || "",
    mangaTitle: mangaRel ? pickText(mangaRel.attributes?.title) : "",
  };
}

export function settled(result, fallback) {
  return result.status === "fulfilled" ? result.value : fallback;
}