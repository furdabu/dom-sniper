import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Capture } from './types';

interface Schema extends DBSchema {
  captures: {
    key: string;
    value: Capture;
    indexes: { createdAt: number };
  };
}

const MAX_CAPTURES = 500;

let dbPromise: Promise<IDBPDatabase<Schema>> | undefined;

function getDb() {
  dbPromise ??= openDB<Schema>('dom-sniper', 1, {
    upgrade(db) {
      db.createObjectStore('captures', { keyPath: 'id' }).createIndex('createdAt', 'createdAt');
    },
  });
  return dbPromise;
}

/** 新しい順 */
export async function listCaptures(): Promise<Capture[]> {
  const db = await getDb();
  return (await db.getAllFromIndex('captures', 'createdAt')).reverse();
}

export async function getCapture(id: string): Promise<Capture | undefined> {
  const db = await getDb();
  return db.get('captures', id);
}

export async function addCapture(capture: Capture): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('captures', 'readwrite');
  await tx.store.put(capture);

  // 上限を超えた分は古い順に削除する
  let excess = (await tx.store.count()) - MAX_CAPTURES;
  let cursor = await tx.store.index('createdAt').openCursor();
  while (cursor && excess-- > 0) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function deleteCapture(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('captures', id);
}

export async function clearCaptures(): Promise<void> {
  const db = await getDb();
  await db.clear('captures');
}
