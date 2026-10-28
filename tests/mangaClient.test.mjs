import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mangaClient } from '../src/api/mangaClient.js';
import dexHandler from '../netlify/functions/mangadex.mjs';

const json = (data, options) => Response.json(data, options);
test('starts both providers concurrently and combines their results', async () => {
  const original = globalThis.fetch;
  const calls = [];
  const pending = [];
  globalThis.fetch = (url, options) => new Promise(resolve => {
    calls.push({ url, body: JSON.parse(options.body) });
    pending.push(resolve);
  });
  try {
    const request = mangaClient.invoke('mangadexSearch', { query: 'test' });
    assert.equal(calls.length, 2, 'both requests start before either resolves');
    assert.deepEqual(calls.map(c => c.url), ['/.netlify/functions/mangadex', '/.netlify/functions/mangapill']);
    pending[0](json({ items: [{id:'dex'}], total: 30 }));
    pending[1](json({ items: [{id:'mp_pill'}], hasMore: true, nextOffset: 20 }));
    const {data} = await request;
    assert.deepEqual(data.items.map(item => item.id), ['dex','mp_pill']);
    assert.deepEqual(data.nextOffset, {mangadex:20, mangapill:20});
  } finally { globalThis.fetch = original; }
});
test('keeps successful results and retries failed sources without skipping pages', async () => {
  const original = globalThis.fetch;
  const calls = [];
  let failed = true;
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({url, offset:body.offset});
    if (url.endsWith('mangapill')) {
      if (failed) return json({error:'unavailable'}, {status:502});
      return json({items:[{id:'mp_retry'}],hasMore:false});
    }
    return json({items:[{id:'dex'}],total:1});
  };
  try {
    const first = (await mangaClient.invoke('mangadexSearch')).data;
    assert.equal(first.items.length,1);
    assert.equal(first.warnings.length,1);
    assert.deepEqual(first.nextOffset,{mangadex:null,mangapill:0});
    failed = false;
    const second = (await mangaClient.invoke('mangadexSearch',{offset:first.nextOffset})).data;
    assert.equal(calls.length,3, 'exhausted source is not requested again');
    assert.equal(calls[2].offset,0);
    assert.equal(second.items[0].id,'mp_retry');
    assert.equal(second.hasMore,false);
  } finally { globalThis.fetch = original; }
});
test('home combines both sources, while reader uses the chapter source', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body); calls.push(url);
    if(body.action === 'chapter') return json({pages:['page.jpg']});
    return json({spotlight:[{id:url.endsWith('mangapill')?'pill':'dex'}],latest:[],topRated:[],recentlyAdded:[]});
  };
  try {
    const home = (await mangaClient.invoke('mangadexHome')).data;
    assert.deepEqual(home.spotlight.map(item=>item.id),['dex','pill']);
    await mangaClient.invoke('mangadexChapter',{id:'mp_test'});
    assert.equal(calls.at(-1),'/.netlify/functions/mangapill');
    await mangaClient.invoke('mangadexChapter',{id:'uuid'});
    assert.equal(calls.at(-1),'/.netlify/functions/mangadex');
    assert.equal(calls.length,4);
  } finally { globalThis.fetch = original; }
});
test('reports both-source failure clearly, including missing API deployments', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('<html>Not found</html>',{status:404});
  try { await assert.rejects(mangaClient.invoke('mangadexSearch'),/Manga sources are temporarily unavailable/); }
  finally { globalThis.fetch = original; }
});
test('Netlify MangaDex endpoint validates requests and calls MangaDex directly', async () => {
  assert.equal((await dexHandler(new Request('https://example.com'))).status,405);
  const req = body => new Request('https://example.com',{method:'POST',body:JSON.stringify(body)});
  assert.equal((await dexHandler(req({action:'unknown'}))).status,400);
  assert.equal((await dexHandler(req({action:'title',id:'invalid'}))).status,400);
  const original = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.equal(new URL(url).origin,'https://api.mangadex.org');
    return json({data:[{id:'dex',attributes:{title:{en:'Example'}}}],total:1});
  };
  try {
    const response = await dexHandler(req({action:'search',query:'Example'}));
    assert.equal(response.status,200);
    assert.equal((await response.json()).items[0].source,'MangaDex');
  } finally { globalThis.fetch = original; }
});
