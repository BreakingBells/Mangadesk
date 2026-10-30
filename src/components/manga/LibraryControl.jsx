import { BookmarkPlus, Check, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '@/hooks/use-library';
import { LIBRARY_SHELVES } from '../../../shared/library';

export default function LibraryControl({ manga }) {
  const { entries, isPending, isError, refetch, save, remove } = useLibrary();
  const saved = entries.find(entry => entry.id === manga.id);
  const busy = save.isPending || remove.isPending;
  const error = save.error || remove.error;
  const changeShelf = shelf => {
    save.reset(); remove.reset();
    if (shelf) save.mutate({ manga, shelf });
  };
  return (
    <div className="mt-6 pt-5 border-t border-border/50">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          {busy || isPending ? <Loader2 className="h-4 w-4 text-primary animate-spin" /> : saved ? <Check className="h-4 w-4 text-primary" /> : <BookmarkPlus className="h-4 w-4 text-primary" />}
          <span className="sr-only">Library shelf for {manga.title}</span>
          <select value={saved?.shelf || ''} disabled={isPending || isError || busy} onChange={event => changeShelf(event.target.value)} className="max-w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            <option value="" disabled>{isPending ? 'Loading library…' : 'Add to library…'}</option>
            {LIBRARY_SHELVES.map(shelf => <option key={shelf.value} value={shelf.value}>{shelf.label}</option>)}
          </select>
        </label>
        {saved && <button type="button" disabled={busy} onClick={() => { save.reset(); remove.reset(); remove.mutate(manga.id); }} aria-label={`Remove ${manga.title} from library`} className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
        <Link to="/Library" className="text-sm text-primary hover:underline">View library</Link>
      </div>
      {isError && <p role="alert" className="mt-2 text-sm text-destructive">Library unavailable. <button type="button" onClick={() => refetch()} className="underline">Retry</button></p>}
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error.message}</p>}
      <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">{save.isSuccess ? 'Saved to your library.' : remove.isSuccess ? 'Removed from your library.' : 'Your shelves are saved for this browser.'}</p>
    </div>
  );
}
