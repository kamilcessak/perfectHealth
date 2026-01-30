import { latestByType } from "../measurements/repo.js";
import { getTodayCalories } from "../meals/controller.js";
import {
  MEASUREMENT_TYPE_WEIGHT,
  MEASUREMENT_TYPE_BP,
  DASHBOARD_LATEST_COUNT,
  CALORIES_TARGET_DEFAULT,
} from "../../constants.js";

/**
 * Pobiera podsumowanie dzisiejszych danych (ostatnia waga, ostatnie BP, kalorie); cache w core/store.js.
 * @returns {Promise<{ date: Date; calories: { eaten: number; target: number }; lastWeight: object|null; lastBp: object|null }>}
 */
export const getTodaySummary = async () => {
  const latestWg = await latestByType(MEASUREMENT_TYPE_WEIGHT, DASHBOARD_LATEST_COUNT);
  const latestBp = await latestByType(MEASUREMENT_TYPE_BP, DASHBOARD_LATEST_COUNT);
  const eatenCalories = await getTodayCalories();

  return {
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
};
