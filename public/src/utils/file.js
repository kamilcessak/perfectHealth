/**
 * Odczytuje plik jako data URL (np. do zapisu obrazu w IndexedDB).
 * @param {File} file - Plik do odczytu.
 * @returns {Promise<string>} Data URL (np. data:image/jpeg;base64,...).
 */
export const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
