import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { mangaClient } from "@/api/mangaClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shuffle, SlidersHorizontal, Library, Loader2 } from "lucide-react";
import AnimatedElement from "@/components/manga/AnimatedElement";
import CoverTile from "@/components/manga/CoverTile";
import { GridSkeleton, LoadError } from "@/components/manga/DataStates";

const PAGE_SIZE = 20;

export default function Titles() {
  const location = useLocation();
  const requestVersion = useRef(0);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [warnings, setWarnings] = useState([]);
  const [nextOffset, setNextOffset] = useState({ mangadex: 0, mangapill: 0 });
  const [hasMore, setHasMore] = useState(false);
  const [country, setCountry] = useState("ALL");
  const [section, setSection] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setTerm(q);
    setQuery(q);
    const shelf = params.get("section");
    if (shelf) setSection(shelf);
  }, [location.search]);

  useEffect(() => {
    let active = true;
    requestVersion.current += 1;
    setLoadingMore(false);
    setWarnings([]);
    setPicked(null);
    setItems([]);
    setHasMore(false);
    setLoading(true);
    setError("");
    mangaClient
      .invoke("mangadexSearch", { query, country, section, source, limit: PAGE_SIZE, offset: 0 })
      .then((res) => {
        if (!active) return;
        setItems(res.data.items || []);
        setNextOffset(res.data.nextOffset);
        setHasMore(res.data.hasMore);
        setWarnings(res.data.warnings || []);
      })
      .catch((err) => { if (active) setError(err?.response?.data?.error || err.message || "Unexpected error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; requestVersion.current += 1; };
  }, [query, country, section, source, attempt]);

  const loadMore = () => {
    const version = requestVersion.current;
    setError("");
    setLoadingMore(true);
    mangaClient
      .invoke("mangadexSearch", { query, country, section, source, limit: PAGE_SIZE, offset: nextOffset })
      .then((res) => {
        if (version !== requestVersion.current) return;
        setItems((prev) => [...new Map([...prev, ...(res.data.items || [])].map(item => [item.id, item])).values()]);
        setNextOffset(res.data.nextOffset);
        setHasMore(res.data.hasMore);
        setWarnings(res.data.warnings || []);
      })
      .catch((err) => { if (version === requestVersion.current) setError(err?.response?.data?.error || err.message || "Unexpected error"); })
      .finally(() => { if (version === requestVersion.current) setLoadingMore(false); });
  };

  const random = () => {
    if (items.length === 0) return;
    setPicked(items[Math.floor(Math.random() * items.length)]);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary min-h-[40vh] flex items-center">
        <div className="absolute -top-24 right-0 w-[460px] h-[460px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-10 w-[380px] h-[380px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-12 right-[12%] w-12 h-12 border-2 border-primary/30 rotate-12 pointer-events-none" style={{ animation: "floatA 8s ease-in-out infinite" }} />
        <div className="absolute bottom-12 left-[45%] w-8 h-8 bg-accent/20 rounded-full pointer-events-none" style={{ animation: "floatB 6s ease-in-out 2s infinite" }} />
        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-[0.25em] mb-4"><Library className="h-4 w-4" /> Titles</div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-x">Advanced Search</h1>
            <p className="mt-4 text-foreground/70 max-w-xl">Search MangaDex and MangaPill together. Filter by origin, shelf, or name.</p>
            <form onSubmit={(e) => { e.preventDefault(); setQuery(term); }} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search titles..." className="pl-10 rounded-none bg-background h-11" />
              </div>
              <Button type="submit" className="rounded-none h-11 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
              <Button type="button" onClick={random} className="relative overflow-hidden rounded-none h-11 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                <Shuffle className="h-4 w-4 mr-2 relative" /><span className="relative">Surprise me</span>
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {picked && (
        <section className="bg-muted py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center gap-5">
            {picked.cover && <img src={picked.cover} alt={picked.title} className="w-20 aspect-[3/4] object-cover shadow-lg" />}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">Random pick</div>
              <Link to={`/Title/${picked.id}`} className="text-xl font-bold mt-1 block hover:text-primary transition-colors">{picked.title}</Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <AnimatedElement>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="h-4 w-4 text-primary" /> Filters</div>
              <label className="flex items-center gap-2 text-sm">Source<select aria-label="Manga source" value={source} onChange={(e) => setSource(e.target.value)} className="bg-background border border-border px-3 py-2"><option value="all">All sources</option><option value="mangadex">MangaDex</option><option value="mangapill">MangaPill</option></select></label>
              <Tabs value={country} onValueChange={setCountry}>
                <TabsList className="rounded-none">
                  <TabsTrigger value="ALL" className="rounded-none">All</TabsTrigger>
                  <TabsTrigger value="JP" className="rounded-none">Japan</TabsTrigger>
                  <TabsTrigger value="KR" className="rounded-none">Korea</TabsTrigger>
                  <TabsTrigger value="CN" className="rounded-none">China</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={section} onValueChange={setSection}>
                <TabsList className="rounded-none">
                  <TabsTrigger value="all" className="rounded-none">Everything</TabsTrigger>
                  <TabsTrigger value="top_rated" className="rounded-none">Top Rated</TabsTrigger>
                  <TabsTrigger value="recently_added" className="rounded-none">New</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </AnimatedElement>

          {warnings.map(message => <p key={message} role="status" className="text-sm text-muted-foreground mb-4">{message}</p>)}

          {loading && <GridSkeleton count={10} />}

          {!loading && error && <LoadError message={error} onRetry={() => setAttempt((a) => a + 1)} />}

          {!loading && (!error || items.length > 0) && (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                {items.length} titles loaded
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {items.map((t, i) => (
                  <AnimatedElement key={`${t.id}-${i}`} delay={(i % 5) * 80}>
                    <CoverTile item={t} />
                  </AnimatedElement>
                ))}
              </div>
              {items.length === 0 && <div className="text-center py-16 text-muted-foreground">No titles match your filters.</div>}

              {items.length > 0 && hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="rounded-none h-11 px-8">
                    {loadingMore ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...</> : "Load more titles"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}