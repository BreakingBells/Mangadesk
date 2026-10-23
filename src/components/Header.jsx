import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, ChevronDown, Library, Globe, Settings, Sparkles, Search } from "lucide-react";

const FAVICON = "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/25c6e4a2b_manga-desk_netlify_app_favicon_c1557ff6.svg";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/Titles?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <img
              src={FAVICON}
              alt="MangaDesk"
              onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "inline"; }}
              className="h-6 w-6 object-contain"
            />
            <Sparkles className="hidden h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">MangaDesk</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-2 text-sm font-medium">
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-muted/80 hover:text-primary transition-all duration-200">Home</Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 rounded-md hover:bg-muted/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 outline-none group">
              <Library className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> Titles <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-xl shadow-primary/5 border-border/50">
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"><Link to="/Titles">Advanced Search</Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"><a href="#">Recently Added</a></DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"><a href="#">Latest Updates</a></DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"><Link to="/Titles">Random</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 rounded-md hover:bg-muted/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 outline-none group">
              <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> Web <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 rounded-xl shadow-xl shadow-primary/5 border-border/50">
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"><a href="#">Proxy Browser</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/Settings" className="px-3 py-2 rounded-md hover:bg-muted/80 hover:text-primary transition-all duration-200 flex items-center gap-1.5 group">
            <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> Settings
          </Link>
        </nav>

        <form onSubmit={submit} className="flex items-center gap-2 ml-auto lg:ml-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search manga..."
              aria-label="Search manga titles"
              className="pl-8 h-9 w-[150px] sm:w-[180px] lg:w-56 rounded-lg"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 shrink-0 rounded-lg px-3 bg-primary text-primary-foreground hover:bg-primary/90">
            <Search className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary text-foreground"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l-border/50 text-foreground w-72">
            <nav className="flex flex-col gap-5 mt-8 text-base font-medium">
              <form onSubmit={(e) => { submit(e); setOpen(false); }} className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search manga..." aria-label="Search manga titles" className="pl-8 rounded-lg" />
              </form>
              <Link to="/" onClick={() => setOpen(false)} className="hover:text-primary transition-colors">Home</Link>
              
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Library className="h-3 w-3" /> Titles
                </div>
                <Link to="/Titles" onClick={() => setOpen(false)} className="pl-3 hover:text-primary text-muted-foreground transition-colors">Advanced Search</Link>
                <a href="#" className="pl-3 hover:text-primary text-muted-foreground transition-colors">Recently Added</a>
                <a href="#" className="pl-3 hover:text-primary text-muted-foreground transition-colors">Latest Updates</a>
                <Link to="/Titles" onClick={() => setOpen(false)} className="pl-3 hover:text-primary text-muted-foreground transition-colors">Random</Link>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Web
                </div>
                <a href="#" className="pl-3 hover:text-primary text-muted-foreground transition-colors">Proxy Browser</a>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Settings className="h-3 w-3" /> App
                </div>
                <Link to="/Settings" onClick={() => setOpen(false)} className="pl-3 hover:text-primary text-muted-foreground transition-colors">Settings</Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}