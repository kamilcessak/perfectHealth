const trim = (v) => (typeof v === "string" ? v.trim() : v);

/**
 * Wymagane pole – nie puste po trim; rzuca Error w przeciwnym razie.
 * @param {unknown} value - Wartość (string po trim).
 * @param {string} fieldName - Nazwa pola (do komunikatu błędu).
 * @returns {string}
 */
export const assertRequired = (value, fieldName) => {
  const s = value != null ? trim(String(value)) : "";
  if (s === "") {
    throw new Error(`Pole "${fieldName}" jest wymagane.`);
  }
  return s;
};

/**
 * Liczba w zakresie [min, max]; rzuca Error w przeciwnym razie.
 * @param {unknown} value - Wartość (liczba).
 * @param {number} min - Min. włącznie.
 * @param {number} max - Max. włącznie.
 * @param {string} fieldName - Nazwa pola (do komunikatu błędu).
 * @returns {number}
 */
export const assertNumberInRange = (value, min, max, fieldName) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Pole "${fieldName}" musi być liczbą.`);
  }
  if (n < min || n > max) {
    throw new Error(`Pole "${fieldName}" musi być od ${min} do ${max}.`);
  }
  return n;
};

/**
 * Liczba większa lub równa zero; rzuca Error w przeciwnym razie.
 * @param {unknown} value - Wartość (liczba).
 * @param {string} fieldName - Nazwa pola (do komunikatu błędu).
 * @returns {number}
 */
export const assertNonNegativeNumber = (value, fieldName) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Pole "${fieldName}" musi być liczbą nieujemną.`);
  }
  return n;
};

/**
 * Maksymalna długość tekstu; rzuca Error gdy przekroczona.
 * @param {unknown} value - Wartość (string).
 * @param {number} maxLength - Maks. liczba znaków.
 * @param {string} fieldName - Nazwa pola (do komunikatu błędu).
 * @returns {string}
 */
export const assertMaxLength = (value, maxLength, fieldName) => {
  const s = value != null ? String(value) : "";
  if (s.length > maxLength) {
    throw new Error(`Pole "${fieldName}" może mieć co najwyżej ${maxLength} znaków.`);
  }
  return s;
};

/**
 * Opcjonalny tekst – zwraca trim lub ""; rzuca Error gdy przekroczony maxLength.
 * @param {unknown} value - Wartość (string).
 * @param {number} [maxLength=0] - Maks. długość (0 = bez limitu).
 * @returns {string}
 */
export const optionalString = (value, maxLength = 0) => {
  const s = value != null ? trim(String(value)) : "";
  if (maxLength > 0 && s.length > maxLength) {
    throw new Error(`Tekst może mieć co najwyżej ${maxLength} znaków.`);
  }
  return s;
};

/**
 * Walidacja daty i godziny – zwraca timestamp (lub Date.now() jeśli oba puste).
 * @param {string|undefined} date - Data RRRR-MM-DD.
 * @param {string|undefined} time - Godzina GG:MM.
 * @returns {number} Timestamp (ms).
 */
export const parseDateTime = (date, time) => {
  const hasDate = date != null && trim(String(date)) !== "";
  const hasTime = time != null && trim(String(time)) !== "";

  if (!hasDate && !hasTime) return Date.now();

  const d = hasDate ? trim(String(date)) : new Date().toISOString().slice(0, 10);
  const t = hasTime ? trim(String(time)) : "00:00";

  const parts = d.split("-").map(Number);
  const [year, month, day] = parts;
  if (parts.length !== 3 || !Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error("Nieprawidłowy format daty (oczekiwano RRRR-MM-DD).");
  }

  const timeParts = t.split(":").map(Number);
  const hours = timeParts[0] ?? 0;
  const minutes = timeParts[1] ?? 0;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Nieprawidłowa godzina (oczekiwano GG:MM).");
  }

  const localDate = new Date(year, month - 1, day, hours, minutes);
  const ts = localDate.getTime();
  if (!Number.isFinite(ts)) {
    throw new Error("Nieprawidłowa data lub godzina.");
  }
  return ts;
};

/** Maks. rozmiar pliku obrazu wejściowego (bajty). */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
/** Dozwolone typy MIME dla zdjęć. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Waliduje plik obrazu: musi być instancją File, dozwolony typ i rozmiar; rzuca Error w przeciwnym razie.
 * @param {File|null|undefined} file - Plik do walidacji.
 * @param {number} [maxSize=MAX_IMAGE_SIZE] - Maks. rozmiar (bajty).
 * @returns {File|null} Ten sam plik lub null gdy file jest null/undefined lub pusty.
 */
export const assertImageFile = (file, maxSize = MAX_IMAGE_SIZE) => {
  if (file == null) return null;
  if (!(file instanceof File)) {
    throw new Error("Zdjęcie musi być plikiem (nie tekstem ani innym obiektem).");
  }
  if (file.size === 0) return null;

  const type = file.type && String(file.type).toLowerCase().trim();
  if (!type || !ALLOWED_IMAGE_TYPES.includes(type)) {
    throw new Error("Dozwolone formaty zdjęć: JPG, PNG, WebP, GIF.");
  }
  if (file.size > maxSize) {
    throw new Error(`Zdjęcie może mieć co najwyżej ${Math.round(maxSize / 1024 / 1024)} MB.`);
  }
  return file;
};

export const isValidImageBlob = (value) =>
  value == null ||
  (value instanceof Blob && value.type.startsWith("image/"));
