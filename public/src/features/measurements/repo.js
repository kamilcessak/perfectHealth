import { add as dbAdd, queryIndex } from "../../core/database.js";
import { STORE_MEASUREMENTS, INDEX_BY_TS, DEFAULT_LIST_LIMIT } from "../../constants.js";

export const add = (entry) => dbAdd(STORE_MEASUREMENTS, entry);

export const latestByType = (type, limit = DEFAULT_LIST_LIMIT) =>
  queryIndex(STORE_MEASUREMENTS, INDEX_BY_TS, {
    direction: "prev",
    limit,
    filter: (v) => v.type === type,
  });
