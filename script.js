
function showTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tablink').forEach(link => link.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  // Profile
  const profileForm = document.getElementById("profileForm");
  const name = document.getElementById("name");
  const height = document.getElementById("height");
  const startWeight = document.getElementById("startWeight");
  const goal = document.getElementById("goal");

  function saveProfile() {
    const data = {
      name: name.value,
      height: height.value,
      startWeight: startWeight.value,
      goal: goal.value
    };
    localStorage.setItem("profile", JSON.stringify(data));
  }

  function loadProfile() {
    const saved = JSON.parse(localStorage.getItem("profile"));
    if (saved) {
      name.value = saved.name || "";
      height.value = saved.height || "";
      startWeight.value = saved.startWeight || "";
      goal.value = saved.goal || "";
    }
  }

  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveProfile();
  });

  loadProfile();

  // Injection Tracker
  const injectionForm = document.getElementById("injectionForm");
  const injDate = document.getElementById("injDate");
  const injWeight = document.getElementById("injWeight");
  const injectionList = document.getElementById("injectionList");

  let injections = JSON.parse(localStorage.getItem("injections")) || [];

  function renderInjections() {
    injectionList.innerHTML = "";
    injections.forEach((inj, index) => {
      const li = document.createElement("li");
      li.textContent = `${inj.date} - ${inj.weight} kg`;
      const del = document.createElement("button");
      del.textContent = "❌";
      del.onclick = () => {
        injections.splice(index, 1);
        localStorage.setItem("injections", JSON.stringify(injections));
        renderInjections();
        renderChart();
      };
      li.appendChild(del);
      injectionList.appendChild(li);
    });
  }

  injectionForm.addEventListener("submit", function (e) {
    e.preventDefault();
    injections.push({ date: injDate.value, weight: parseFloat(injWeight.value) });
    localStorage.setItem("injections", JSON.stringify(injections));
    injDate.value = "";
    injWeight.value = "";
    renderInjections();
    renderChart();
  });

  renderInjections();

  // Chart
  function renderChart() {
    const ctx = document.getElementById("progressChart").getContext("2d");
    if (window.progressChart) window.progressChart.destroy();

    if (!injections.length) return;

    const sorted = injections.sort((a, b) => new Date(a.date) - new Date(b.date));
    const dates = sorted.map(e => e.date);
    const weights = sorted.map(e => e.weight);

    const start = 130;
    const end = 80;
    const startDate = new Date(sorted[0].date);
    const endDate = new Date("2025-10-23");
    const weeks = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    const slopeDates = [], slopeWeights = [];

    for (let i = 0; i <= weeks; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * 7);
      slopeDates.push(d.toISOString().split("T")[0]);
      slopeWeights.push(start - ((start - end) * i / weeks));
    }

    window.progressChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: slopeDates,
        datasets: [
          {
            label: "Actual Weights",
            data: sorted.map(e => ({ x: e.date, y: e.weight })),
            borderColor: "blue",
            backgroundColor: "blue",
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Target Slope",
            data: slopeDates.map((d, i) => ({ x: d, y: slopeWeights[i] })),
            borderColor: "green",
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: "time",
            time: { unit: "week" },
            title: { display: true, text: "Date" }
          },
          y: {
            title: { display: true, text: "Weight (kg)" }
          }
        }
      }
    });
  }

  renderChart();
});
