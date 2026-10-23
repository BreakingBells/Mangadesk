import {
  mdFetch,
  normalizeManga,
  normalizeChapter,
  settled,
  CONTENT_RATINGS,
} from "../../shared/mangadex.ts";

// Front page data: spotlight titles, top rated, recently added series and the newest chapters.
export default async function (req) {
  try {
    const [spotlight, topRated, recentlyAdded, latestChapters] = await Promise.allSettled([
      mdFetch("/manga", {
        limit: 6,
        "includes[]": ["cover_art", "author"],
        "order[followedCount]": "desc",
        "contentRating[]": CONTENT_RATINGS,
        "availableTranslatedLanguage[]": "en",
        hasAvailableChapters: "true",
      }),
      mdFetch("/manga", {
        limit: 10,
        "includes[]": ["cover_art"],
        "order[rating]": "desc",
        "contentRating[]": CONTENT_RATINGS,
        "availableTranslatedLanguage[]": "en",
        hasAvailableChapters: "true",
      }),
      mdFetch("/manga", {
        limit: 10,
        "includes[]": ["cover_art"],
        "order[createdAt]": "desc",
        "contentRating[]": CONTENT_RATINGS,
        "availableTranslatedLanguage[]": "en",
        hasAvailableChapters: "true",
      }),
      mdFetch("/chapter", {
        limit: 12,
        "translatedLanguage[]": "en",
        "order[readableAt]": "desc",
        "includes[]": ["manga", "scanlation_group"],
        "contentRating[]": CONTENT_RATINGS,
        includeEmptyPages: "0",
      }),
    ]);

    if ([spotlight, topRated, recentlyAdded, latestChapters].every((result) => result.status === "rejected")) {
      throw spotlight.reason;
    }

    const spotlightList = settled(spotlight, { data: [] }).data || [];
    const chapterList = (settled(latestChapters, { data: [] }).data || []).map(normalizeChapter);

    // Covers for the newest chapters come from a single batched manga lookup.
    const mangaIds = [...new Set(chapterList.map((c) => c.mangaId).filter(Boolean))].slice(0, 20);
    let covers = {};
    if (mangaIds.length > 0) {
      const [coverRes] = await Promise.allSettled([
        mdFetch("/manga", { "ids[]": mangaIds, "includes[]": "cover_art", limit: 20 }),
      ]);
      const list = settled(coverRes, { data: [] }).data || [];
      covers = Object.fromEntries(list.map((m) => [m.id, normalizeManga(m, "256").cover]));
    }

    return Response.json({
      spotlight: spotlightList.map((m) => normalizeManga(m, "512")),
      topRated: (settled(topRated, { data: [] }).data || []).map((m) => normalizeManga(m, "256")),
      recentlyAdded: (settled(recentlyAdded, { data: [] }).data || []).map((m) => normalizeManga(m, "256")),
      latest: chapterList.map((c) => ({ ...c, cover: covers[c.mangaId] || "" })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
