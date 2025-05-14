
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tablink').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  const heightDefault = 1.84;
  const weightInput = document.getElementById("weightInput");
  const weightForm = document.getElementById("weightForm");
  const lastWeightDisplay = document.getElementById("lastWeight");
  const bmiDisplay = document.getElementById("bmiDisplay");
  const weightChart = document.getElementById("weightChart");
  const startOfWeekWeight = document.getElementById("startOfWeekWeight");
  const endOfWeekWeight = document.getElementById("endOfWeekWeight");
  const weightChange = document.getElementById("weightChange");
  const injForm = document.getElementById("injectionForm");
  const injDate = document.getElementById("injDate");
  const injWeight = document.getElementById("injWeight");
  const injList = document.getElementById("injectionList");
  const startDateForm = document.getElementById("startDateForm");
  const startDateInput = document.getElementById("startDate");
  const nextInjection = document.getElementById("nextInjection");
  const profileForm = document.getElementById("profileForm");
  const profileDisplay = document.getElementById("profileDisplay");

  let weightHistory = JSON.parse(localStorage.getItem("weightHistory") || "[]");
  let injections = JSON.parse(localStorage.getItem("injections") || "[]");

  function updateChart() {
    const ctx = weightChart.getContext("2d");
    if (window.chartInstance) window.chartInstance.destroy();
    window.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weightHistory.map(entry => entry.date),
        datasets: [{
          label: 'Weight (kg)',
          data: weightHistory.map(entry => entry.weight),
          borderColor: '#202945',
          backgroundColor: 'rgba(32,41,69,0.2)',
          tension: 0.2
        }]
      },
      options: { scales: { y: { beginAtZero: false } } }
    });
  }

  function updateDashboard() {
    if (weightHistory.length) {
      const last = weightHistory[weightHistory.length - 1];
      lastWeightDisplay.textContent = last.weight;
      const height = parseFloat(localStorage.getItem("height")) || heightDefault;
      const bmi = (last.weight / (height * height)).toFixed(1);
      bmiDisplay.textContent = bmi;

      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

      const startWeight = weightHistory.find(w => new Date(w.date) >= startOfWeek);
      const endWeight = [...weightHistory].reverse().find(w => new Date(w.date) <= endOfWeek);

      startOfWeekWeight.textContent = startWeight ? startWeight.weight : "-";
      endOfWeekWeight.textContent = endWeight ? endWeight.weight : "-";
      if (startWeight && endWeight) {
        const delta = (endWeight.weight - startWeight.weight).toFixed(1);
        weightChange.textContent = `${delta} kg`;
      }
    }
    updateChart();
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
      };
      li.appendChild(delBtn);
      injList.appendChild(li);
    });
  }

  weightForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const weight = parseFloat(weightInput.value);
    if (!isNaN(weight)) {
      const today = new Date().toISOString().split("T")[0];
      weightHistory.push({ date: today, weight });
      localStorage.setItem("weightHistory", JSON.stringify(weightHistory));
      weightInput.value = "";
      updateDashboard();
    }
  });

  injForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const date = injDate.value;
    const weight = injWeight.value;
    if (date && weight) {
      injections.push({ date, weight });
      localStorage.setItem("injections", JSON.stringify(injections));
      renderInjections();
      injDate.value = "";
      injWeight.value = "";
    }
  });

  startDateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const start = new Date(startDateInput.value);
    localStorage.setItem("injectionStart", start.toISOString());
    const next = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    nextInjection.textContent = next.toDateString();
  });

  const savedStart = localStorage.getItem("injectionStart");
  if (savedStart) {
    const start = new Date(savedStart);
    const next = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    nextInjection.textContent = next.toDateString();
  }

  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const profile = {
      name: document.getElementById("name").value,
      height: document.getElementById("height").value,
      startWeight: document.getElementById("startWeight").value,
      goal: document.getElementById("goal").value
    };
    localStorage.setItem("profile", JSON.stringify(profile));
    renderProfile(profile);
  });

  function renderProfile(profile) {
    profileDisplay.innerHTML = `
      <p><strong>Name:</strong> ${profile.name}</p>
      <p><strong>Height:</strong> ${profile.height} cm</p>
      <p><strong>Starting Weight:</strong> ${profile.startWeight} kg</p>
      <p><strong>Goal:</strong> ${profile.goal}</p>
    `;
  }

  const savedProfile = JSON.parse(localStorage.getItem("profile") || "null");
  if (savedProfile) {
    renderProfile(savedProfile);
  }

  updateDashboard();
  renderInjections();
});
