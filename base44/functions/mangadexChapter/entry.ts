import { mdFetch, normalizeChapter, pickText, CONTENT_RATINGS } from "../../shared/mangadex.ts";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Page images for one chapter, plus the neighbouring chapters for navigation.
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || "");
    if (!ID_PATTERN.test(id)) return Response.json({ error: "Invalid chapter id" }, { status: 400 });

    const [chapterRes, serverRes] = await Promise.all([
      mdFetch(`/chapter/${id}`, { "includes[]": ["manga", "scanlation_group"] }),
      mdFetch(`/at-home/server/${id}`),
    ]);

    const chapter = normalizeChapter(chapterRes.data);
    const host = serverRes.baseUrl;
    const hash = serverRes.chapter?.hash;
    const pages = (serverRes.chapter?.data || []).map((file) => `${host}/data/${hash}/${file}`);

    let prevId = "";
    let nextId = "";
    if (chapter.mangaId) {
      const feed = await mdFetch(`/manga/${chapter.mangaId}/feed`, {
        limit: 100,
        "translatedLanguage[]": chapter.language || "en",
        "order[chapter]": "desc",
        "contentRating[]": CONTENT_RATINGS,
        includeEmptyPages: "0",
      });
      const list = (feed.data || []).map((c) => c.id);
      const index = list.indexOf(id);
      if (index > -1) {
        // Feed is newest first: the previous entry is the next chapter, the following one is older.
        nextId = list[index - 1] || "";
        prevId = list[index + 1] || "";
      }
    }

    const mangaRel = (chapterRes.data.relationships || []).find((r) => r.type === "manga");

    return Response.json({
      chapter,
      mangaTitle: chapter.mangaTitle || (mangaRel ? pickText(mangaRel.attributes?.title) : ""),
      pages,
      prevId,
      nextId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}