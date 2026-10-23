import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Flame, Zap } from "lucide-react";
import AnimatedElement from "@/components/manga/AnimatedElement";
import HeroSpotlight from "@/components/manga/HeroSpotlight";
import UpdateCard from "@/components/manga/UpdateCard";
import CoverTile from "@/components/manga/CoverTile";
import { GridSkeleton, LoadError } from "@/components/manga/DataStates";

function CoverGrid({ heading, icon: Icon, items, bg }) {
  if (!items || items.length === 0) return null;

  return (
    <section className={`${bg} py-16 md:py-24 relative overflow-hidden border-t border-border/40`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {heading}
              <Icon className="h-6 w-6 text-primary" />
            </h2>
            <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-border/50 to-transparent rounded-full hidden sm:block" />
            <Link to="/Titles" className="hidden sm:flex group text-sm font-semibold text-primary hover:text-accent items-center gap-1.5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
              Browse all <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {items.map((t, i) => (
            <AnimatedElement key={`${t.id}-${i}`} delay={(i % 5) * 80}>
              <CoverTile item={t} />
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    base44.functions
      .invoke("mangadexHome", {})
      .then((res) => { if (active) setData(res.data); })
      .catch((err) => { if (active) setError(err?.response?.data?.error || err.message || "Unexpected error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  const latest = data?.latest || [];

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

      {loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <GridSkeleton count={10} heading />
        </section>
      )}

      {!loading && error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LoadError message={error} onRetry={() => setAttempt((a) => a + 1)} />
        </section>
      )}

      {!loading && !error && data && (
        <>
          <HeroSpotlight items={data.spotlight || []} />

          {latest.length > 0 && (
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
                  {latest.map((u, i) => (
                    <AnimatedElement key={u.id} delay={(i % 3) * 100}>
                      <UpdateCard item={u} />
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
          )}

          <CoverGrid heading="Top Rated Series" icon={Star} items={data.topRated || []} bg="bg-secondary/20" />
          <CoverGrid heading="Recently Added" icon={Flame} items={data.recentlyAdded || []} bg="bg-background" />
        </>
      )}
    </div>
  );
}