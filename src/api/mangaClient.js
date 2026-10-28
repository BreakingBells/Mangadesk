async function requestSource(source, action, params) {
  const response = await fetch(`/.netlify/functions/${source}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, action }), signal: AbortSignal.timeout(25000),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Manga API is unavailable. Please try again.');
  }
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'Manga API is temporarily unavailable.');
  return data;
}
const interleave = (a = [], b = []) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]]).flat().filter(Boolean);

export const mangaClient = {
  async invoke(name, params = {}) {
    const action = name.replace('mangadex', '').toLowerCase();
    if (action === 'title' || action === 'chapter') {
      return { data: await requestSource(params.id?.startsWith('mp_') ? 'mangapill' : 'mangadex', action, params) };
    }
    const source = params.source || 'all';
    const limit = 20;
    const suppliedOffsets = typeof params.offset === 'object' && params.offset !== null ? params.offset : {};
    const offsets = Object.fromEntries(['mangadex', 'mangapill'].map(key => [key, Object.hasOwn(suppliedOffsets, key) ? suppliedOffsets[key] : Number(params.offset) || 0]));
    const providers = [
      { key: 'mangadex', name: 'MangaDex' },
      { key: 'mangapill', name: 'MangaPill' },
    ].filter(provider => (source === 'all' || source === provider.key)
      && (action !== 'search' || offsets[provider.key] !== null)
      // MangaPill has no ratings, so the rated shelf uses MangaDex.
      && !(provider.key === 'mangapill' && action === 'search' && params.section === 'top_rated'));
    if (!providers.length) return { data: { items: [], total: 0, nextOffset: offsets, hasMore: false, warnings: source === 'mangapill' && params.section === 'top_rated' ? ['MangaPill does not provide a Top Rated shelf. Choose Everything or New.'] : [] } };
    // Start both requests before awaiting either provider.
    const results = await Promise.allSettled(providers.map(provider => requestSource(provider.key, action, { ...params, offset: offsets[provider.key], limit })));
    const warnings = results.flatMap((result, i) => result.status === 'rejected' ? [`${providers[i].name} is temporarily unavailable. Other available results are shown.`] : []);
    const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value);
    if (!successful.length) throw new Error('Manga sources are temporarily unavailable. Please try again.');
    if (action === 'home') {
      const merged = { warnings };
      for (const key of ['spotlight', 'latest', 'topRated', 'recentlyAdded']) merged[key] = successful.reduce((items, value) => interleave(items, value[key]), []);
      return { data: merged };
    }
    const nextOffset = { ...offsets };
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled') return; // Retry this source at the same position.
      const key = providers[index].key;
      const data = result.value;
      const hasMore = data.hasMore ?? (offsets[key] + limit < data.total);
      nextOffset[key] = hasMore ? (data.nextOffset ?? offsets[key] + limit) : null;
    });
    return { data: {
      items: successful.reduce((items, value) => interleave(items, value.items), []),
      total: successful.reduce((sum, value) => sum + (value.total || 0), 0),
      nextOffset, hasMore: providers.some(provider => nextOffset[provider.key] !== null), warnings,
    } };
  },
};
