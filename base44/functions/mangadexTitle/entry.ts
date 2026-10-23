import { mdFetch, normalizeManga, normalizeChapter, CONTENT_RATINGS } from "../../shared/mangadex.ts";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One title with its English chapter list.
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || "");
    if (!ID_PATTERN.test(id)) return Response.json({ error: "Invalid title id" }, { status: 400 });

    const offset = Math.min(Math.max(Number(body.offset) || 0, 0), 9000);

    const [mangaRes, feedRes] = await Promise.all([
      mdFetch(`/manga/${id}`, { "includes[]": ["cover_art", "author", "artist"] }),
      mdFetch(`/manga/${id}/feed`, {
        limit: 100,
        offset,
        "translatedLanguage[]": "en",
        "order[chapter]": "desc",
        "includes[]": "scanlation_group",
        "contentRating[]": CONTENT_RATINGS,
        includeEmptyPages: "0",
      }),
    ]);

    const raw = feedRes.data || [];
    const mapped = raw.map(normalizeChapter);
    // Chapters hosted on an official site have no readable pages here — keep them out of the reader list.
    const chapters = mapped.filter((c) => !c.externalUrl);

    // Licensed titles often keep only externally hosted chapters — surface those instead of an empty list.
    let external = offset === 0 ? mapped.filter((c) => c.externalUrl).slice(0, 50) : [];
    if (chapters.length === 0 && external.length === 0 && offset === 0) {
      const extRes = await mdFetch(`/manga/${id}/feed`, {
        limit: 100,
        "translatedLanguage[]": "en",
        "order[chapter]": "desc",
        "contentRating[]": CONTENT_RATINGS,
        includeEmptyPages: "1",
      });
      external = (extRes.data || [])
        .filter((c) => c.attributes?.externalUrl)
        .map(normalizeChapter)
        .slice(0, 50);
    }

    return Response.json({
      manga: normalizeManga(mangaRes.data, "512"),
      chapters,
      external,
      total: feedRes.total || 0,
      hasMore: offset + raw.length < (feedRes.total || 0),
      offset,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}