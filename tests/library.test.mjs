import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibraryHandler } from '../netlify/lib/library-handler.mjs';

const id = '11111111-1111-4111-8111-111111111111';
const pillId = 'mp_' + Buffer.from('/manga/2/one-piece').toString('base64url');
const makeRequest = (method = 'GET', cookie, body, origin = 'https://example.com') => new Request('https://example.com/.netlify/functions/library', {
  method,
  headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), origin },
  body: body !== undefined ? JSON.stringify(body) : undefined,
});
function fixture() {
  // Test double only: production persistence uses Netlify Database.
  const rows = new Map();
  const handler = createLibraryHandler({
    async list(owner) { return [...rows.values()].filter(row => row.owner === owner).map(({owner: _, ...entry}) => entry); },
    async save(owner, entry) { rows.set(owner + entry.id, {owner, ...entry}); return entry; },
    async remove(owner, mangaId) { rows.delete(owner + mangaId); },
  });
  return { handler, rows };
}
async function browser(handler) {
  const response = await handler(makeRequest());
  const value = response.headers.get('set-cookie');
  assert.ok(value?.includes('HttpOnly') && value.includes('SameSite=Lax') && value.includes('Secure'));
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  return value.split(';')[0];
}
test('saves both providers, moves shelves without duplication, and isolates browsers', async () => {
  const { handler, rows } = fixture();
  const first = await browser(handler), second = await browser(handler);
  const manga = {id, title:'Example', shelf:'reading', ownerHash:'untrusted'};
  let response = await handler(makeRequest('POST',first,manga));
  assert.equal(response.status,200);
  assert.equal((await response.json()).item.source,'MangaDex');
  await handler(makeRequest('POST', first, {...manga,shelf:'completed'}));
  assert.equal(rows.size,1);
  await handler(makeRequest('POST',first,{id:pillId,title:'One Piece',shelf:'planned'}));
  const entries = (await (await handler(makeRequest('GET',first))).json()).items;
  assert.equal(entries.length,2);
  assert.equal(entries.find(entry=>entry.id===id).shelf,'completed');
  assert.equal(entries.find(entry=>entry.id===pillId).source,'MangaPill');
  assert.ok(entries.every(entry=>!('ownerHash' in entry) && !('owner' in entry)));
  const other = await (await handler(makeRequest('GET',second))).json();
  assert.equal(other.items.length,0);
  await handler(makeRequest('DELETE',second,{id}));
  assert.equal(rows.size,2);
  await handler(makeRequest('DELETE',first,{id}));
  assert.equal(rows.size,1);
});
test('rejects bad shelves, unsafe URLs, invalid ids, and cross-site writes', async () => {
  const { handler, rows } = fixture();
  const cookie = await browser(handler);
  const base = {id,title:'Example',shelf:'reading'};
  for(const body of [{...base,shelf:'other'}, {...base,id:'invalid'}, {...base,title:''}, {...base,cover:'javascript:alert(1)'}]) {
    assert.equal((await handler(makeRequest('POST',cookie,body))).status,400);
  }
  assert.equal((await handler(makeRequest('POST',cookie,base,'https://other.example'))).status,403);
  assert.equal(rows.size,0);
  assert.equal((await handler(makeRequest('PATCH',cookie,base))).status,405);
});
test('returns a safe error when persistence fails', async () => {
  const handler = createLibraryHandler({save:async()=>{throw new Error('Internal database failure');}});
  const response = await handler(makeRequest('POST',undefined,{id,title:'Example',shelf:'reading'}));
  assert.equal(response.status,503);
  assert.ok(!(await response.text()).includes('Internal database failure'));
  assert.ok(!response.headers.has('set-cookie'));
});
