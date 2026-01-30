import { add as dbAdd, queryIndex } from "../../core/database.js";
import { STORE_MEALS, INDEX_BY_TS, MEAL_TYPE, DEFAULT_LIST_LIMIT } from "../../constants.js";

export const add = (entry) => dbAdd(STORE_MEALS, entry);

export const latestByType = (type, limit = DEFAULT_LIST_LIMIT) =>
  queryIndex(STORE_MEALS, INDEX_BY_TS, {
    direction: "prev",
    limit,
    filter: (v) => v.type === type,
  });

export const getByDateRange = (startTs, endTs) =>
  queryIndex(STORE_MEALS, INDEX_BY_TS, {
    direction: "prev",
    limit: 0,
    filter: (v) => v.type === MEAL_TYPE && v.ts >= startTs && v.ts <= endTs,
    stopWhen: (v) => v.ts < startTs,
  });
