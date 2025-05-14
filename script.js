
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tablink').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  const weightInput = document.getElementById("weightInput");
  const weightForm = document.getElementById("weightForm");
  const lastWeightDisplay = document.getElementById("lastWeight");
  const bmiDisplay = document.getElementById("bmiDisplay");
  const weightChart = document.getElementById("weightChart");
  const injForm = document.getElementById("injectionForm");
  const injDate = document.getElementById("injDate");
  const injWeight = document.getElementById("injWeight");
  const injList = document.getElementById("injectionList");
  const height = 1.84;

  let weightHistory = JSON.parse(localStorage.getItem("weightHistory") || "[]");

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
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  if (weightHistory.length) {
    const last = weightHistory[weightHistory.length - 1];
    lastWeightDisplay.textContent = last.weight;
    const bmi = (last.weight / (height * height)).toFixed(1);
    bmiDisplay.textContent = bmi;
    updateChart();
  }

  weightForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const weight = parseFloat(weightInput.value);
    if (!isNaN(weight)) {
      const today = new Date().toISOString().split("T")[0];
      weightHistory.push({ date: today, weight });
      localStorage.setItem("weightHistory", JSON.stringify(weightHistory));
      lastWeightDisplay.textContent = weight.toFixed(1);
      const bmi = (weight / (height * height)).toFixed(1);
      bmiDisplay.textContent = bmi;
      updateChart();
      weightInput.value = "";
    }
  });

  injForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const date = injDate.value;
    const weight = injWeight.value;
    if (date && weight) {
      const li = document.createElement("li");
      li.textContent = `${date} – ${weight} kg`;
      injList.appendChild(li);
      injDate.value = "";
      injWeight.value = "";
    }
  });
});
