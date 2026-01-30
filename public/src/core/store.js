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

// Cache: { data, timestamp } lub null
let _bpList = null;
let _weightList = null;
let _mealList = null;
let _summary = null;

const invalidateSummary = () => {
  _summary = null;
};

// --- Odczyt (z cache lub fetch) ---

export const getBpList = async (limit = DEFAULT_LIST_LIMIT) => {
  if (isCacheValid(_bpList, DASHBOARD_CACHE_TTL_MS) && _bpList.limit >= limit) {
    return _bpList.data.slice(0, limit);
  }
  const data = await measurementsController.getBpList(limit);
  _bpList = cacheEntry(data, limit);
  return data;
};

export const getWeightList = async (limit = DEFAULT_LIST_LIMIT) => {
  if (isCacheValid(_weightList, DASHBOARD_CACHE_TTL_MS) && _weightList.limit >= limit) {
    return _weightList.data.slice(0, limit);
  }
  const data = await measurementsController.getWeightList(limit);
  _weightList = cacheEntry(data, limit);
  return data;
};

export const getMealList = async (limit = DEFAULT_LIST_LIMIT) => {
  if (isCacheValid(_mealList, DASHBOARD_CACHE_TTL_MS) && _mealList.limit >= limit) {
    return _mealList.data.slice(0, limit);
  }
  const data = await mealsController.getMealList(limit);
  _mealList = cacheEntry(data, limit);
  return data;
};

export const getTodaySummary = async () => {
  if (isCacheValid(_summary, DASHBOARD_CACHE_TTL_MS)) {
    return _summary.data;
  }
  const data = await dashboardController.getTodaySummary();
  _summary = cacheEntry(data, null);
  return data;
};

// --- Odczyt do wyświetlenia (zwraca { items, error }) ---

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

export const getMealListForDisplay = async (limit = DEFAULT_LIST_LIMIT) => {
  try {
    const items = await getMealList(limit);
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e };
  }
};

// --- Zapis (controller + invalidacja cache) ---

export const addBp = async (data) => {
  const result = await measurementsController.addBp(data);
  _bpList = null;
  invalidateSummary();
  return result;
};

export const addWeight = async (data) => {
  const result = await measurementsController.addWeight(data);
  _weightList = null;
  invalidateSummary();
  return result;
};

export const addMeal = async (data) => {
  const result = await mealsController.addMeal(data);
  _mealList = null;
  invalidateSummary();
  return result;
};

// Opcjonalnie: ręczne unieważnienie cache (np. po odświeżeniu)
export const invalidateLists = () => {
  _bpList = null;
  _weightList = null;
  _mealList = null;
};

export const invalidateAll = () => {
  invalidateLists();
  invalidateSummary();
};
