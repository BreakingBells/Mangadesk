import { pgTable, text, timestamp, primaryKey, index, pgEnum } from 'drizzle-orm/pg-core';

export const libraryShelf = pgEnum('library_shelf', ['reading', 'planned', 'completed']);
export const libraryEntries = pgTable('library_entries', {
  ownerHash: text('owner_hash').notNull(),
  mangaId: text('manga_id').notNull(),
  title: text('title').notNull(),
  cover: text('cover').notNull().default(''),
  source: text('source').notNull(),
  country: text('country').notNull().default(''),
  shelf: libraryShelf('shelf').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  primaryKey({ columns: [table.ownerHash, table.mangaId] }),
  index('library_owner_shelf_idx').on(table.ownerHash, table.shelf),
]);
