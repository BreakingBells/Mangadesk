import { randomBytes, createHash } from 'node:crypto';
import { z } from 'zod';

const COOKIE = 'mangadesk_library';
const idSchema = z.string().max(800).refine(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  || (/^mp_[a-zA-Z0-9_-]+$/.test(id) && /^\/manga\/\d+\/[a-zA-Z0-9-]+$/.test(Buffer.from(id.slice(3), 'base64url').toString())));
const entrySchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1).max(300),
  cover: z.string().max(2000).refine(value => !value || /^https:\/\//i.test(value)).default(''),
  country: z.string().max(10).default(''),
  shelf: z.enum(['reading', 'planned', 'completed']),
});

// Browser ownership is established by an opaque, HttpOnly cookie, never a client-supplied owner id.
export function createLibraryHandler(store) {
  return async req => {
    const headers = new Headers({ 'Cache-Control': 'private, no-store', Vary: 'Cookie' });
    const json = (data, status = 200) => Response.json(data, { status, headers });
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
      headers.set('Allow', 'GET, POST, DELETE');
      return json({ error: 'Method not allowed' }, 405);
    }
    const origin = req.headers.get('origin');
    if (req.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(req.url).origin)) {
      return json({ error: 'Request origin is not allowed' }, 403);
    }
    const cookies = req.headers.get('cookie') || '';
    const candidate = cookies.split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    const existing = candidate && /^[a-f0-9]{64}$/.test(candidate) ? candidate : null;
    const identity = existing || randomBytes(32).toString('hex');
    const ownerHash = createHash('sha256').update(identity).digest('hex');
    const setCookie = () => headers.set('Set-Cookie', `${COOKIE}=${identity}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`);
    try {
      if (req.method === 'GET') {
        const items = existing ? await store.list(ownerHash) : [];
        setCookie();
        return json({ items });
      }
      if (!req.headers.get('content-type')?.includes('application/json')) return json({ error: 'Send a JSON request' }, 415);
      const raw = await req.text();
      if (raw.length > 12000) return json({ error: 'Library entry is too large' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid request body' }, 400); }
      if (req.method === 'DELETE') {
        const parsed = z.object({ id: idSchema }).safeParse(body);
        if (!parsed.success) return json({ error: 'Invalid manga identifier' }, 400);
        if (existing) await store.remove(ownerHash, parsed.data.id);
        return json({ removed: true });
      }
      const parsed = entrySchema.safeParse(body);
      if (!parsed.success) return json({ error: 'Choose a valid title and library shelf' }, 400);
      const entry = { ...parsed.data, source: parsed.data.id.startsWith('mp_') ? 'MangaPill' : 'MangaDex' };
      const item = await store.save(ownerHash, entry);
      setCookie();
      return json({ item });
    } catch {
      return json({ error: 'Your library could not be loaded or saved. Please try again.' }, 503);
    }
  };
}
