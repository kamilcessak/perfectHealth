import {
  DB_NAME,
  DB_VERSION,
  STORE_MEASUREMENTS,
  STORE_MEALS,
  STORE_SETTINGS,
  INDEX_BY_TS,
  INDEX_BY_TYPE,
} from "../constants.js";

/**
 * Schemat bazy: store → { keyPath, indexes }.
 * Przy podbiciu DB_VERSION dodaj nowe indeksy tutaj – zostaną utworzone także w istniejących store'ach.
 */
const SCHEMA = {
  [STORE_MEASUREMENTS]: {
    keyPath: "id",
    indexes: [
      { name: INDEX_BY_TS, keyPath: "ts", unique: false },
      { name: INDEX_BY_TYPE, keyPath: "type", unique: false },
    ],
  },
  [STORE_MEALS]: {
    keyPath: "id",
    indexes: [
      { name: INDEX_BY_TS, keyPath: "ts", unique: false },
      { name: INDEX_BY_TYPE, keyPath: "type", unique: false },
    ],
  },
  [STORE_SETTINGS]: {
    keyPath: "key",
    indexes: [],
  },
};

let _dbPromise = null;

export const database = () => {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      const transaction = event.target.transaction;
      for (const [storeName, { keyPath, indexes }] of Object.entries(SCHEMA)) {
        const store = db.objectStoreNames.contains(storeName)
          ? transaction.objectStore(storeName)
          : db.createObjectStore(storeName, { keyPath });
        for (const idx of indexes) {
          if (!store.indexNames.contains(idx.name)) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
          }
        }
      }
    };

    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

  return _dbPromise;
};

/**
 * Zwraca Promise transakcji IndexedDB dla danego store.
 * @param {string|string[]} store - Nazwa store lub tablica nazw.
 * @param {IDBTransactionMode} [mode="readonly"] - Tryb transakcji.
 * @returns {Promise<IDBTransaction>}
 */
export const tx = (store, mode = "readonly") => {
  return database().then((d) => d.transaction(store, mode));
};

/**
 * Dodaje wpis do store. Zwraca ten sam obiekt entry.
 * @param {string} storeName - Nazwa object store.
 * @param {object} entry - Obiekt do zapisania (musi mieć keyPath).
 * @returns {Promise<object>} Ten sam obiekt entry.
 */
export const add = async (storeName, entry) => {
  const t = await tx(storeName, "readwrite");
  await new Promise((res, rej) => {
    const req = t.objectStore(storeName).add(entry);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
  await new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
  return entry;
};

/**
 * Iteruje po indeksie; opcjonalnie filtruje i ogranicza wyniki.
 * @param {string} storeName - Nazwa object store.
 * @param {string} indexName - Nazwa indeksu.
 * @param {object} [opts] - Opcje: direction, limit, filter(v), stopWhen(v).
 * @returns {Promise<object[]>} Tablica wyników.
 */
export const queryIndex = async (
  storeName,
  indexName,
  { direction = "prev", limit = 0, filter = null, stopWhen = null } = {}
) => {
  const t = await tx(storeName, "readonly");
  const idx = t.objectStore(storeName).index(indexName);
  const results = [];

  await new Promise((res, rej) => {
    const req = idx.openCursor(null, direction);
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return res();

      const v = cur.value;
      if (stopWhen && stopWhen(v)) return res();
      if (!filter || filter(v)) results.push(v);
      if (limit > 0 && results.length >= limit) return res();
      cur.continue();
    };
    req.onerror = () => rej(req.error);
  });

  return results;
};
