// Manga data is served by functions deployed alongside the Netlify frontend.
export const mangaApi = {
  async invoke(name, body = {}) {
    const response = await fetch(`/.netlify/functions/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.error) {
      throw new Error(data?.error || `Manga service request failed (${response.status}). Please try again.`);
    }
    return { data };
  },
};
