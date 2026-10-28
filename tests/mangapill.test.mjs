import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeId, decodeId, title, chapter, search } from '../netlify/lib/mangapill.mjs';
import handler from '../netlify/functions/mangapill.mjs';

const mangaPath = '/manga/2/one-piece';
const newer = '/chapters/2-10002000/one-piece-chapter-2';
const older = '/chapters/2-10001000/one-piece-chapter-1';
test('source identifiers round trip and reject arbitrary upstream paths', () => {
  assert.equal(decodeId(encodeId(mangaPath), 'manga'), mangaPath);
  for (const path of ['//example.com', '/manga/2/../../admin', older]) assert.throws(() => decodeId(encodeId(path), 'manga'));
});
test('normalizes search, chapter order, page images and reader navigation', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async url => {
    const path = new URL(url).pathname;
    const html = path === '/search' ? `<a href="${mangaPath}"><img data-src="https://cdn.example/cover.jpg" alt="One Piece One Piece"></a><div><a href="${mangaPath}">One Piece</a></div><a href="/search?page=2">Next</a>`
      : path === mangaPath ? `<img data-src="https://cdn.example/cover.jpg"><div><h1>One Piece</h1></div><p>Description</p><a href="${older}">Chapter 1</a><a href="${newer}">Chapter 2</a>`
      : `<a href="${mangaPath}">One Piece</a><h1>Chapter 2</h1><picture><img data-src="https://cdn.example/1.jpg"></picture><picture><img src="https://cdn.example/2.jpg"></picture><a href="${older}">Previous</a>`;
    return new Response(html);
  };
  try {
    const result = await search({query: 'One Piece'});
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].title, 'One Piece');
    assert.equal(result.hasMore, true);
    const detail = await title(result.items[0].id);
    assert.equal(detail.chapters[0].id, encodeId(newer));
    assert.equal(detail.chapters.at(-1).id, encodeId(older));
    const reader = await chapter(detail.chapters[0].id);
    assert.equal(reader.chapter.mangaId, result.items[0].id);
    assert.equal(reader.pages.length, 2);
    assert.equal(reader.prevId, encodeId(older));
    assert.equal(reader.nextId, null);
  } finally { globalThis.fetch = original; }
});
test('endpoint rejects unsupported actions and methods', async () => {
  assert.equal((await handler(new Request('https://example.com'))).status, 405);
  const response = await handler(new Request('https://example.com', {method:'POST', body:JSON.stringify({action:'invalid'})}));
  assert.equal(response.status, 400);
});
