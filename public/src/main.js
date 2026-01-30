/**
 * Punkt wejścia aplikacji PWA: router, banner offline, rejestracja Service Workera.
 * Rejestruje trasy (dashboard, pomiary, posiłki) i uruchamia nawigację po hash.
 */
import { startRouter, setActiveLink } from "./core/router.js";
import "./features/dashboard/routes.js";
import "./features/measurements/routes.js";
import "./features/meals/routes.js";

/**
 * Konfiguruje banner offline: pokazuje/ukrywa w zależności od navigator.onLine.
 * Nasłuchuje zdarzeń online/offline i ewentualnie czeka na DOMContentLoaded przed pierwszą aktualizacją.
 */
const setupOfflineBanner = () => {
  const banner = document.querySelector("#offline-banner");
  if (!banner) return;

  const update = () => {
    const isOnline = navigator.onLine;
    if (isOnline) {
      banner.hidden = true;
      banner.style.display = "none";
    } else {
      banner.hidden = false;
      banner.style.display = "flex";
    }
  };

  window.addEventListener("online", update);
  window.addEventListener("offline", update);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }
};

if ("serviceWorker" in navigator) {
  const swUrl = new URL("../serviceWorker.js", import.meta.url).href;
  navigator.serviceWorker
    .register(swUrl, { scope: "/" })
    .catch((err) => console.error("SW registration failed:", err));
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
});

setupOfflineBanner();
startRouter();
setActiveLink();
