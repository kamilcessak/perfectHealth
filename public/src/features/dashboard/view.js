import { getTodaySummary } from "../../core/store.js";
import { getErrorMessage } from "../../utils/error.js";

const DashboardView = async () => {
  const el = document.createElement("section");

  try {
    const data = await getTodaySummary();
    const wrap = document.createElement("div");
    wrap.innerHTML = `
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
    el.appendChild(wrap.firstElementChild);
  } catch (error) {
    console.error(error);
    const box = document.createElement("div");
    box.className = "errorBox";
    const strong = document.createElement("strong");
    strong.textContent = "Nie udało się załadować podsumowania.";
    const br = document.createElement("br");
    const msg = document.createTextNode(getErrorMessage(error));
    box.appendChild(strong);
    box.appendChild(br);
    box.appendChild(msg);
    el.appendChild(box);
  }

  return el;
};

export default DashboardView;
