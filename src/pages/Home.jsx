import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Clock, Users, Flame, Sparkles, Star, Zap, Icon } from 'lucide-react';

const HERO_IMG = "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/caa35b7aa_manga-desk_netlify_app_7fb75987-5979-4a31-8b05-e378c21b5361jpg512_caaf2ec2.jpg";

const AnimatedElement = ({ children, className = "", delay = 0 }) => {
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
    }, { threshold: 0.05, rootMargin: "0px 0px 100px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.98]"} ${className}`}>
      {children}
    </div>
  );
};

const heroTags = ["SUGGESTIVE", "REINCARNATION", "ACTION", "COMEDY", "ISEKAI", "FANTASY", "SLICE OF LIFE"];

const fallbackUpdates = [
  { id: "u1", title: "Kaine", chapter: "Vol. 1 Ch. 2 - Magical Mystery Tour", group: "Nyajinsky", time_ago: "45 minutes ago", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/e911b58d1_manga-desk_netlify_app_83fb54ab-4839-47b7-98d9-d7053c018a0bjpg256_d023e82c.jpg" },
  { id: "u2", title: "Yu Gi Oh! OCG STORIES", chapter: "Ch. 51 - Truth", group: "Varrel", time_ago: "1 hour ago", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/c73a87fa1_manga-desk_netlify_app_187b72db-9d6a-4753-81b2-34e41150ad9fjpg256_9e818515.jpg" },
  { id: "u3", title: "Tokusatsu Gagaga", chapter: "Vol. 5 Ch. 40 - Tokusatsu is Explosions!", group: "No Group", time_ago: "2 hours ago", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/537c9b916_manga-desk_netlify_app_3b9faee6-4e86-4dfb-89f7-fafa981d2af0jpg256_21165ac7.jpg" },
  { id: "u4", title: "Senyuu.", chapter: "Vol. 6 Ch. 161 - Potential", group: "Pwei Scans", time_ago: "3 hours ago", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/b10a7dfba_manga-desk_netlify_app_8bfce0e0-2d0d-4c76-bc2e-b02bb7719e83jpg256_572857a5.jpg" },
  { id: "u5", title: "Odoriko", chapter: "Ch. 12 - The Dance Continues", group: "Soloist Scans", time_ago: "5 hours ago", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/b2a7d26e8_manga-desk_netlify_app_db8f64bb-47c8-4592-ae28-c709fc76d417jpg256_3d2aed52.jpg" },
  { id: "u6", title: "Dungeon Meshi", chapter: "Vol. 12 Ch. 85 - Surface", group: "Delicious in Dungeon", time_ago: "6 hours ago", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/0047fdadd_manga-desk_netlify_app_d3430039-ea47-48c3-9b8b-cf80200d7f0bjpg256_2c2dd4c8.jpg" },
];

const fallbackTitles = [
  { id: "t1", title: "Veil", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/fe3a06c60_manga-desk_netlify_app_8299ead2-5d96-4f41-8ce5-b00c95505449jpg256_cd07e065.jpg" },
  { id: "t2", title: "Dungeon Meshi", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/0047fdadd_manga-desk_netlify_app_d3430039-ea47-48c3-9b8b-cf80200d7f0bjpg256_2c2dd4c8.jpg" },
  { id: "t3", title: "Yotsuba to!", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/9043b62a3_manga-desk_netlify_app_ff8d4f70-1797-4036-8241-c63b2237254ejpg256_573e4eb3.jpg" },
  { id: "t4", title: "Senyuu.", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/b10a7dfba_manga-desk_netlify_app_8bfce0e0-2d0d-4c76-bc2e-b02bb7719e83jpg256_572857a5.jpg" },
  { id: "t5", title: "Tokusatsu Gagaga", country: "JP", section: "top_rated", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/537c9b916_manga-desk_netlify_app_3b9faee6-4e86-4dfb-89f7-fafa981d2af0jpg256_21165ac7.jpg" },
  { id: "t6", title: "Odoriko", country: "JP", section: "recently_added", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/b2a7d26e8_manga-desk_netlify_app_db8f64bb-47c8-4592-ae28-c709fc76d417jpg256_3d2aed52.jpg" },
  { id: "t7", title: "Kaine", country: "JP", section: "recently_added", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/e911b58d1_manga-desk_netlify_app_83fb54ab-4839-47b7-98d9-d7053c018a0bjpg256_d023e82c.jpg" },
  { id: "t8", title: "Yu Gi Oh! OCG STORIES", country: "JP", section: "recently_added", image_url: "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/c73a87fa1_manga-desk_netlify_app_187b72db-9d6a-4753-81b2-34e41150ad9fjpg256_9e818515.jpg" },
];

const flagLabel = { JP: "JP", KR: "KR", CN: "CN" };

function HeroSection() {
  return (
    <section className="relative bg-secondary/30 min-h-[85vh] flex items-center border-b border-border/40">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_hsl(var(--primary)/0.05)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-60" />
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
      
      {/* Animated Floating Shapes */}
      <div className="absolute top-[15%] left-[8%] w-16 h-16 border-2 border-primary/20 rotate-12 pointer-events-none backdrop-blur-sm rounded-xl" style={{ animation: "floatA 8s ease-in-out infinite" }} />
      <div className="absolute bottom-[20%] right-[12%] w-12 h-12 bg-accent/20 rounded-full pointer-events-none backdrop-blur-md" style={{ animation: "floatB 6s ease-in-out 2s infinite" }} />
      <div className="absolute top-[40%] right-[5%] w-8 h-8 border border-foreground/10 rotate-45 pointer-events-none" style={{ animation: "floatA 10s ease-in-out 1s infinite" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
            
            {/* Image Column */}
            <div className="w-full max-w-[320px] lg:max-w-[400px] shrink-0 relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-accent/20 to-transparent blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10 dark:border-white/5 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:rotate-1 transition-all duration-500 ease-out">
                <img 
                  src={HERO_IMG} 
                  alt="Yaraare-yaku no Akutoku Kojin-inchou cover" 
                  className="w-full h-auto object-cover aspect-[3/4]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold px-3 py-1.5 shadow-lg backdrop-blur-md border-none text-xs tracking-wider">
                  NO. 1 TRENDING
                </Badge>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="flex h-6 w-6 rounded-full bg-primary/10 items-center justify-center">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Featured Spotlight</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6">
                Yaraare-yaku no Akutoku Kojin-inchou ni Tensei Shita Ore
              </h1>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                {heroTags.map((t, i) => (
                  <Badge 
                    key={t} 
                    variant="outline"
                    className={`px-3 py-1 text-xs sm:text-sm border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-default ${i === 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-background/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"}`}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl line-clamp-4 lg:line-clamp-none">
                Roik, a vile orphanage director who runs the orphanage solely for money, suddenly remembers that he is a reincarnated person! This is the world of a game he played in his previous life, and a future awaits him in which he is ruined after being killed by Alice, one of the orphanage's children, who seeks revenge against him...
              </p>
              
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border"><Users className="h-3 w-3 text-muted-foreground" /></div>
                  kikuchi kaisei
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>KISERU</span>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto h-14 px-8 rounded-xl text-base group">
                  <Link to="/Titles">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-[shimmer_2.5s_infinite_ease-in-out]" />
                    <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold tracking-wide">Start Reading Vol. 1</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-xl text-base border-border/60 bg-background/50 backdrop-blur-sm hover:bg-muted hover:text-foreground transition-all duration-300 group">
                  <Link to="/Titles">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LatestUpdates() {
  const [updates, setUpdates] = useState([]);
  useEffect(() => {
    base44.entities.ChapterUpdate.list().then(setUpdates).catch(() => {});
  }, []);
  const items = updates.length > 0 ? updates.slice(0, 6) : fallbackUpdates;
  
  return (
    <section className="bg-background py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                Latest Updates
                <Zap className="h-6 w-6 text-primary animate-pulse" />
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">Fresh chapters added just for you.</p>
            </div>
            <Link to="/Titles" className="hidden sm:flex group text-sm font-semibold text-primary hover:text-accent items-center gap-1.5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
              View all releases <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedElement>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {items.map((u, i) => (
            <AnimatedElement key={u.id || i} delay={(i % 3) * 100}>
              <a href="#" className="group flex gap-4 p-3 bg-card border border-border/50 rounded-2xl hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transitionDuration: '1s' }} />
                
                <div className="w-20 sm:w-24 shrink-0 aspect-[3/4] overflow-hidden bg-muted rounded-xl relative z-10 shadow-sm">
                  <img src={u.image_url} alt={u.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
                
                <div className="min-w-0 flex flex-col justify-center py-1 z-10">
                  <div className="font-bold text-foreground text-base sm:text-lg truncate group-hover:text-primary transition-colors pr-2">
                    {u.title}
                  </div>
                  <div className="text-sm text-foreground/70 mt-1 line-clamp-2 leading-tight">
                    {u.chapter}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground mt-3">
                    <span className="flex items-center gap-1.5 truncate bg-muted/50 px-2 py-0.5 rounded-md">
                      <Users className="h-3 w-3 shrink-0 text-primary/70" />
                      {u.group}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 opacity-80">
                      <Clock className="h-3 w-3 text-foreground/50" />
                      {u.time_ago}
                    </span>
                  </div>
                </div>
              </a>
            </AnimatedElement>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center sm:hidden">
          <Button asChild variant="outline" className="w-full rounded-xl">
             <Link to="/Titles">View all releases</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CoverGrid({ heading, icon: Icon, sectionKey, bg, isDark }) {
  const [titles, setTitles] = useState([]);
  useEffect(() => {
    base44.entities.MangaTitle.filter({ section: sectionKey }, "rank", 30).then(setTitles).catch(() => {});
  }, [sectionKey]);
  
  const fb = fallbackTitles.filter((t) => t.section === sectionKey);
  const rawItems = titles.length > 0 ? titles : fb;
  // Duplicate fallback items to fill out the grid nicely if there are too few
  const items = rawItems.length < 5 ? [...rawItems, ...rawItems, ...rawItems].slice(0, 5) : rawItems.slice(0, 10);

  return (
    <section className={`${bg} py-16 md:py-24 relative overflow-hidden border-t border-border/40`}>
      {/* Decorative Blur for specific sections */}
      {sectionKey === "recently_added" && (
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      )}
      {sectionKey === "top_rated" && (
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2" />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {heading}
              <Icon className="h-6 w-6 text-primary" />
            </h2>
            <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-border/50 to-transparent rounded-full hidden sm:block" />
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {items.map((t, i) => (
            <AnimatedElement key={`${t.id}-${i}`} delay={(i % 5) * 80}>
              <a href="#" className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-card shadow-md border border-border/30 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2">
                <img 
                  src={t.image_url} 
                  alt={t.title} 
                  loading="lazy" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                />
                
                {/* Flag Badge */}
                <span className="absolute top-2 left-2 bg-background/90 backdrop-blur-md text-foreground text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                  {flagLabel[t.country] || t.country}
                </span>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay" />

                {/* Bottom Text Gradient Area */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-16 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="text-white text-sm sm:text-base font-semibold leading-tight line-clamp-2 drop-shadow-md">
                    {t.title}
                  </div>
                  <div className="mt-2 text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-1">
                    Read Now <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </a>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      
      <HeroSection />
      <LatestUpdates />
      <CoverGrid heading="Top Rated Series" icon={Star} sectionKey="top_rated" bg="bg-secondary/20" isDark={true} />
      <CoverGrid heading="Recently Added" icon={Flame} sectionKey="recently_added" bg="bg-background" isDark={false} />
    </div>
  );
}