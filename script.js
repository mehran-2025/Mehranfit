
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tablink').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  const injForm = document.getElementById("injectionForm");
  const injDate = document.getElementById("injDate");
  const injWeight = document.getElementById("injWeight");
  const injList = document.getElementById("injectionList");
  const chartEl = document.getElementById("progressChart");

  const defaultInjections = [
    { date: "2024-04-20", weight: 128.2 },
    { date: "2024-04-27", weight: 124.3 },
    { date: "2024-05-12", weight: 122.1 }
  ];

  let injections = [];
  try {
    injections = JSON.parse(localStorage.getItem("injections")) || [];
    if (injections.length === 0) {
      injections = defaultInjections;
      localStorage.setItem("injections", JSON.stringify(injections));
    }
  } catch (e) {
    injections = defaultInjections;
  }

  function renderInjections() {
    injList.innerHTML = "";
    injections.forEach((inj, index) => {
      const li = document.createElement("li");
      li.textContent = `${inj.date} – ${inj.weight} kg`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = () => {
        injections.splice(index, 1);
        localStorage.setItem("injections", JSON.stringify(injections));
        renderInjections();
        updateProgressChart();
      };
      li.appendChild(delBtn);
      injList.appendChild(li);
    });
  }

  injForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const date = injDate.value;
    const weight = injWeight.value;
    if (date && weight) {
      injections.push({ date, weight });
      localStorage.setItem("injections", JSON.stringify(injections));
      injDate.value = "";
      injWeight.value = "";
      renderInjections();
      updateProgressChart();
    }
  });

  function updateProgressChart() {
    if (!chartEl) return;
    const ctx = chartEl.getContext("2d");
    if (window.progressChartInstance) window.progressChartInstance.destroy();

    const sorted = [...injections].sort((a, b) => new Date(a.date) - new Date(b.date));
    const actualDates = sorted.map(e => e.date);
    const actualWeights = sorted.map(e => parseFloat(e.weight));

    const targetStartDate = sorted.length ? new Date(sorted[0].date) : new Date();
    const targetEndDate = new Date("2025-10-23");
    const totalWeeks = Math.round((targetEndDate - targetStartDate) / (1000 * 60 * 60 * 24 * 7));

    const goalWeights = [];
    const goalDates = [];
    const startWeight = 130;
    const targetWeight = 80;
    for (let i = 0; i <= totalWeeks; i += 1) {
      const d = new Date(targetStartDate);
      d.setDate(d.getDate() + i * 7);
      const dw = (startWeight - ((startWeight - targetWeight) * i / totalWeeks)).toFixed(1);
      goalDates.push(d.toISOString().split("T")[0]);
      goalWeights.push(dw);
    }

    window.progressChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [...goalDates],
        datasets: [
          {
            label: "Actual Weights",
            data: sorted.map(e => ({ x: e.date, y: e.weight })),
            borderColor: "blue",
            backgroundColor: "blue",
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Target Slope",
            data: goalDates.map((d, i) => ({ x: d, y: goalWeights[i] })),
            borderColor: "green",
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: { type: "time", time: { unit: "week" }, title: { display: true, text: "Date" } },
          y: { beginAtZero: false, title: { display: true, text: "Weight (kg)" } }
        }
      }
    });
  }

  renderInjections();
  updateProgressChart();
});
