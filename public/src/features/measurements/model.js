import { uuid } from "../../utils/uuid.js";
import {
  MEASUREMENT_TYPE_BP,
  MEASUREMENT_TYPE_WEIGHT,
  BP_SYS_MIN,
  BP_SYS_MAX,
  BP_DIA_MIN,
  BP_DIA_MAX,
  WEIGHT_MIN_KG,
  WEIGHT_MAX_KG,
  MAX_NOTE_LENGTH,
  MAX_LOCATION_LENGTH,
} from "../../constants.js";

/**
 * Waliduje dane pomiaru ciśnienia krwi (type, value, value2, ts, note, location); rzuca Error w przeciwnym razie.
 * @param {object} e - Obiekt pomiaru BP.
 * @returns {object} Ten sam obiekt.
 */
export const validateBloodPreassure = (e) => {
  if (e.type !== MEASUREMENT_TYPE_BP) throw new Error("Nieprawidłowy typ pomiaru");
  if (!Number.isFinite(e.value) || !Number.isFinite(e.value2))
    throw new Error("Podaj prawidłowe liczby ciśnienia");
  if (e.value < BP_SYS_MIN || e.value > BP_SYS_MAX)
    throw new Error(`Wartość skurczowa poza zakresem (${BP_SYS_MIN}-${BP_SYS_MAX})`);
  if (e.value2 < BP_DIA_MIN || e.value2 > BP_DIA_MAX)
    throw new Error(`Wartość rozkurczowa poza zakresem (${BP_DIA_MIN}-${BP_DIA_MAX})`);
  if (!Number.isFinite(e.ts)) throw new Error("Nieprawidłowa data");
  if (e.note.length > MAX_NOTE_LENGTH)
    throw new Error(`Notatka może mieć co najwyżej ${MAX_NOTE_LENGTH} znaków.`);
  if (e.location.length > MAX_LOCATION_LENGTH)
    throw new Error(`Lokalizacja może mieć co najwyżej ${MAX_LOCATION_LENGTH} znaków.`);

  return e;
};

/**
 * Waliduje dane pomiaru wagi (type, value, ts, note); rzuca Error w przeciwnym razie.
 * @param {object} e - Obiekt pomiaru wagi.
 * @returns {object} Ten sam obiekt.
 */
export const validateWeight = (e) => {
  if (e.type !== MEASUREMENT_TYPE_WEIGHT) throw new Error("Nieprawidłowy typ pomiaru");
  if (!Number.isFinite(e.value)) throw new Error("Podaj poprawną wartość wagi");
  if (e.value <= 0 || e.value > WEIGHT_MAX_KG)
    throw new Error(`Waga poza zakresem (${WEIGHT_MIN_KG} - ${WEIGHT_MAX_KG})kg`);
  if (!Number.isFinite(e.ts)) throw new Error("Nieprawidłowa Data");
  if (e.note.length > MAX_NOTE_LENGTH)
    throw new Error(`Notatka może mieć co najwyżej ${MAX_NOTE_LENGTH} znaków.`);

  return e;
};

/**
 * Tworzy nowy obiekt pomiaru ciśnienia krwi z walidacją (id, type, value, value2, ts, note, location).
 * @param {{ sys: number; dia: number; ts?: number; note?: string; location?: string }} opts
 * @returns {object}
 */
export const newBloodPressure = ({ sys, dia, ts = Date.now(), note = "", location = "" }) => {
  const result = {
    id: uuid(),
    type: MEASUREMENT_TYPE_BP,
    value: +sys,
    value2: +dia,
    ts: +ts,
    note: `${note}`,
    location: `${location}`,
  };

  return validateBloodPreassure(result);
};

/**
 * Tworzy nowy obiekt pomiaru wagi z walidacją (id, type, value, ts, note).
 * @param {{ kg: number; ts?: number; note?: string }} opts
 * @returns {object}
 */
export const newWeight = ({ kg, ts = Date.now(), note = "" }) => {
  const result = {
    id: uuid(),
    type: MEASUREMENT_TYPE_WEIGHT,
    value: +kg,
    ts: +ts,
    note: `${note}`,
  };

  return validateWeight(result);
};
