/**
 * Centralny store – cache list i podsumowania, synchronizacja stanu między widokami.
 * Widoki używają store zamiast bezpośrednio controllerów; zapisy invalidują cache.
 */

import { DASHBOARD_CACHE_TTL_MS, DEFAULT_LIST_LIMIT } from "../constants.js";
import * as measurementsController from "../features/measurements/controller.js";
import * as mealsController from "../features/meals/controller.js";
import * as dashboardController from "../features/dashboard/controller.js";

const isCacheValid = (entry, ttlMs) =>
  entry && entry.timestamp > 0 && Date.now() - entry.timestamp < ttlMs;

const cacheEntry = (data, limit = null) =>
  ({ data, timestamp: Date.now(), limit });

/** @type {{ data: unknown[]; timestamp: number; limit: number | null } | null} Cache listy pomiarów ciśnienia. */
let _bpList = null;
/** @type {{ data: unknown[]; timestamp: number; limit: number | null } | null} Cache listy pomiarów wagi. */
let _weightList = null;
/** @type {{ data: unknown[]; timestamp: number; limit: number | null } | null} Cache listy posiłków. */
let _mealList = null;
/** @type {{ data: object; timestamp: number } | null} Cache podsumowania dashboardu. */
let _summary = null;

const invalidateSummary = () => {
  _summary = null;
};

/**
 * Pobiera listę pomiarów ciśnienia (z cache lub fetch).
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const getBpList = async (limit = DEFAULT_LIST_LIMIT) => {
  if (isCacheValid(_bpList, DASHBOARD_CACHE_TTL_MS) && _bpList.limit >= limit) {
    return _bpList.data.slice(0, limit);
  }
  const data = await measurementsController.getBpList(limit);
  _bpList = cacheEntry(data, limit);
  return data;
};

/**
 * Pobiera listę pomiarów wagi (z cache lub fetch).
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const getWeightList = async (limit = DEFAULT_LIST_LIMIT) => {
  if (isCacheValid(_weightList, DASHBOARD_CACHE_TTL_MS) && _weightList.limit >= limit) {
    return _weightList.data.slice(0, limit);
  }
  const data = await measurementsController.getWeightList(limit);
  _weightList = cacheEntry(data, limit);
  return data;
};

/**
 * Pobiera listę posiłków (z cache lub fetch).
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<object[]>}
 */
export const getMealList = async (limit = DEFAULT_LIST_LIMIT) => {
  if (isCacheValid(_mealList, DASHBOARD_CACHE_TTL_MS) && _mealList.limit >= limit) {
    return _mealList.data.slice(0, limit);
  }
  const data = await mealsController.getMealList(limit);
  _mealList = cacheEntry(data, limit);
  return data;
};

/**
 * Pobiera podsumowanie dzisiejszych danych (z cache lub fetch).
 * @returns {Promise<object>}
 */
export const getTodaySummary = async () => {
  if (isCacheValid(_summary, DASHBOARD_CACHE_TTL_MS)) {
    return _summary.data;
  }
  const data = await dashboardController.getTodaySummary();
  _summary = cacheEntry(data, null);
  return data;
};

/**
 * Pobiera listę pomiarów ciśnienia do wyświetlenia; zwraca { items, error }.
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<{ items: object[]; error: Error | null }>}
 */
export const getBpListForDisplay = async (limit = DEFAULT_LIST_LIMIT) => {
  try {
    const items = await getBpList(limit);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e };
  }
};

/**
 * Pobiera listę pomiarów wagi do wyświetlenia; zwraca { items, error }.
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<{ items: object[]; error: Error | null }>}
 */
export const getWeightListForDisplay = async (limit = DEFAULT_LIST_LIMIT) => {
  try {
    const items = await getWeightList(limit);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e };
  }
};

/**
 * Pobiera listę posiłków do wyświetlenia; zwraca { items, error }.
 * @param {number} [limit=DEFAULT_LIST_LIMIT]
 * @returns {Promise<{ items: object[]; error: Error | null }>}
 */
export const getMealListForDisplay = async (limit = DEFAULT_LIST_LIMIT) => {
  try {
    const items = await getMealList(limit);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e };
  }
};

/**
 * Dodaje pomiar ciśnienia; invaliduje cache list i podsumowania.
 * @param {object} data - Dane pomiaru (sys, dia, date, time, note, location).
 * @returns {Promise<object>}
 */
export const addBp = async (data) => {
  const result = await measurementsController.addBp(data);
  _bpList = null;
  invalidateSummary();
  return result;
};

/**
 * Dodaje pomiar wagi; invaliduje cache list i podsumowania.
 * @param {object} data - Dane pomiaru (kg, date, time, note).
 * @returns {Promise<object>}
 */
export const addWeight = async (data) => {
  const result = await measurementsController.addWeight(data);
  _weightList = null;
  invalidateSummary();
  return result;
};

/**
 * Dodaje posiłek; invaliduje cache list i podsumowania.
 * @param {object} data - Dane posiłku (calories, description, protein, carbs, fats, imageFile, date, time, note).
 * @returns {Promise<object>}
 */
export const addMeal = async (data) => {
  const result = await mealsController.addMeal(data);
  _mealList = null;
  invalidateSummary();
  return result;
};

/**
 * Ręcznie unieważnia cache list (np. po odświeżeniu strony).
 */
export const invalidateLists = () => {
  _bpList = null;
  _weightList = null;
  _mealList = null;
};

export const invalidateAll = () => {
  invalidateLists();
  invalidateSummary();
};
