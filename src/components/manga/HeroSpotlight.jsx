import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight, Flame, Users } from "lucide-react";

export default function HeroSpotlight({ items = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => { setIndex(0); }, [items]);

  if (items.length === 0) return null;
  const item = items[index];
  const tags = (item.tags || []).slice(0, 7);

  const step = (delta) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section className="relative bg-secondary/30 min-h-[85vh] flex items-center border-b border-border/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_hsl(var(--primary)/0.05)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-60" />
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="absolute top-[15%] left-[8%] w-16 h-16 border-2 border-primary/20 rotate-12 pointer-events-none backdrop-blur-sm rounded-xl" style={{ animation: "floatA 8s ease-in-out infinite" }} />
      <div className="absolute bottom-[20%] right-[12%] w-12 h-12 bg-accent/20 rounded-full pointer-events-none backdrop-blur-md" style={{ animation: "floatB 6s ease-in-out 2s infinite" }} />
      <div className="absolute top-[40%] right-[5%] w-8 h-8 border border-foreground/10 rotate-45 pointer-events-none" style={{ animation: "floatA 10s ease-in-out 1s infinite" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
            <div className="w-full max-w-[320px] lg:max-w-[400px] shrink-0 relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-accent/20 to-transparent blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 rounded-3xl" />
              <Link to={`/Title/${item.id}`} className="relative block rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10 dark:border-white/5 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:rotate-1 transition-all duration-500 ease-out">
                <div className="aspect-[3/4] bg-muted">
                  {item.cover && <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold px-3 py-1.5 shadow-lg backdrop-blur-md border-none text-xs tracking-wider">
                  NO. {index + 1} TRENDING
                </Badge>
              </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="flex h-6 w-6 rounded-full bg-primary/10 items-center justify-center">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Popular New Titles</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6">
                {item.title}
              </h1>

              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {tags.map((t, i) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className={`px-3 py-1 text-xs sm:text-sm border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-default ${i === 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-background/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"}`}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl line-clamp-4 lg:line-clamp-6">
                {item.description || "No description available for this title yet."}
              </p>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border"><Users className="h-3 w-3 text-muted-foreground" /></div>
                  {item.authors?.length ? item.authors.join(" / ") : "Unknown author"}
                </span>
                {item.year && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{item.year}</span>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto h-14 px-8 rounded-xl text-base group">
                  <Link to={`/Title/${item.id}`}>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-[shimmer_2.5s_infinite_ease-in-out]" />
                    <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold tracking-wide">Start Reading</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-xl text-base border-border/60 bg-background/50 backdrop-blur-sm hover:bg-muted hover:text-foreground transition-all duration-300 group">
                  <Link to={`/Title/${item.id}`}>
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {items.length > 1 && (
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
                  <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label="Previous" className="rounded-full border-border/60 bg-background/50">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground">
                    {index + 1} / {items.length}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="Next" className="rounded-full border-border/60 bg-background/50">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}