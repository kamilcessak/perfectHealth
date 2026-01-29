import {
  DB_NAME,
  DB_VERSION,
  STORE_MEASUREMENTS,
  STORE_MEALS,
  STORE_SETTINGS,
  INDEX_BY_TS,
  INDEX_BY_TYPE,
} from "../constants.js";

let _database;

// Inicjalizacja połączenia z IndexedDB i utworzenie potrzebnych tabeli
export const database = async () => {
  if (_database) return _database;

  _database = await new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE_MEASUREMENTS)) {
        const s = d.createObjectStore(STORE_MEASUREMENTS, { keyPath: "id" });
        s.createIndex(INDEX_BY_TS, "ts", { unique: false });
        s.createIndex(INDEX_BY_TYPE, "type", { unique: false });
      }
      if (!d.objectStoreNames.contains(STORE_MEALS)) {
        const s = d.createObjectStore(STORE_MEALS, { keyPath: "id" });
        s.createIndex(INDEX_BY_TS, "ts", { unique: false });
        s.createIndex(INDEX_BY_TYPE, "type", { unique: false });
      }
      if (!d.objectStoreNames.contains(STORE_SETTINGS)) {
        d.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });

  return _database;
};

// Transakcja do operacji na bazie danych
export const tx = (store, mode = "readonly") => {
  return database().then((d) => d.transaction(store, mode));
};
