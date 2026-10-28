import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CoverTile({ item }) {
  return (
    <Link
      to={`/Title/${item.id}`}
      className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-card shadow-md border border-border/30 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
    >
      {item.cover ? (
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3 text-center text-xs text-muted-foreground">{item.title}</div>
      )}

      <span className="absolute top-2 left-2 bg-background/90 backdrop-blur-md text-foreground text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
        {item.country} · {item.source || "MangaDex"}
      </span>

      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay" />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-16 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="text-white text-sm sm:text-base font-semibold leading-tight line-clamp-2 drop-shadow-md">{item.title}</div>
        <div className="mt-2 text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-1">
          Read Now <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}