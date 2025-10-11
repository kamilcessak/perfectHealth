import { newBloodPressure } from "./model.js";
import * as repo from "./repo.js";

export const toTimestamp = (date, time) => {
  if (!date && !time) return Date.now();

  const d = date || new Date().toISOString().slice(0, 10);
  const t = time || "00:00";
  const iso = `${d}T${t}:00`;
  const ts = Date.parse(iso);

  if (!Number.isFinite(ts)) throw new Error("Nieprawidłowa data/godzina");

  return ts;
};

export const addBp = async ({ sys, dia, date, time, note }) => {
  const ts = toTimestamp(date, time);
  const entry = newBloodPressure({ sys, dia, ts, note });

  return repo.add(entry);
};

export const getBp = (limit = 20) => {
  return repo.latestBp(limit);
};
