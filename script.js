
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function saveProfile() {
  localStorage.setItem('profile', JSON.stringify({
    name: document.getElementById('nameInput').value,
    height: document.getElementById('heightInput').value,
    startWeight: document.getElementById('startWeightInput').value,
    goal: document.getElementById('goalInput').value
  }));
}

document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("progressChart").getContext("2d");
  const injForm = document.getElementById("injectionForm");
  const injList = document.getElementById("injectionList");

  let injections = JSON.parse(localStorage.getItem("injections") || "[]");

  injForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const date = document.getElementById("injDate").value;
    const weight = document.getElementById("injWeight").value;
    injections.push({ date, weight });
    localStorage.setItem("injections", JSON.stringify(injections));
    location.reload();
  });

  function renderInjections() {
    injList.innerHTML = "";
    injections.forEach((inj, i) => {
      const li = document.createElement("li");
      li.textContent = `${inj.date} - ${inj.weight} kg`;
      const del = document.createElement("button");
      del.textContent = "❌";
      del.onclick = () => {
        injections.splice(i, 1);
        localStorage.setItem("injections", JSON.stringify(injections));
        location.reload();
      };
      li.appendChild(del);
      injList.appendChild(li);
    });
  }

  function drawChart() {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    const startWeight = parseFloat(profile.startWeight || 130);
    const goalWeight = parseFloat(profile.goal || 80);

    const sorted = injections.sort((a, b) => new Date(a.date) - new Date(b.date));
    const actualDates = sorted.map(e => e.date);
    const actualWeights = sorted.map(e => parseFloat(e.weight));

    const startDate = sorted.length ? new Date(sorted[0].date) : new Date();
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 6);

    const weeks = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    const goalDates = [];
    const goalWeights = [];
    for (let i = 0; i <= weeks; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i * 7);
      goalDates.push(d.toISOString().split("T")[0]);
      goalWeights.push((startWeight - ((startWeight - goalWeight) * (i / weeks))).toFixed(1));
    }

    new Chart(ctx, {
      type: "line",
      data: {
        labels: goalDates,
        datasets: [
          {
            label: "Actual Weights",
            data: sorted.map(e => ({ x: e.date, y: e.weight })),
            borderColor: "blue",
            backgroundColor: "blue",
            fill: false
          },
          {
            label: "Target Trend",
            data: goalDates.map((d, i) => ({ x: d, y: goalWeights[i] })),
            borderColor: "green",
            borderDash: [5, 5],
            fill: false
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

  renderInjections();
  drawChart();
});
