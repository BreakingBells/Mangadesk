import { mdFetch, normalizeManga, COUNTRIES, CONTENT_RATINGS } from "../../shared/mangadex.ts";

// Catalogue search with origin / shelf filters and paging.
export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || "").trim().slice(0, 100);
    const country = String(body.country || "ALL").toUpperCase();
    const section = String(body.section || "all");
    const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 40);
    const offset = Math.min(Math.max(Number(body.offset) || 0, 0), 9000);

    const params = {
      limit,
      offset,
      "includes[]": "cover_art",
      "contentRating[]": CONTENT_RATINGS,
      hasAvailableChapters: "true",
    };

    if (query) params.title = query;
    if (COUNTRIES[country]) params["originalLanguage[]"] = COUNTRIES[country];

    if (section === "top_rated") params["order[rating]"] = "desc";
    else if (section === "recently_added") params["order[createdAt]"] = "desc";
    else if (query) params["order[relevance]"] = "desc";
    else params["order[followedCount]"] = "desc";

    const result = await mdFetch("/manga", params);

    return Response.json({
      items: (result.data || []).map((m) => normalizeManga(m, "256")),
      total: result.total || 0,
      offset,
      limit,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}