import handler from "../../base44/functions/mangadexChapter/entry.ts";

export default async function (request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
  }
  return handler(request);
}
