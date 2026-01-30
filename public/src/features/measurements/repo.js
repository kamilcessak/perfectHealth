/**
 * Repozytorium pomiarów (ciśnienie, waga) – zapis i odczyt z IndexedDB.
 */
import { add as dbAdd, queryIndex } from "../../core/database.js";
import { STORE_MEASUREMENTS, INDEX_BY_TS, DEFAULT_LIST_LIMIT } from "../../constants.js";

/**
 * Dodaje wpis pomiaru do bazy.
 * @param {object} entry - Obiekt pomiaru (id, type, value, ts, note, …).
 * @returns {Promise<object>}
 */
export const add = (entry) => dbAdd(STORE_MEASUREMENTS, entry);

/**
 * Pobiera najnowsze pomiary danego typu (po indeksie by_ts, malejąco).
 * @param {string} type - MEASUREMENT_TYPE_BP lub MEASUREMENT_TYPE_WEIGHT.
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const latestByType = (type, limit = DEFAULT_LIST_LIMIT) =>
  queryIndex(STORE_MEASUREMENTS, INDEX_BY_TS, {
    direction: "prev",
    limit,
    filter: (v) => v.type === type,
  });
