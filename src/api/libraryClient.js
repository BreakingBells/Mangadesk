async function request(method = 'GET', body) {
  const response = await fetch('/.netlify/functions/library', {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Your library is temporarily unavailable. Please try again.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to update your library.');
  return data;
}
export const libraryClient = {
  list: async () => (await request()).items,
  save: async (manga, shelf) => (await request('POST', { id: manga.id, title: manga.title, cover: manga.cover || '', country: manga.country || '', shelf })).item,
  remove: async id => request('DELETE', { id }),
};
