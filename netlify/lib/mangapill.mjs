// Adapted from the attached MIT-licensed MangaPill scraper. See MANGAPILL-LICENSE.
import { load } from 'cheerio';
const ORIGIN = 'https://mangapill.com';
export const encodeId = (path) => `mp_${Buffer.from(path).toString('base64url')}`;
export function decodeId(id, kind) {
  const path = Buffer.from(String(id).slice(3), 'base64url').toString();
  if (!String(id).startsWith('mp_') || !new RegExp(`^/${kind}/[0-9]+(?:-[0-9]+)?/[a-zA-Z0-9-]+$`).test(path)) {
    throw new Error('Invalid MangaPill identifier');
  }
  return path;
}
const image = ($el) => $el.attr('data-src') || $el.attr('src') || '';
export async function page(path) {
  const res = await fetch(ORIGIN + path, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'MangaDesk/1.0', Accept: 'text/html' } });
  if (!res.ok) throw new Error('MangaPill is temporarily unavailable. Please try again.');
  const $ = load(await res.text());
  if (!$('body').length || /just a moment|access denied/i.test($('title').text())) throw new Error('MangaPill is temporarily unavailable. Please try again.');
  return $;
}
export function cards($, root = $('body')) {
  const found = new Map();
  root.find('a[href^="/manga/"]').each((_, el) => {
    const a = $(el), path = a.attr('href');
    if (!/^\/manga\/\d+\/[a-zA-Z0-9-]+$/.test(path)) return;
    const container = a.parent(), img = a.find('img').first();
    const previous = found.get(path);
    const text = container.text();
    const title = (img.attr('alt') || a.text()).trim();
    if (!title) return;
    const type = text.match(/\b(manhwa|manhua|manga)\b/i)?.[1]?.toLowerCase();
    const card = { id: encodeId(path), source: 'MangaPill', title, cover: image(img), country: type === 'manhwa' ? 'KR' : type === 'manhua' ? 'CN' : type === 'manga' ? 'JP' : '??', status: text.match(/\b(publishing|finished|on hiatus)\b/i)?.[0] || '', tags: [], authors: [] };
    // Text links carry a clean title; image links carry the cover.
    found.set(path, previous ? { ...previous, ...(img.length ? { cover: card.cover } : { title: card.title }) } : card);
  });
  return [...found.values()];
}
export function chapters($, mangaId = '', sort = true) {
  const found = new Map();
  $('a[href^="/chapters/"]').each((_, el) => {
    const a = $(el), path = a.attr('href');
    if (!/^\/chapters\/\d+-\d+\/[a-zA-Z0-9-]+$/.test(path)) return;
    const number = path.match(/chapter-(\d+(?:-\d+)?)/)?.[1]?.replace('-', '.');
    found.set(path, { id: encodeId(path), mangaId, label: number ? `Ch. ${number}` : a.text().trim(), title: '', group: 'MangaPill', language: 'en', readableAt: a.find('time').attr('datetime') || '', pages: null, number: Number(number || 0) });
  });
  const result = [...found.values()];
  return sort ? result.sort((a,b) => b.number - a.number) : result;
}
export async function search({ query = '', country = 'ALL', section = 'all', offset = 0, limit = 20 }) {
  const params = new URLSearchParams({ q: query, page: String(Math.floor(offset / limit) + 1) });
  if (country !== 'ALL') params.set('type', { JP: 'manga', KR: 'manhwa', CN: 'manhua' }[country] || 'manga');
  const path = !query && country === 'ALL' && section === 'recently_added' ? '/mangas/new?' : '/search?';
  const $ = await page(path + params);
  const items = cards($);
  const currentPage = Math.floor(offset / limit) + 1;
  const hasNext = $('a[href]').toArray().some(el => {
    const url = new URL($(el).attr('href'), ORIGIN);
    return Number(url.searchParams.get('page')) > currentPage;
  });
  // Upstream page sizes vary; carry its page number independently of displayed counts.
  return { items, total: offset + items.length + (hasNext ? 1 : 0), hasMore: hasNext, nextOffset: offset + limit };
}
export async function title(id) {
  const $ = await page(decodeId(id, 'manga'));
  const name = $('h1').first().text().trim();
  if (!name) throw new Error('MangaPill title was not found.');
  const metadata = label => $('label').filter((_, el) => $(el).text().trim() === label).next().text().trim();
  const type = metadata('Type');
  const manga = { id, source: 'MangaPill', title: name, cover: image($('img').filter((_, el) => !/logo|icon/.test(image($(el)))).first()), description: $('h1').parent().next().text().trim(), country: type === 'manhwa' ? 'KR' : type === 'manhua' ? 'CN' : 'JP', status: metadata('Status'), year: metadata('Year'), tags: $('a[href*="genre="]').map((_,el) => $(el).text().trim()).get(), authors: [] };
  return { manga, chapters: chapters($, id), hasMore: false };
}
export async function chapter(id) {
  const $ = await page(decodeId(id, 'chapters'));
  const mangaLink = $('a[href^="/manga/"]').first();
  const mangaPath = mangaLink.attr('href');
  if (!mangaPath) throw new Error('MangaPill chapter was not found.');
  const pages = [...new Set($('picture img, .reader img, #chapter-container img, img.js-page').map((_, el) => image($(el))).get().filter(url => /^https:\/\//.test(url)))];
  if (!pages.length) throw new Error('MangaPill has no readable pages for this chapter. Please try again.');
  const navigation = word => {
    const href = $('a[href^="/chapters/"]').filter((_, el) => word.test($(el).text())).first().attr('href');
    return href ? encodeId(href) : null;
  };
  return { chapter: { id, mangaId: encodeId(mangaPath), label: $('h1').first().text().trim() || $('title').text().trim(), group: 'MangaPill', pages: pages.length }, mangaTitle: mangaLink.text().trim(), pages, prevId: navigation(/prev/i), nextId: navigation(/next/i) };
}
export async function home() {
  const [homepage, newManga] = await Promise.allSettled([page('/'), page('/mangas/new')]);
  if (homepage.status === 'rejected') throw homepage.reason;
  const $ = homepage.value;
  const recentlyAdded = newManga.status === 'fulfilled' ? cards(newManga.value).slice(0, 10) : [];
  const trendingHeading = $('h4').filter((_, el) => /trending/i.test($(el).text())).first();
  const trending = cards($, trendingHeading.next());
  const all = cards($);
  const heading = $('h4').filter((_, el) => /new chapters/i.test($(el).text())).first();
  const latest = chapters(load(heading.next().html() || ''), '', false).map(c => {
    const path = decodeId(c.id, 'chapters');
    const link = $('a').filter((_, el) => $(el).attr('href') === path).first();
    const container = link.parent().parent();
    const mangaLink = container.find('a[href^="/manga/"]').first();
    return { ...c, mangaId: mangaLink.attr('href') ? encodeId(mangaLink.attr('href')) : '', mangaTitle: mangaLink.text().trim(), cover: image(container.find('img').first()) };
  }).filter(c => c.mangaId).slice(0, 12);
  return { spotlight: (trending.length ? trending : all).slice(0, 5), topRated: [], recentlyAdded, latest };
}
