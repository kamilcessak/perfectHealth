import { newBloodPressure, newWeight } from "./model.js";
import * as repo from "./repo.js";
import {
  assertNumberInRange,
  parseDateTime,
  optionalString,
} from "../../utils/validation.js";
import {
  BP_SYS_MIN,
  BP_SYS_MAX,
  BP_DIA_MIN,
  BP_DIA_MAX,
  WEIGHT_MIN_KG,
  WEIGHT_MAX_KG,
  MAX_NOTE_LENGTH,
  MAX_LOCATION_LENGTH,
  MEASUREMENT_TYPE_BP,
  MEASUREMENT_TYPE_WEIGHT,
  DEFAULT_LIST_LIMIT,
} from "../../constants.js";

export const toTimestamp = (date, time) => parseDateTime(date, time);

// Dodaje nowy pomiar ciśnienia krwi
export const addBp = async ({ sys, dia, date, time, note, location }) => {
  const sysVal = assertNumberInRange(sys, BP_SYS_MIN, BP_SYS_MAX, "Skurczowe (mmHg)");
  const diaVal = assertNumberInRange(dia, BP_DIA_MIN, BP_DIA_MAX, "Rozkurczowe (mmHg)");
  const ts = parseDateTime(date, time);
  const noteStr = optionalString(note, MAX_NOTE_LENGTH);
  const locationStr = optionalString(location, MAX_LOCATION_LENGTH);

  const entry = newBloodPressure({
    sys: sysVal,
    dia: diaVal,
    ts,
    note: noteStr,
    location: locationStr,
  });

  return repo.add(entry);
};

// Dodaje nowy pomiar wagi
export const addWeight = async ({ kg, date, time, note }) => {
  const kgVal = assertNumberInRange(kg, WEIGHT_MIN_KG, WEIGHT_MAX_KG, "Waga (kg)");
  const ts = parseDateTime(date, time);
  const noteStr = optionalString(note, MAX_NOTE_LENGTH);

  const entry = newWeight({ kg: kgVal, ts, note: noteStr });

  return repo.add(entry);
};

// Pobiera listę pomiarów ciśnienia
export const getBpList = (limit = DEFAULT_LIST_LIMIT) => {
  return repo.latestByType(MEASUREMENT_TYPE_BP, limit);
};

// Pobiera listę pomiarów wagi
export const getWeightList = (limit = DEFAULT_LIST_LIMIT) => {
  return repo.latestByType(MEASUREMENT_TYPE_WEIGHT, limit);
};
