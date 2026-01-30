import { latestByType } from "../measurements/repo.js";
import { getTodayCalories } from "../meals/controller.js";
import {
  MEASUREMENT_TYPE_WEIGHT,
  MEASUREMENT_TYPE_BP,
  DASHBOARD_LATEST_COUNT,
  CALORIES_TARGET_DEFAULT,
  DASHBOARD_CACHE_TTL_MS,
} from "../../constants.js";

let summaryCache = null;

// Pobiera podsumowanie dzisiejszych danych dla dashboardu (z cache, TTL)
export const getTodaySummary = async () => {
  const now = Date.now();
  if (
    summaryCache &&
    summaryCache.timestamp > 0 &&
    now - summaryCache.timestamp < DASHBOARD_CACHE_TTL_MS
  ) {
    return summaryCache.data;
  }

  const latestWg = await latestByType(MEASUREMENT_TYPE_WEIGHT, DASHBOARD_LATEST_COUNT);
  const latestBp = await latestByType(MEASUREMENT_TYPE_BP, DASHBOARD_LATEST_COUNT);
  const eatenCalories = await getTodayCalories();

  const data = {
    date: new Date(),
    calories: { eaten: eatenCalories, target: CALORIES_TARGET_DEFAULT },
    lastWeight:
      latestWg && latestWg.length > 0
        ? { kg: latestWg[0].value, ts: latestWg[0].ts }
        : null,
    lastBp:
      latestBp && latestBp.length > 0
        ? {
            sys: latestBp[0].value,
            dia: latestBp[0].value2,
            ts: latestBp[0].ts,
          }
        : null,
  };

  summaryCache = { data, timestamp: now };
  return data;
};

// Unieważnia cache podsumowania (np. po dodaniu pomiaru/posiłku)
export const invalidateSummaryCache = () => {
  summaryCache = null;
};
