import { getTodaySummary } from "./controller.js";
import { getErrorMessage, escapeHtml } from "../../utils/error.js";

const DashboardView = async () => {
  const el = document.createElement("section");

  try {
    const data = await getTodaySummary();
    el.innerHTML = `
    <div>
        <div>
            <h2>Kalorie dzisiaj:</h2>
            <p>
                <strong>${data.calories.eaten}</strong> / ${data.calories.target} kcal
            </p>
        </div>
        <div>
            <h2>Ostatnia waga:</h2>
            <p>
                ${
                  data.lastWeight
                    ? `<strong>${data.lastWeight.kg} kg</strong><br/><small>${new Date(data.lastWeight.ts).toISOString()}</small>`
                    : "<em>Brak danych</em>"
                }
            </p>
        </div>
        <div>
            <h2>Ostatni pomiar ciśnienia:</h2>
            <p>
                ${
                  data.lastBp
                    ? `<strong>${data.lastBp.sys} / ${data.lastBp.dia} mmHg</strong><br/><small>${new Date(data.lastBp.ts).toISOString()}</small>`
                    : "<em>Brak danych</em>"
                }
            </p>
        </div>
    </div>
    `;
  } catch (error) {
    console.error(error);
    const message = escapeHtml(getErrorMessage(error));
    el.innerHTML = `<div class="errorBox"><strong>Nie udało się załadować podsumowania.</strong><br />${message}</div>`;
  }

  return el;
};

export default DashboardView;
