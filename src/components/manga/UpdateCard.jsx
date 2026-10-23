import { Link } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import timeAgo from "@/lib/timeAgo";

const FLAGS = { en: "🇬🇧", ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", es: "🇪🇸", fr: "🇫🇷", pt: "🇵🇹", ru: "🇷🇺", de: "🇩🇪", it: "🇮🇹" };

export default function UpdateCard({ item }) {
  const chapterLabel = [item.label, item.title].filter(Boolean).join(" - ");

  return (
    <Link
      to={`/Chapter/${item.id}`}
      className="group flex gap-4 p-3 bg-card border border-border/50 rounded-2xl hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transitionDuration: "1s" }} />

      <div className="w-20 sm:w-24 shrink-0 aspect-[3/4] overflow-hidden bg-muted rounded-xl relative z-10 shadow-sm">
        {item.cover && (
          <img src={item.cover} alt={item.mangaTitle} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        )}
      </div>

      <div className="min-w-0 flex flex-col justify-center py-1 z-10">
        <div className="font-bold text-foreground text-base sm:text-lg truncate group-hover:text-primary transition-colors pr-2">
          {item.mangaTitle}
        </div>
        <div className="text-sm text-foreground/70 mt-1 line-clamp-2 leading-tight">
          <span className="mr-1">{FLAGS[item.language] || "🌐"}</span>
          {chapterLabel}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground mt-3">
          <span className="flex items-center gap-1.5 truncate bg-muted/50 px-2 py-0.5 rounded-md">
            <Users className="h-3 w-3 shrink-0 text-primary/70" />
            {item.group}
          </span>
          <span className="flex items-center gap-1.5 shrink-0 opacity-80">
            <Clock className="h-3 w-3 text-foreground/50" />
            {timeAgo(item.readableAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}