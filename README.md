# PerfectHealth - Aplikacja do śledzenia stanu zdrowia

PWA (Progressive Web App) do zarządzania pomiarami zdrowotnymi, posiłkami i kaloriami.

## Funkcjonalności

- 📊 Dashboard z podsumowaniem dziennym
- 💉 Pomiary ciśnienia krwi i wagi
- 🍽️ Śledzenie posiłków i kalorii
- 📍 Geolokacja dla pomiarów
- 📷 Zdjęcia posiłków
- 🔄 Działanie offline
- 📱 Responsywny design

## Wymagania

- Nowoczesna przeglądarka z obsługą:
  - ES6 Modules
  - IndexedDB
  - Service Workers
  - Geolocation API

## Uruchomienie lokalne (testowanie)

**Katalogiem głównym serwera musi być folder `public`** – w przeciwnym razie ładowanie modułów (`/src/...`) się nie uda i pojawi się błąd „Failed to fetch dynamically imported module”.

**Najprościej – skrypt startowy (port 8000 lub podaj inny, np. 8001):**
```bash
cd /ścieżka/do/perfectHealth
./start.sh
# lub na innym porcie:
./start.sh 8001
```
Otwórz: **http://localhost:8000** (lub http://localhost:8001)

**Opcja 2 – Python (z katalogu projektu):**
```bash
cd /ścieżka/do/perfectHealth
python3 -m http.server 8000 --directory public
```
Otwórz: **http://localhost:8000**

**Opcja 3 – Python (wejście do `public`):**
```bash
cd /ścieżka/do/perfectHealth/public
python3 -m http.server 8000
```
Otwórz: **http://localhost:8000**

**Opcja 4 – Node (npx):**
```bash
cd /ścieżka/do/perfectHealth
npx http-server public -p 8000
```
Otwórz: **http://localhost:8000**

**Uwaga:** Jeśli uruchomisz serwer z katalogu głównego (np. `python3 -m http.server 8001` w `perfectHealth/`), w katalogu głównym jest plik `index.html`, który przekierowuje do `public/` – otwórz wtedy **http://localhost:8001/** i po przekierowaniu na **http://localhost:8001/public/** aplikacja załaduje się poprawnie.

## Wdrożenie

Aplikacja jest gotowa do wdrożenia na:
- Netlify (drag & drop folder `public`)
- Vercel
- GitHub Pages
- Surge.sh

## Struktura projektu

```
public/
├── index.html          # Główny plik HTML
├── manifest.webmanifest # Manifest PWA
├── serviceWorker.js    # Service Worker dla offline
├── styles.css          # Style CSS
├── icons/              # Ikony aplikacji
└── src/                # Kod źródłowy
    ├── main.js         # Punkt wejścia
    ├── core/           # Moduły core (router, database)
    └── features/       # Funkcjonalności (dashboard, meals, measurements)
```

## Technologie

- Vanilla JavaScript (ES6 Modules)
- IndexedDB (przechowywanie danych)
- Service Workers (offline)
- CSS3 (responsywny design)

