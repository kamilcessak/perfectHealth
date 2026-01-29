import { tx } from "../../core/database.js";
import { STORE_MEALS, INDEX_BY_TS, MEAL_TYPE, DEFAULT_LIST_LIMIT } from "../../constants.js";

// Dodaje nowy posiłek do bazy danych
export const add = async (entry) => {
  const t = await tx(STORE_MEALS, "readwrite");

  await new Promise((res, rej) => {
    const req = t.objectStore(STORE_MEALS).add(entry);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });

  await new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });

  return entry;
};

// Pobiera najnowsze posiłki danego typu
export const latestByType = async (type, limit = DEFAULT_LIST_LIMIT) => {
  const t = await tx(STORE_MEALS, "readonly");
  const idx = t.objectStore(STORE_MEALS).index(INDEX_BY_TS);
  const results = [];

  await new Promise((res, rej) => {
    const req = idx.openCursor(null, "prev");
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return res();
      const v = cur.value;
      if (v.type === type) {
        results.push(v);
      }
      if (results.length >= limit) return res();
      cur.continue();
    };
    req.onerror = () => rej(req.error);
  });

  return results;
};

// Pobiera posiłki z określonego zakresu dat
export const getByDateRange = async (startTs, endTs) => {
  const t = await tx(STORE_MEALS, "readonly");
  const idx = t.objectStore(STORE_MEALS).index(INDEX_BY_TS);
  const results = [];

  await new Promise((res, rej) => {
    const req = idx.openCursor(null, "prev");
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return res();
      const v = cur.value;

      if (v.type === MEAL_TYPE && v.ts >= startTs && v.ts <= endTs) {
        results.push(v);
      }

      if (v.ts >= startTs) {
        cur.continue();
      } else {
        res();
      }
    };
    req.onerror = () => rej(req.error);
  });

  return results;
};
