/**
 * Repozytorium posiłków – zapis i odczyt z IndexedDB.
 */
import { add as dbAdd, queryIndex } from "../../core/database.js";
import { STORE_MEALS, INDEX_BY_TS, MEAL_TYPE, DEFAULT_LIST_LIMIT } from "../../constants.js";

/**
 * Dodaje wpis posiłku do bazy.
 * @param {object} entry - Obiekt posiłku (id, type, calories, description, …).
 * @returns {Promise<object>}
 */
export const add = (entry) => dbAdd(STORE_MEALS, entry);

/**
 * Pobiera najnowsze posiłki (po indeksie by_ts, malejąco).
 * @param {string} type - MEAL_TYPE.
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const latestByType = (type, limit = DEFAULT_LIST_LIMIT) =>
  queryIndex(STORE_MEALS, INDEX_BY_TS, {
    direction: "prev",
    limit,
    filter: (v) => v.type === type,
  });

/**
 * Pobiera posiłki z zakresu czasowego [startTs, endTs].
 * @param {number} startTs - Początek zakresu (ms).
 * @param {number} endTs - Koniec zakresu (ms).
 * @returns {Promise<object[]>}
 */
export const getByDateRange = (startTs, endTs) =>
  queryIndex(STORE_MEALS, INDEX_BY_TS, {
    direction: "prev",
    limit: 0,
    filter: (v) => v.type === MEAL_TYPE && v.ts >= startTs && v.ts <= endTs,
    stopWhen: (v) => v.ts < startTs,
  });
