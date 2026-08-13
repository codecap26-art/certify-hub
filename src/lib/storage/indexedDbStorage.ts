import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'CertifyHubDB_v1';
const STORE_NAME = 'template_assets';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveAssetToIndexedDB(key: string, value: string): Promise<boolean> {
  try {
    const db = await getDB();
    if (!db) return false;
    await db.put(STORE_NAME, value, key);
    return true;
  } catch (error) {
    console.error(`Failed to save asset "${key}" to IndexedDB:`, error);
    return false;
  }
}

export async function getAssetFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    if (!db) return null;
    const value = await db.get(STORE_NAME, key);
    return (value as string) || null;
  } catch (error) {
    console.error(`Failed to read asset "${key}" from IndexedDB:`, error);
    return null;
  }
}

export async function removeAssetFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    await db.delete(STORE_NAME, key);
  } catch (error) {
    console.error(`Failed to remove asset "${key}" from IndexedDB:`, error);
  }
}
