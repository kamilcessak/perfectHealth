import { getErrorMessage } from "../utils/error.js";
import { debounce } from "../utils/debounce.js";
import { RENDER_DEBOUNCE_MS } from "../constants.js";

// Mapa przechowująca zarejestrowane trasy aplikacji
const routes = new Map();

// Rejestruje trasy w routerze
export const registerRoute = (path, loader) => {
  routes.set(path, loader);
};

// Start routera opartego na hash w URL
export const startRouter = () => {
  const render = async () => {
    const hash = location.hash.replace("#", "") || "/";
    const loader = routes.get(hash) || routes.get("/404");
    const root = document.querySelector("#app");

    try {
      const view = await loader();
      root.replaceChildren(view);
      setActiveLink();
    } catch (error) {
      console.error(error);
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

// Oznacza aktywny link w nawigacji na podstawie aktualnego hash
export const setActiveLink = () => {
  const current = location.hash || "#/";
  document.querySelectorAll("a[data-route]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === current);
  });
};

// Trasa 404 dla nieistniejących stron
registerRoute("/404", async () => {
  const el = document.createElement("div");
  el.className = "404box";
  const h2 = document.createElement("h2");
  h2.textContent = "Nie znaleziono strony";
  el.appendChild(h2);
  return el;
});
