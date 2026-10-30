import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Library as LibraryIcon, ArrowRight, BookOpen, Bookmark, CheckCheck, Search } from 'lucide-react';
import { useLibrary } from '@/hooks/use-library';
import { LIBRARY_SHELVES } from '../../shared/library';
import CoverTile from '@/components/manga/CoverTile';
import LibraryControl from '@/components/manga/LibraryControl';
import { GridSkeleton, LoadError } from '@/components/manga/DataStates';

const ICONS = { reading: BookOpen, planned: Bookmark, completed: CheckCheck };
export default function Library() {
  const { entries, isPending, error, refetch } = useLibrary();
  const [shelf, setShelf] = useState('all');
  const [search, setSearch] = useState('');
  const counts = Object.fromEntries(LIBRARY_SHELVES.map(item => [item.value, entries.filter(entry => entry.shelf === item.value).length]));
  const visible = entries.filter(entry => (shelf === 'all' || entry.shelf === shelf) && entry.title.toLowerCase().includes(search.trim().toLowerCase()));
  const selected = LIBRARY_SHELVES.find(item => item.value === shelf);
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border/40 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.25em]"><LibraryIcon className="h-4 w-4" /> Your collection</div>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div><h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">My Library<span className="text-primary">.</span></h1><p className="mt-4 text-muted-foreground max-w-lg">The stories you’re reading. The ones waiting in the wings. And every finished adventure.</p></div>
            <Link to="/Titles" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline shrink-0">Find your next read <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Saved privately for this browser. MangaDex and MangaPill titles live together here.</p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex gap-2 flex-wrap" aria-label="Library shelves">
            <button type="button" aria-pressed={shelf === 'all'} onClick={() => setShelf('all')} className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-colors ${shelf === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}`}>All titles <span className="ml-2 opacity-70">{entries.length}</span></button>
            {LIBRARY_SHELVES.map(item => { const Icon = ICONS[item.value]; return <button type="button" key={item.value} aria-pressed={shelf === item.value} onClick={() => setShelf(item.value)} className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors ${shelf === item.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}`}><Icon className="h-4 w-4" />{item.label}<span className="opacity-70">{counts[item.value]}</span></button>; })}
          </div>
          <label className="relative block max-w-sm"><span className="sr-only">Search your library</span><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a saved title…" className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" /></label>
        </div>
        {isPending && <GridSkeleton count={5} heading={false} />}
        {error && <LoadError message={error.message} onRetry={() => refetch()} />}
        {!isPending && !error && <>
          <div className="flex items-baseline justify-between gap-4 mb-6"><h2 className="text-xl font-bold">{selected?.label || 'All your stories'}</h2><span className="text-xs text-muted-foreground">{visible.length} {visible.length === 1 ? 'title' : 'titles'}</span></div>
          {visible.length > 0 ? <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">{visible.map(entry => <article key={entry.id} className="min-w-0"><CoverTile item={entry} /><LibraryControl manga={entry} /></article>)}</div> : <div className="border border-dashed border-border rounded-2xl px-6 py-16 md:py-24 text-center bg-card/40"><BookOpen className="h-10 w-10 text-primary mx-auto mb-5" /><h3 className="text-2xl font-bold tracking-tight">{search ? 'No matching titles' : entries.length === 0 ? 'Your next story starts here' : 'A little room on this shelf'}</h3><p className="mt-3 text-muted-foreground max-w-md mx-auto">{search ? 'Try a different title or choose another shelf.' : selected ? `Add a manga to ${selected.label} from its title page.` : 'Open any manga and choose a library shelf to keep it close.'}</p><Link to="/Titles" className="inline-flex items-center gap-2 mt-7 bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-semibold hover:bg-primary/90">Browse manga <ArrowRight className="h-4 w-4" /></Link></div>}
        </>}
      </section>
    </div>
  );
}
