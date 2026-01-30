/**
 * Zwraca wersję funkcji opóźnioną o ms; kolejne wywołania resetują timer.
 * @param {(...args: unknown[]) => void} fn - Funkcja do opóźnienia.
 * @param {number} ms - Opóźnienie (ms).
 * @returns {(...args: unknown[]) => void}
 */
export const debounce = (fn, ms) => {
  let timeoutId = null;

  const debounced = (...args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, ms);
  };

  return debounced;
};
