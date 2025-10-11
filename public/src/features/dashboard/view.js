import { getTodaySummary } from "./controller.js";

const DashboardView = async () => {
  const data = await getTodaySummary();
  const el = document.createElement("section");

  el.innerHTML = `
    <div>
        <div>
            <h2>Kalorie dzisiaj:</h2>
            <p>
                <strong>${data.calories.eaten}</strong> / ${
    data.calories.target
  } kcal
            </p>
        </div>
        <div>
            <h2>Ostatnia waga:</h2>
            <p>
                <strong>${data.lastWeight.kg} kg</strong>
                <br/>
                <small>${new Date(data.lastWeight.ts).toISOString()}</small>
            </p>
        </div>
        <div>
            <h2>Ostatni pomiar ciśnienia:</h2>
            <p>
                <strong>${data.lastBp.sys} / ${data.lastBp.dia} mmHg</strong>
                <br/>
                <small>${new Date(data.lastBp.ts).toISOString()}</small>
            </p>
        </div>
    </div>
    `;

  return el;
};

export default DashboardView;
