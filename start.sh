#!/usr/bin/env bash
# Uruchamia serwer HTTP z katalogu public – wymagane do poprawnego ładowania modułów ES6.
cd "$(dirname "$0")/public" && python3 -m http.server "${1:-8001}"
