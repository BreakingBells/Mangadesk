import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const FAVICON = "https://media.base44.com/images/public/6adabf043a6a742a99c21e67/25c6e4a2b_manga-desk_netlify_app_favicon_c1557ff6.svg";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <img src={FAVICON} alt="MangaDesk" onError={(e) => { e.target.style.display = "none"; }} className="h-8 w-8" />
            <span className="font-bold text-xl">MangaDesk</span>
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/80 max-w-xs">A clean, fast desk for browsing manga titles and the latest chapter releases.</p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-primary-foreground/70">Titles</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/Titles" className="hover:underline">Advanced Search</Link></li>
            <li><a href="#" className="hover:underline">Recently Added</a></li>
            <li><a href="#" className="hover:underline">Latest Updates</a></li>
            <li><Link to="/Titles" className="hover:underline">Random</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-primary-foreground/70">Web</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Proxy Browser</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-primary-foreground/70">App</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/Settings" className="hover:underline">Settings</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-primary-foreground/80">
          <div className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Data provided by the <a href="https://api.mangadex.org/docs/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">MangaDex API</a>. Not affiliated with MangaDex.</div>
          <div>MangaDesk</div>
        </div>
      </div>
    </footer>
  );
}