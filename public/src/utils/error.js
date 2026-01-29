// Zwraca komunikat błędu bezpieczny do wyświetlenia użytkownikowi.
export const getErrorMessage = (error) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error ?? "Wystąpił nieznany błąd");
};

// Escape HTML ochrona XSS
export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const TRUSTED = Symbol("trusted");

// Oznacza wartość jako zaufaną (np. data URL)
export const trusted = (value) => ({ [TRUSTED]: true, value: String(value ?? "") });

export const safeHtml = (strings, ...values) => {
  const processed = values.map((v) =>
    v != null && typeof v === "object" && TRUSTED in v && v[TRUSTED] === true ? v.value : escapeHtml(String(v ?? ""))
  );
  return strings.reduce((acc, s, i) => acc + s + (processed[i] ?? ""), "");
};
