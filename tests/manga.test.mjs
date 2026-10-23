import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import home from '../netlify/functions/mangadexHome.mts';
import search from '../netlify/functions/mangadexSearch.mts';
import title from '../netlify/functions/mangadexTitle.mts';
import chapter from '../netlify/functions/mangadexChapter.mts';
import { mangaApi } from '../src/api/mangaClient.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const request = (body = {}) => new Request('https://example.com/.netlify/functions/manga', {
  method: 'POST', body: JSON.stringify(body),
});
const id = '12345678-1234-1234-1234-123456789012';
const manga = {
  id, attributes: { title: { en: 'Example' }, originalLanguage: 'ja' },
  relationships: [{ type: 'cover_art', attributes: { fileName: 'cover.jpg' } }],
};

test('all deployed endpoints enforce POST and title/chapter validate IDs', async () => {
  for (const handler of [home, search, title, chapter]) {
    const response = await handler(new Request('https://example.com'));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
  }
  for (const handler of [title, chapter]) {
    assert.equal((await handler(request({ id: 'invalid' }))).status, 400);
  }
});

test('search forwards filters and pagination and normalizes results', async () => {
  globalThis.fetch = async (url) => {
    const params = new URL(url).searchParams;
    assert.equal(params.get('title'), 'Example');
    assert.equal(params.get('originalLanguage[]'), 'ko');
    assert.equal(params.get('offset'), '20');
    return Response.json({ data: [manga], total: 21 });
  };
  const response = await search(request({ query: ' Example ', country: 'KR', offset: 20 }));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.items[0].title, 'Example');
  assert.equal(data.total, 21);
});

test('homepage includes latest chapter covers using batched manga IDs', async () => {
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname === '/chapter') return Response.json({ data: [{
      id: 'chapter', attributes: { chapter: '1' }, relationships: [{ type: 'manga', id }],
    }] });
    if (parsed.searchParams.get('limit') === '20') {
      assert.deepEqual(parsed.searchParams.getAll('ids[]'), [id]);
    }
    return Response.json({ data: [manga] });
  };
  const response = await home(request());
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.spotlight[0].title, 'Example');
  assert.match(data.latest[0].cover, /cover.jpg.256.jpg$/);
});

test('homepage reports a complete upstream outage', async () => {
  globalThis.fetch = async () => new Response('', { status: 503 });
  const response = await home(request());
  assert.equal(response.status, 500);
  assert.match((await response.json()).error, /503/);
});

test('title and chapter endpoints serve detail and reader data', async () => {
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    if (path.startsWith('/at-home/')) return Response.json({ baseUrl: 'https://images.example.com', chapter: { hash: 'hash', data: ['page.jpg'] } });
    if (path.endsWith('/feed')) return Response.json({ data: [{ id, attributes: { chapter: '1' } }], total: 1 });
    if (path.startsWith('/chapter/')) return Response.json({ data: { id, attributes: { chapter: '1' }, relationships: [] } });
    return Response.json({ data: manga });
  };
  const detail = await (await title(request({ id }))).json();
  assert.equal(detail.manga.title, 'Example');
  assert.equal(detail.chapters.length, 1);
  const reader = await (await chapter(request({ id }))).json();
  assert.deepEqual(reader.pages, ['https://images.example.com/data/hash/page.jpg']);
});

test('frontend uses deployed Netlify endpoint and surfaces backend errors', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/.netlify/functions/mangadexSearch');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { query: 'Example' });
    return Response.json({ items: [manga] });
  };
  assert.equal((await mangaApi.invoke('mangadexSearch', { query: 'Example' })).data.items[0].id, id);
  globalThis.fetch = async () => Response.json({ error: 'Try again shortly' }, { status: 500 });
  await assert.rejects(mangaApi.invoke('mangadexHome'), /Try again shortly/);
  globalThis.fetch = async () => new Response('<html>Missing</html>', { status: 404 });
  await assert.rejects(mangaApi.invoke('mangadexHome'), /404/);
});
