import { home, search, title, chapter } from '../lib/mangapill.mjs';
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  try {
    const body = await req.json();
    const { action, id } = body;
    let data;
    if (action === 'home') data = await home();
    else if (action === 'search') {
      data = await search({ query: String(body.query || '').slice(0, 200), country: body.country, section: body.section, offset: Math.max(0, Math.min(10000, Number(body.offset) || 0)), limit: 20 });
    } else if (action === 'title') data = await title(id);
    else if (action === 'chapter') data = await chapter(id);
    else return Response.json({ error: 'Invalid action' }, { status: 400 });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message?.startsWith('Invalid') ? err.message : 'MangaPill is temporarily unavailable. Please try again.' }, { status: 502 });
  }
};
