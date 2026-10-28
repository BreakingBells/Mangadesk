import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mangaClient } from "@/api/mangaClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { InlineLoader, LoadError } from "@/components/manga/DataStates";

export default function ChapterReader() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setData(null);
    window.scrollTo({ top: 0 });
    mangaClient
      .invoke("mangadexChapter", { id })
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => { if (active) setError(err?.response?.data?.error || err.message || "Unexpected error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <InlineLoader label="Loading chapter pages..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <LoadError message={error} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  }

  const chapter = data?.chapter;
  if (!chapter) return null;
  const pages = data?.pages || [];
  const heading = [chapter.label, chapter.title].filter(Boolean).join(" - ");

  return (
    <div className="bg-background">
      <div className="sticky top-16 z-40 border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/Title/${chapter.mangaId}`} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Title</span>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold truncate text-foreground">{data.mangaTitle || chapter.mangaTitle}</div>
            <div className="text-xs text-muted-foreground truncate">{heading} • {chapter.pages} pages</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild={!!data.prevId} variant="outline" size="sm" disabled={!data.prevId} className="rounded-lg">
              {data.prevId ? <Link to={`/Chapter/${data.prevId}`}><ChevronLeft className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Prev</span></Link> : <span><ChevronLeft className="h-4 w-4 opacity-40" /></span>}
            </Button>
            <Button asChild={!!data.nextId} variant="outline" size="sm" disabled={!data.nextId} className="rounded-lg">
              {data.nextId ? <Link to={`/Chapter/${data.nextId}`}><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4 sm:ml-1" /></Link> : <span><ChevronRight className="h-4 w-4 opacity-40" /></span>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6">
        {pages.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {chapter.externalUrl
              ? "This chapter is published officially elsewhere, so its pages are not available to read here."
              : "No page images are available for this chapter."}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {pages.map((page, i) => (
              <img
                key={page}
                src={page}
                alt={`${heading} page ${i + 1}`}
                loading={i < 2 ? "eager" : "lazy"}
                className="w-full bg-muted rounded-sm"
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button asChild={!!data.prevId} variant="outline" disabled={!data.prevId} className="rounded-xl">
            {data.prevId ? <Link to={`/Chapter/${data.prevId}`}><ChevronLeft className="h-4 w-4 mr-2" /> Previous chapter</Link> : <span><ChevronLeft className="h-4 w-4 mr-2 opacity-40" /> Previous chapter</span>}
          </Button>
          <Button asChild={!!data.nextId} disabled={!data.nextId} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            {data.nextId ? <Link to={`/Chapter/${data.nextId}`}>Next chapter <ChevronRight className="h-4 w-4 ml-2" /></Link> : <span>Next chapter <ChevronRight className="h-4 w-4 ml-2 opacity-40" /></span>}
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" /> Scanned by {chapter.group}
        </div>
      </div>
    </div>
  );
}