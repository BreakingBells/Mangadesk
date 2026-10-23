import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, Globe, ShieldCheck, LayoutGrid, Check } from "lucide-react";

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

const DEFAULTS = { language: "en", rating: ["safe", "suggestive"], dataSaver: false, columns: 5, showFlags: true, rememberTab: true };

export default function Settings() {
  const [s, setS] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mangadesk-settings");
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch (e) {}
  }, []);

  const toggleRating = (r) =>
    setS((p) => ({ ...p, rating: p.rating.includes(r) ? p.rating.filter((x) => x !== r) : [...p.rating, r] }));

  const save = () => {
    try { localStorage.setItem("mangadesk-settings", JSON.stringify(s)); } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const reset = () => setS(DEFAULTS);

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary min-h-[40vh] flex items-center">
        <div className="absolute -top-24 -left-10 w-[460px] h-[460px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-[380px] h-[380px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-14 right-[14%] w-12 h-12 border-2 border-primary/30 rotate-12 pointer-events-none" style={{ animation: "floatC 9s ease-in-out infinite" }} />
        <div className="absolute bottom-14 left-[40%] w-8 h-8 bg-accent/20 rounded-full pointer-events-none" style={{ animation: "floatB 6s ease-in-out 2s infinite" }} />
        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-[0.25em] mb-4"><SettingsIcon className="h-4 w-4" /> App</div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient-x">Settings</h1>
            <p className="mt-4 text-foreground/70 max-w-xl">Tune MangaDesk to the way you read. Preferences are stored locally in your browser.</p>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-6">
          <AnimatedElement>
            <div className="p-px bg-gradient-to-br from-primary/50 via-transparent to-accent/50">
              <div className="bg-card p-6">
                <h2 className="flex items-center gap-2 font-bold text-lg mb-5"><Globe className="h-5 w-5 text-primary" /> Language</h2>
                <Label className="text-sm text-muted-foreground">Preferred chapter language</Label>
                <Select value={s.language} onValueChange={(v) => setS({ ...s, language: v })}>
                  <SelectTrigger className="mt-2 rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={80}>
            <div className="p-px bg-gradient-to-br from-primary/50 via-transparent to-accent/50">
              <div className="bg-card p-6">
                <h2 className="flex items-center gap-2 font-bold text-lg mb-5"><ShieldCheck className="h-5 w-5 text-primary" /> Content Rating</h2>
                <div className="flex flex-wrap gap-2">
                  {["safe", "suggestive", "erotica", "pornographic"].map((r) => {
                    const on = s.rating.includes(r);
                    return (
                      <button key={r} onClick={() => toggleRating(r)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary"}`}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={160}>
            <div className="p-px bg-gradient-to-br from-primary/50 via-transparent to-accent/50">
              <div className="bg-card p-6 space-y-6">
                <h2 className="flex items-center gap-2 font-bold text-lg"><LayoutGrid className="h-5 w-5 text-primary" /> Display</h2>
                <div>
                  <Label className="text-sm text-muted-foreground">Grid columns: {s.columns}</Label>
                  <Slider className="mt-3" min={2} max={6} step={1} value={[s.columns]} onValueChange={(v) => setS({ ...s, columns: v[0] })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show origin flags on covers</Label>
                  <Switch checked={s.showFlags} onCheckedChange={(v) => setS({ ...s, showFlags: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Data saver (smaller images)</Label>
                  <Switch checked={s.dataSaver} onCheckedChange={(v) => setS({ ...s, dataSaver: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Remember last visited tab</Label>
                  <Switch checked={s.rememberTab} onCheckedChange={(v) => setS({ ...s, rememberTab: v })} />
                </div>
              </div>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={240}>
            <div className="flex gap-3">
              <Button onClick={save} className="relative overflow-hidden rounded-none bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                {saved ? <Check className="h-4 w-4 mr-2 relative" /> : null}
                <span className="relative">{saved ? "Saved" : "Save changes"}</span>
              </Button>
              <Button variant="outline" onClick={reset} className="rounded-none">Reset</Button>
            </div>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}