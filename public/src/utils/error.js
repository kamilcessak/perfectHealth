// Zwraca komunikat błędu bezpieczny do wyświetlenia użytkownikowi.
export const getErrorMessage = (error) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error ?? "Wystąpił nieznany błąd");
};

// Escape HTML – do bezpiecznego wstawiania treści błędu do DOM.
export const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
