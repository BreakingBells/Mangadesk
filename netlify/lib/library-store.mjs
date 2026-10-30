import { and, eq, desc } from 'drizzle-orm';
import { getDb } from '../../db/index.ts';
import { libraryEntries } from '../../db/schema.ts';

const publicFields = {
  id: libraryEntries.mangaId, title: libraryEntries.title, cover: libraryEntries.cover,
  source: libraryEntries.source, country: libraryEntries.country, shelf: libraryEntries.shelf,
  updatedAt: libraryEntries.updatedAt,
};
export const libraryStore = {
  list(ownerHash) {
    return getDb().select(publicFields).from(libraryEntries)
      .where(eq(libraryEntries.ownerHash, ownerHash)).orderBy(desc(libraryEntries.updatedAt));
  },
  async save(ownerHash, entry) {
    const { id, ...fields } = entry;
    const [saved] = await getDb().insert(libraryEntries).values({ ownerHash, mangaId: id, ...fields })
      .onConflictDoUpdate({ target: [libraryEntries.ownerHash, libraryEntries.mangaId], set: { ...fields, updatedAt: new Date() } })
      .returning(publicFields);
    return saved;
  },
  async remove(ownerHash, id) {
    await getDb().delete(libraryEntries).where(and(eq(libraryEntries.ownerHash, ownerHash), eq(libraryEntries.mangaId, id)));
  },
};
