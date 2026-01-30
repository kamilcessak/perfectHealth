import { getErrorMessage } from "../utils/error.js";
import { debounce } from "../utils/debounce.js";
import { RENDER_DEBOUNCE_MS } from "../constants.js";

/** @type {Map<string, () => Promise<{ el: HTMLElement; destroy?: () => void } | HTMLElement>>} Mapa zarejestrowanych tras. */
const routes = new Map();

/** Ostatni ustawiony aktywny hash – unikanie zbędnych aktualizacji DOM w setActiveLink. */
let lastActiveHash = null;

/**
 * Rejestruje trasę w routerze.
 * @param {string} path - Ścieżka (hash bez #), np. "/", "/measurements".
 * @param {() => Promise<{ el: HTMLElement; destroy?: () => void } | HTMLElement>} loader - Funkcja ładująca widok.
 */
export const registerRoute = (path, loader) => {
  routes.set(path, loader);
};

/**
 * Uruchamia router oparty na hash w URL: nasłuchuje hashchange, renderuje widok, obsługuje cleanup poprzedniego widoku.
 */
export const startRouter = () => {
  let currentCleanup = null;
  let navigationId = 0;
  let lastRenderedHash = null;

  const runCleanup = () => {
    if (typeof currentCleanup === "function") {
      try {
        currentCleanup();
      } catch (cleanupError) {
        console.error("Błąd podczas czyszczenia widoku:", cleanupError);
      }
      currentCleanup = null;
    }
  };

  const render = async () => {
    const hash = location.hash.replace("#", "") || "/";
    const normalizedHash = "#" + (hash || "/");

    if (lastRenderedHash === normalizedHash) {
      return;
    }

    const loader = routes.get(hash) || routes.get("/404");
    const root = document.querySelector("#app");
    if (!root) return;

    runCleanup();
    navigationId += 1;
    const thisNavigationId = navigationId;

    try {
      const result = await loader();

      if (thisNavigationId !== navigationId) {
        if (result?.el != null && typeof result.destroy === "function") {
          try {
            result.destroy();
          } catch (e) {
            console.error("Błąd podczas czyszczenia odrzuconego widoku:", e);
          }
        }
        return;
      }

      const viewEl = result?.el != null ? result.el : result;
      if (result?.el != null && typeof result.destroy === "function") {
        currentCleanup = result.destroy;
      } else {
        currentCleanup = null;
      }
      lastRenderedHash = normalizedHash;
      root.replaceChildren(viewEl);
      setActiveLink();
    } catch (error) {
      if (thisNavigationId !== navigationId) {
        return;
      }
      console.error(error);
      runCleanup();
      const box = document.createElement("div");
      box.className = "errorBox";
      const strong = document.createElement("strong");
      strong.textContent = "Wystąpił błąd podczas ładowania strony.";
      const br = document.createElement("br");
      const msg = document.createTextNode(getErrorMessage(error));
      box.appendChild(strong);
      box.appendChild(br);
      box.appendChild(msg);
      root.replaceChildren(box);
    }
  };

  const debouncedRender = debounce(render, RENDER_DEBOUNCE_MS);

  addEventListener("hashchange", debouncedRender);

  if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
};

/**
 * Oznacza aktywny link w nawigacji (data-route) na podstawie aktualnego hash; aktualizuje tylko gdy hash się zmienił.
 */
export const setActiveLink = () => {
  const current = location.hash || "#/";
  if (lastActiveHash === current) return;
  lastActiveHash = current;
  document.querySelectorAll("a[data-route]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === current);
  });
};

/** Trasa 404 – wyświetlana dla nieistniejących ścieżek. */
registerRoute("/404", async () => {
  const el = document.createElement("div");
  el.className = "page-404 card";
  const h2 = document.createElement("h2");
  h2.textContent = "Nie znaleziono strony";
  el.appendChild(h2);
  return el;
});
