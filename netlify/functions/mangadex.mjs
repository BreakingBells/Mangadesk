import home from '../../base44/functions/mangadexHome/entry.ts';
import search from '../../base44/functions/mangadexSearch/entry.ts';
import title from '../../base44/functions/mangadexTitle/entry.ts';
import chapter from '../../base44/functions/mangadexChapter/entry.ts';

// Reuse the existing MangaDex behavior without depending on a hosted Base44 function.
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request body' }, { status: 400 });
  const handlers = { home, search, title, chapter };
  if (!Object.hasOwn(handlers, body.action)) return Response.json({ error: 'Invalid action' }, { status: 400 });
  try {
    const response = await handlers[body.action](new Request(req.url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }));
    const data = await response.json();
    if (!response.ok) return Response.json({ error: response.status === 400 ? data.error : 'MangaDex is temporarily unavailable. Please try again.' }, { status: response.status === 400 ? 400 : 502 });
    if (body.action === 'home' && !['spotlight', 'latest', 'topRated', 'recentlyAdded'].some(key => data[key]?.length)) {
      throw new Error('No MangaDex shelves are available');
    }
    if (data.items) data.items = data.items.map(item => ({ ...item, source: 'MangaDex' }));
    if (data.manga) data.manga.source = 'MangaDex';
    return Response.json(data);
  } catch {
    return Response.json({ error: 'MangaDex is temporarily unavailable. Please try again.' }, { status: 502 });
  }
};
