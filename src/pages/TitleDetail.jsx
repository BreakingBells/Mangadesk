import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mangaApi } from "@/api/mangaClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Loader2, Users } from "lucide-react";
import AnimatedElement from "@/components/manga/AnimatedElement";
import { InlineLoader, LoadError } from "@/components/manga/DataStates";
import timeAgo from "@/lib/timeAgo";

export default function TitleDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setData(null);
    mangaApi
      .invoke("mangadexTitle", { id, offset: 0 })
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => { if (active) setError(err?.response?.data?.error || err.message || "Unexpected error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt]);

  const loadMore = () => {
    setLoadingMore(true);
    mangaApi
      .invoke("mangadexTitle", { id, offset: data.chapters.length })
      .then((res) => setData((prev) => ({ ...prev, chapters: [...prev.chapters, ...(res.data.chapters || [])] })))
      .catch((err) => setError(err?.response?.data?.error || err.message || "Unexpected error"))
      .finally(() => setLoadingMore(false));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <InlineLoader label="Loading title..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <LoadError message={error} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  }

  const manga = data?.manga;
  const chapters = data?.chapters || [];
  if (!manga) return null;

  const firstChapter = chapters[chapters.length - 1];
  const newestChapter = chapters[0];

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary border-b border-border/40">
        <div className="absolute -top-24 right-0 w-[460px] h-[460px] bg-primary/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12">
          <Link to="/Titles" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to titles
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="w-full max-w-[240px] shrink-0 mx-auto md:mx-0">
              <div className="aspect-[3/4] bg-muted shadow-2xl shadow-primary/10 overflow-hidden rounded-xl">
                {manga.cover && <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover" />}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">
                {manga.country} • {manga.status || "unknown"}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground">{manga.title}</h1>

              {manga.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {manga.tags.map((t, i) => (
                    <Badge key={t} variant="outline" className={`px-3 py-1 text-xs border-border/50 ${i === 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-background/50"}`}>{t}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-foreground/80">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {manga.authors?.length ? manga.authors.join(" / ") : "Unknown author"}
                </span>
                {manga.year && <span>{manga.year}</span>}
              </div>

              <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line max-w-3xl">
                {manga.description || "No description available for this title yet."}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {firstChapter ? (
                  <>
                    <Button asChild size="lg" className="rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to={`/Chapter/${firstChapter.id}`}>
                        <BookOpen className="h-5 w-5 mr-2" /> Start reading {firstChapter.label}
                      </Link>
                    </Button>
                    {newestChapter && newestChapter.id !== firstChapter.id && (
                      <Button asChild variant="outline" size="lg" className="rounded-xl h-12">
                        <Link to={`/Chapter/${newestChapter.id}`}>Latest chapter {newestChapter.label}</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No readable chapters are hosted for this title.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Chapters</h2>
          <p className="text-sm text-muted-foreground mb-8">English releases, newest first.</p>

          {chapters.length > 0 && (
            <div className="divide-y divide-border/50 border border-border/50 rounded-xl overflow-hidden">
              {chapters.map((c, i) => (
                <AnimatedElement key={c.id} delay={Math.min(i, 8) * 30}>
                  <Link to={`/Chapter/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/60 transition-colors group">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {[c.label, c.title].filter(Boolean).join(" - ")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {c.group}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {timeAgo(c.readableAt)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">{c.pages} pages</span>
                  </Link>
                </AnimatedElement>
              ))}
            </div>
          )}

          {chapters.length === 0 && (
            <div className="text-muted-foreground">This title has no chapters available to read right now.</div>
          )}

          {chapters.length > 0 && data.hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="rounded-xl h-11 px-8">
                {loadingMore ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</> : "Load older chapters"}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}