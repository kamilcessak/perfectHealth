/**
 * Zwraca komunikat błędu bezpieczny do wyświetlenia użytkownikowi (bez wrażliwych danych).
 * @param {Error|string|unknown} error - Błąd (Error, string lub inny).
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error ?? "Wystąpił nieznany błąd");
};

/**
 * Zamienia znaki specjalne HTML na encje (ochrona przed XSS).
 * @param {string} s - Tekst do escapowania.
 * @returns {string}
 */
export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const TRUSTED = Symbol("trusted");

/**
 * Oznacza wartość jako zaufaną (np. data URL) – nie będzie escapowana w safeHtml.
 * @param {string} value - Wartość zaufana (np. data:image/...).
 * @returns {{ [TRUSTED]: true; value: string }}
 */
export const trusted = (value) => ({ [TRUSTED]: true, value: String(value ?? "") });

/**
 * Szablon literałowy: łączy stringi z wartościami; wartości są escapowane (escapeHtml), chyba że opakowane w trusted().
 * @param {TemplateStringsArray} strings
 * @param {...(string|{ [TRUSTED]: true; value: string })} values - Wartości (escapowane) lub trusted(value).
 * @returns {string}
 */
export const safeHtml = (strings, ...values) => {
  const processed = values.map((v) =>
    v != null && typeof v === "object" && TRUSTED in v && v[TRUSTED] === true ? v.value : escapeHtml(String(v ?? ""))
  );
  return strings.reduce((acc, s, i) => acc + s + (processed[i] ?? ""), "");
};
