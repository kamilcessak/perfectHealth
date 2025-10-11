export const getTodaySummary = async () => {
  return {
    date: new Date(),
    calories: { eaten: 1000, target: 2000 },
    lastWeight: { kg: 90, ts: Date.now() - 1000 * 60 * 60 * 24 },
    lastBp: { sys: 120, dia: 80, ts: Date.now() - 100 * 60 * 60 * 3 },
  };
};
