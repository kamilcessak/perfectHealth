/**
 * Stałe aplikacji PerfectHealth (IndexedDB, typy wpisów, limity, walidacja, router, API).
 */

/** Nazwa bazy IndexedDB. */
export const DB_NAME = "healthDB";
/** Wersja schematu bazy (podbij przy zmianie store/indexów). */
export const DB_VERSION = 2;
/** Nazwa store pomiarów. */
export const STORE_MEASUREMENTS = "measurements";
/** Nazwa store posiłków. */
export const STORE_MEALS = "meals";
/** Nazwa store ustawień. */
export const STORE_SETTINGS = "settings";
/** Nazwa indeksu po czasie (ts). */
export const INDEX_BY_TS = "by_ts";
/** Nazwa indeksu po typie. */
export const INDEX_BY_TYPE = "by_type";

/** Typ wpisu: pomiar ciśnienia krwi. */
export const MEASUREMENT_TYPE_BP = "bp";
/** Typ wpisu: pomiar wagi. */
export const MEASUREMENT_TYPE_WEIGHT = "weight";
/** Typ wpisu: posiłek. */
export const MEAL_TYPE = "meal";

/** Domyślny limit elementów na listach. */
export const DEFAULT_LIST_LIMIT = 20;
/** Limit pobierania posiłków przy liczeniu dzisiejszych kalorii. */
export const MEALS_TODAY_FETCH_LIMIT = 100;
/** Liczba ostatnich pomiarów na dashboardzie (np. ostatnia waga, ostatnie BP). */
export const DASHBOARD_LATEST_COUNT = 1;

/** Domyślny cel kalorii (dashboard). */
export const CALORIES_TARGET_DEFAULT = 2000;
/** Min. kalorie w posiłku. */
export const CALORIES_MIN = 1;
/** Max. kalorie w posiłku. */
export const CALORIES_MAX = 99999;

/** Min. ciśnienie skurczowe (mmHg). */
export const BP_SYS_MIN = 60;
/** Max. ciśnienie skurczowe (mmHg). */
export const BP_SYS_MAX = 250;
/** Min. ciśnienie rozkurczowe (mmHg). */
export const BP_DIA_MIN = 30;
/** Max. ciśnienie rozkurczowe (mmHg). */
export const BP_DIA_MAX = 150;

/** Min. waga (kg). */
export const WEIGHT_MIN_KG = 1;
/** Max. waga (kg). */
export const WEIGHT_MAX_KG = 500;

/** Maks. długość notatki (znaki). */
export const MAX_NOTE_LENGTH = 500;
/** Maks. długość opisu posiłku (znaki). */
export const MAX_DESCRIPTION_LENGTH = 500;
/** Maks. długość lokalizacji (znaki). */
export const MAX_LOCATION_LENGTH = 200;

/** Debounce nawigacji routera (ms). */
export const RENDER_DEBOUNCE_MS = 80;

/** TTL cache podsumowania dashboardu (ms); unikanie re-fetch przy szybkiej nawigacji. */
export const DASHBOARD_CACHE_TTL_MS = 30_000;

/** Timeout geolokalizacji (ms). */
export const GEOLOCATION_TIMEOUT_MS = 10000;

/** Bazowy URL API Nominatim (reverse geocoding). */
export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
/** Min. odstęp między requestami do Nominatim (ms); rate limit. */
export const NOMINATIM_MIN_INTERVAL_MS = 1000;
/** User-Agent dla requestów do Nominatim (wymagany przez API). */
export const NOMINATIM_USER_AGENT = "PerfectHealth/1.0 (health tracker; contact: local)";

/** Maks. rozmiar pliku obrazu na wejściu (bajty). */
export const MAX_IMAGE_INPUT_SIZE = 10 * 1024 * 1024;
/** Maks. wymiar obrazu po resize (px). */
export const MAX_IMAGE_DIMENSION = 1024;
/** Jakość JPEG przy kompresji (0–1). */
export const IMAGE_JPEG_QUALITY = 0.82;
/** Docelowy maks. rozmiar obrazu wyjściowego (bajty). */
export const MAX_IMAGE_OUTPUT_SIZE = 800 * 1024;
