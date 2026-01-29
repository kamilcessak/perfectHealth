import { tx } from "../../core/database.js";
import { STORE_MEASUREMENTS, INDEX_BY_TS, DEFAULT_LIST_LIMIT } from "../../constants.js";

// Dodaje nowy pomiar do bazy danych
export const add = async (entry) => {
  const t = await tx(STORE_MEASUREMENTS, "readwrite");

  await new Promise((res, rej) => {
    const req = t.objectStore(STORE_MEASUREMENTS).add(entry);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });

  await new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });

  return entry;
};

// Pobiera najnowsze pomiary danego typu (np. "bp" lub "weight")
export const latestByType = async (type, limit = DEFAULT_LIST_LIMIT) => {
  const t = await tx(STORE_MEASUREMENTS, "readonly");
  const idx = t.objectStore(STORE_MEASUREMENTS).index(INDEX_BY_TS);
  const results = [];

  await new Promise((res, rej) => {
    const req = idx.openCursor(null, "prev");
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return res();
      const v = cur.value;
      if (v.type === type) results.push(v);
      if (results.length >= limit) return res();
      cur.continue();
    };
    req.onerror = () => rej(req.error);
  });

  return results;
};
