import { createLibraryHandler } from '../lib/library-handler.mjs';
import { libraryStore } from '../lib/library-store.mjs';

export default async req => createLibraryHandler(libraryStore)(req);
