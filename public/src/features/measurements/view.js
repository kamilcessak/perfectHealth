import {
  getCurrentPosition,
  resolveAddressFromCoords,
} from "./controller.js";
import {
  getBpListForDisplay,
  getWeightListForDisplay,
  addBp,
  addWeight,
} from "../../core/store.js";
import { getErrorMessage, escapeHtml, safeHtml, trusted } from "../../utils/error.js";
import {
  BP_SYS_MIN,
  BP_SYS_MAX,
  BP_DIA_MIN,
  BP_DIA_MAX,
  WEIGHT_MIN_KG,
  WEIGHT_MAX_KG,
  MAX_NOTE_LENGTH,
  MAX_LOCATION_LENGTH,
  DEFAULT_LIST_LIMIT,
} from "../../constants.js";

const MeasurementsView = async () => {
  const root = document.createElement("section");

  root.innerHTML = `
  <div class="feature-layout">
    <div class="feature-form-col">
      <div class="card">
          <h1>Dodaj pomiar ciśnienia:</h1>
          <form id="bp-form" class="app-form">
              <label>Skurczowe
                  <input name="sys" type="number" min="${BP_SYS_MIN}" max="${BP_SYS_MAX}" required />
              </label>
              <label>Rozkurczowe
                  <input name="dia" type="number" min="${BP_DIA_MIN}" max="${BP_DIA_MAX}" required />
              </label>
              <label>Data pomiaru
                  <input name="date" type="date" />
              </label>
              <label>Godzina pomiaru
                  <input name="time" type="time" />
              </label>
              <label>Lokalizacja
                  <div class="location-input-row">
                      <input name="location" type="text" placeholder="Opcjonalna..." class="location-input" maxlength="${MAX_LOCATION_LENGTH}" />
                      <button type="button" id="get-location-btn" class="btn btn-location">📍 Pobierz</button>
                  </div>
              </label>
              <label>Notatka
                  <input name="note" type="text" placeholder="Opcjonalna..." maxlength="${MAX_NOTE_LENGTH}" />
              </label>
              <button class="btn" type="submit">Zapisz pomiar</button>
          </form>
          <p id="bp-msg" class="form-msg"></p>
      </div>

      <div class="card">
        <h1>Dodaj pomiar wagi:</h1>
        <form id="weight-form" class="app-form">
          <label>Waga (kg)
            <input name="kg" type="number" step="0.1" min="${WEIGHT_MIN_KG}" max="${WEIGHT_MAX_KG}" required />
          </label>
          <label>Data pomiaru
              <input name="date" type="date" />
          </label>
          <label>Godzina pomiaru
              <input name="time" type="time" />
          </label>
          <label>Notatka
              <input name="note" type="text" placeholder="Opcjonalna..." maxlength="${MAX_NOTE_LENGTH}" />
          </label>
          <button class="btn" type="submit">Zapisz pomiar</button>
        </form>
        <p id="weight-msg" class="form-msg"></p>
      </div>
    </div>
    <div class="feature-list-col">
      <div class="card">
          <h2>Ostatnie pomiary ciśnienia:</h2>
          <ul id="bp-list"></ul>
      </div>

      <div class="card">
          <h2>Ostatnie pomiary wagi:</h2>
          <ul id="weight-list"></ul>
      </div>
    </div>
  </div>
  `;

  const bpForm = root.querySelector("#bp-form");
  const bpMsg = root.querySelector("#bp-msg");
  const bpList = root.querySelector("#bp-list");
  const locationInput = root.querySelector('input[name="location"]');
  const getLocationBtn = root.querySelector("#get-location-btn");

  const wgForm = root.querySelector("#weight-form");
  const wgMsg = root.querySelector("#weight-msg");
  const wgList = root.querySelector("#weight-list");

  const resetLocationButton = () => {
    getLocationBtn.disabled = false;
    getLocationBtn.textContent = "📍 Pobierz";
  };

  const getLocation = async () => {
    getLocationBtn.disabled = true;
    getLocationBtn.textContent = "⏳ Pobieranie...";
    bpMsg.textContent = "";
    bpMsg.className = "form-msg";

    try {
      const coords = await getCurrentPosition();
      const address = await resolveAddressFromCoords(coords.latitude, coords.longitude);
      locationInput.value = address;
    } catch (error) {
      bpMsg.className = "form-msg form-msg-error";
      bpMsg.textContent = `Błąd pobierania lokalizacji: ${getErrorMessage(error)}`;
    } finally {
      resetLocationButton();
    }
  };

  const onBpSubmit = async (e) => {
    e.preventDefault();
    bpMsg.textContent = "";
    const fd = new FormData(bpForm);

    try {
      await addBp({
        sys: fd.get("sys"),
        dia: fd.get("dia"),
        date: fd.get("date"),
        time: fd.get("time"),
        note: fd.get("note"),
        location: fd.get("location"),
      });

      bpForm.reset();
      bpMsg.className = "form-msg form-msg-success";
      bpMsg.textContent = "Zapisano pomiar!";
      await refreshBp();
    } catch (error) {
      bpMsg.className = "form-msg form-msg-error";
      bpMsg.textContent = `Błąd: ${getErrorMessage(error)}`;
    }
  };

  const onWgSubmit = async (e) => {
    e.preventDefault();
    wgMsg.textContent = "";

    const fd = new FormData(wgForm);

    try {
      await addWeight({
        kg: fd.get("kg"),
        date: fd.get("date"),
        time: fd.get("time"),
        note: fd.get("note"),
      });

      wgForm.reset();
      wgMsg.className = "form-msg form-msg-success";
      wgMsg.textContent = "Zapisano pomiar!";

      await refreshWg();
    } catch (error) {
      wgMsg.className = "form-msg form-msg-error";
      wgMsg.textContent = `Błąd: ${getErrorMessage(error)}`;
    }
  };

  getLocationBtn.addEventListener("click", getLocation);
  bpForm.addEventListener("submit", onBpSubmit);
  wgForm.addEventListener("submit", onWgSubmit);

  const destroy = () => {
    getLocationBtn.removeEventListener("click", getLocation);
    bpForm.removeEventListener("submit", onBpSubmit);
    wgForm.removeEventListener("submit", onWgSubmit);
  };

  const renderBpList = (items, error) => {
    if (error) {
      const li = document.createElement("li");
      li.className = "list-error";
      li.textContent = `Nie udało się załadować pomiarów. ${getErrorMessage(error)}`;
      bpList.replaceChildren(li);
      return;
    }
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = "Brak danych";
      bpList.replaceChildren(li);
      return;
    }
    bpList.innerHTML = items
      .map((e) => {
        const locPart = e.location ? ` <br/><small>📍 ${escapeHtml(e.location)}</small>` : "";
        const notePart = e.note ? ` <br/><em>${escapeHtml(e.note)}</em>` : "";
        return safeHtml`<li>${fmtDate(e.ts)} - <strong>${e.value}/${e.value2} mmHg</strong>${trusted(locPart)}${trusted(notePart)} </li>`;
      })
      .join("");
  };

  const renderWeightList = (items, error) => {
    if (error) {
      const li = document.createElement("li");
      li.className = "list-error";
      li.textContent = `Nie udało się załadować pomiarów wagi. ${getErrorMessage(error)}`;
      wgList.replaceChildren(li);
      return;
    }
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = "Brak danych";
      wgList.replaceChildren(li);
      return;
    }
    wgList.innerHTML = items
      .map((e) => {
        const notePart = e.note ? ` <em>${escapeHtml(e.note)}</em>` : "";
        return safeHtml`<li>${fmtDate(e.ts)} - <strong>${e.value.toFixed(1)} kg</strong>${trusted(notePart)}</li>`;
      })
      .join("");
  };

  const refreshBp = async () => {
    const { items, error } = await getBpListForDisplay(DEFAULT_LIST_LIMIT);
    renderBpList(items, error);
  };

  const refreshWg = async () => {
    const { items, error } = await getWeightListForDisplay(DEFAULT_LIST_LIMIT);
    renderWeightList(items, error);
  };

  await Promise.all([refreshBp(), refreshWg()]);
  return { el: root, destroy };
};

const fmtDate = (ts) => {
  return new Date(ts).toLocaleString();
};

export default MeasurementsView;
