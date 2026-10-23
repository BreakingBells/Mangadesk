import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shuffle, SlidersHorizontal, Library } from "lucide-react";

const AnimatedElement = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
};

const fallback = [
  { id: "f1", title: "Dungeon Meshi", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/0047fdadd_manga-desk_netlify_app_d3430039-ea47-48c3-9b8b-cf80200d7f0bjpg256_2c2dd4c8.jpg" },
  { id: "f2", title: "Yotsuba to!", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/9043b62a3_manga-desk_netlify_app_ff8d4f70-1797-4036-8241-c63b2237254ejpg256_573e4eb3.jpg" },
  { id: "f3", title: "Veil", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/fe3a06c60_manga-desk_netlify_app_8299ead2-5d96-4f41-8ce5-b00c95505449jpg256_cd07e065.jpg" },
  { id: "f4", title: "Odoriko", country: "JP", section: "recently_added", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/b2a7d26e8_manga-desk_netlify_app_db8f64bb-47c8-4592-ae28-c709fc76d417jpg256_3d2aed52.jpg" },
];

export default function Titles() {
  const [titles, setTitles] = useState([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("ALL");
  const [section, setSection] = useState("all");
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    base44.entities.MangaTitle.list("rank", 100).then(setTitles).catch(() => {});
  }, []);

  const items = titles.length > 0 ? titles : fallback;
  const filtered = useMemo(
    () => items.filter((t) =>
      (country === "ALL" || t.country === country) &&
      (section === "all" || t.section === section) &&
      t.title.toLowerCase().includes(query.toLowerCase())),
    [items, query, country, section]
  );

  const random = () => {
    if (filtered.length === 0) return;
    setPicked(filtered[Math.floor(Math.random() * filtered.length)]);
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
            <p className="mt-4 text-foreground/70 max-w-xl">Browse the whole catalogue. Filter by origin, shelf, or search by name.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles..." className="pl-10 rounded-none bg-background h-11" />
              </div>
              <Button onClick={random} className="relative overflow-hidden rounded-none h-11 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                <Shuffle className="h-4 w-4 mr-2 relative" /><span className="relative">Surprise me</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {picked && (
        <section className="bg-muted py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center gap-5">
            <img src={picked.image_url} alt={picked.title} className="w-20 aspect-[3/4] object-cover shadow-lg" />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">Random pick</div>
              <div className="text-xl font-bold mt-1">{picked.title}</div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <AnimatedElement>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="h-4 w-4 text-primary" /> Filters</div>
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

          <div className="text-sm text-muted-foreground mb-4">{filtered.length} titles</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map((t, i) => (
              <AnimatedElement key={t.id || i} delay={(i % 5) * 80}>
                <a href="#" className="group relative block aspect-[3/4] overflow-hidden bg-muted shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1">
                  <img src={t.image_url} alt={t.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-2 left-2 bg-background/90 text-foreground text-[10px] font-bold px-1.5 py-0.5">{t.country}</span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/90 via-foreground/60 to-transparent p-3 pt-10">
                    <div className="text-background text-xs font-semibold leading-snug line-clamp-2">{t.title}</div>
                  </div>
                </a>
              </AnimatedElement>
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No titles match your filters.</div>}
        </div>
      </section>
    </div>
  );
}