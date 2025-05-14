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

  let injections = JSON.parse(localStorage.getItem("injections")) || defaultInjections;
  localStorage.setItem("injections", JSON.stringify(injections));

  function renderInjections() {
    injList.innerHTML = "";
    injections.forEach((inj, index) => {
      const li = document.createElement("li");
      li.textContent = `${inj.date} - ${inj.weight} kg`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
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
    injections.push({ date: injDate.value, weight: parseFloat(injWeight.value) });
    localStorage.setItem("injections", JSON.stringify(injections));
    injDate.value = "";
    injWeight.value = "";
    renderInjections();
    updateProgressChart();
  });

  function updateProgressChart() {
    if (!chartEl) return;
    const ctx = chartEl.getContext("2d");
    if (window.progressChartInstance) window.progressChartInstance.destroy();

    const sorted = [...injections].sort((a, b) => new Date(a.date) - new Date(b.date));
    const actualDates = sorted.map(e => e.date);
    const actualWeights = sorted.map(e => parseFloat(e.weight));

    const startDate = new Date(sorted[0]?.date || new Date());
    const targetDate = new Date("2025-10-23");
    const totalWeeks = Math.round((targetDate - startDate) / (7 * 24 * 60 * 60 * 1000));

    const goalWeight = parseFloat(localStorage.getItem("goal")) || 80;
    const startWeight = parseFloat(localStorage.getItem("startingWeight")) || 130;

    const targetWeights = [];
    const targetDates = [];
    for (let i = 0; i <= totalWeeks; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * 7);
      targetDates.push(d.toISOString().split("T")[0]);
      targetWeights.push((startWeight - ((startWeight - goalWeight) * i / totalWeeks)).toFixed(1));
    }

    window.progressChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: targetDates,
        datasets: [
          {
            label: "Actual Weights",
            data: sorted.map(e => ({ x: e.date, y: e.weight })),
            borderColor: "blue",
            backgroundColor: "blue",
            tension: 0.3,
            pointRadius: 4
          },
          {
            label: "Target Slope",
            data: targetDates.map((d, i) => ({ x: d, y: targetWeights[i] })),
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
          x: { type: "time", time: { unit: "week" } },
          y: { beginAtZero: false }
        }
      }
    });
  }

  window.saveProfile = function () {
    localStorage.setItem("name", document.getElementById("name").value);
    localStorage.setItem("height", document.getElementById("height").value);
    localStorage.setItem("startingWeight", document.getElementById("startingWeight").value);
    localStorage.setItem("goal", document.getElementById("goal").value);
    updateProgressChart();
  }

  function loadProfile() {
    document.getElementById("name").value = localStorage.getItem("name") || "";
    document.getElementById("height").value = localStorage.getItem("height") || "";
    document.getElementById("startingWeight").value = localStorage.getItem("startingWeight") || "";
    document.getElementById("goal").value = localStorage.getItem("goal") || "";
  }

  renderInjections();
  loadProfile();
  updateProgressChart();
});