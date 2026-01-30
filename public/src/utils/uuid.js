/**
 * Generuje unikalny identyfikator (UUID v4 lub fallback gdy brak crypto.randomUUID).
 * @returns {string}
 */
export const uuid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
