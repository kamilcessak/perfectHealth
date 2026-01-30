import { newBloodPressure, newWeight } from "./model.js";
import * as repo from "./repo.js";
import {
  assertNumberInRange,
  parseDateTime,
  optionalString,
} from "../../utils/validation.js";
import { rateLimitedFetch } from "../../utils/rateLimit.js";
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
  GEOLOCATION_TIMEOUT_MS,
  NOMINATIM_BASE_URL,
  NOMINATIM_MIN_INTERVAL_MS,
  NOMINATIM_USER_AGENT,
} from "../../constants.js";

export const toTimestamp = (date, time) => parseDateTime(date, time);

/**
 * Zwraca współrzędne z geolokalizacji (navigator.geolocation.getCurrentPosition).
 * @returns {Promise<{ latitude: number; longitude: number }>}
 */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolokacja nie jest obsługiwana przez twoją przeglądarkę"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      reject,
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  });

/**
 * Zwraca adres (reverse geocoding) dla współrzędnych (Nominatim).
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} Adres lub "lat, lon" w razie błędu.
 */
export const resolveAddressFromCoords = async (latitude, longitude) => {
  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  const response = await rateLimitedFetch(url, {
    key: "nominatim",
    minIntervalMs: NOMINATIM_MIN_INTERVAL_MS,
    headers: { "User-Agent": NOMINATIM_USER_AGENT },
  });

  if (!response.ok) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  const data = await response.json();
  const address = data.address;
  if (!address) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  const parts = [];
  if (address.road) parts.push(address.road);
  if (address.house_number) parts.push(address.house_number);
  if (address.city || address.town || address.village) {
    parts.push(address.city || address.town || address.village);
  }
  return (
    parts.join(", ") ||
    data.display_name ||
    `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  );
};

/**
 * Dodaje nowy pomiar ciśnienia krwi (walidacja + repo.add).
 * @param {{ sys: unknown; dia: unknown; date?: string; time?: string; note?: string; location?: string }} data
 * @returns {Promise<object>}
 */
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

/**
 * Dodaje nowy pomiar wagi (walidacja + repo.add).
 * @param {{ kg: unknown; date?: string; time?: string; note?: string }} data
 * @returns {Promise<object>}
 */
export const addWeight = async ({ kg, date, time, note }) => {
  const kgVal = assertNumberInRange(kg, WEIGHT_MIN_KG, WEIGHT_MAX_KG, "Waga (kg)");
  const ts = parseDateTime(date, time);
  const noteStr = optionalString(note, MAX_NOTE_LENGTH);

  const entry = newWeight({ kg: kgVal, ts, note: noteStr });

  return repo.add(entry);
};

/**
 * Pobiera listę pomiarów ciśnienia (najnowsze first).
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const getBpList = (limit = DEFAULT_LIST_LIMIT) => {
  return repo.latestByType(MEASUREMENT_TYPE_BP, limit);
};

/**
 * Pobiera listę pomiarów wagi (najnowsze first).
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const getWeightList = (limit = DEFAULT_LIST_LIMIT) => {
  return repo.latestByType(MEASUREMENT_TYPE_WEIGHT, limit);
};

/**
 * Zwraca dane do wyświetlenia listy pomiarów ciśnienia; { items, error }.
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<{ items: object[]; error: Error|null }>}
 */
export const getBpListForDisplay = async (limit = DEFAULT_LIST_LIMIT) => {
  try {
    const items = await getBpList(limit);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e };
  }
};

export const getWeightListForDisplay = async (limit = DEFAULT_LIST_LIMIT) => {
  try {
    const items = await getWeightList(limit);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e };
  }
};
