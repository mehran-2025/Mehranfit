
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tablink').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

// BMI calculation and localStorage save
document.addEventListener("DOMContentLoaded", function () {
  const weightInput = document.getElementById("weightInput");
  const weightForm = document.getElementById("weightForm");
  const lastWeightDisplay = document.getElementById("lastWeight");
  const bmiDisplay = document.getElementById("bmiDisplay");
  const height = 1.84;

  if (localStorage.getItem("weight")) {
    lastWeightDisplay.textContent = localStorage.getItem("weight");
    const bmi = (parseFloat(localStorage.getItem("weight")) / (height * height)).toFixed(1);
    bmiDisplay.textContent = bmi;
  }

  weightForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const weight = parseFloat(weightInput.value);
    if (!isNaN(weight)) {
      localStorage.setItem("weight", weight.toFixed(1));
      lastWeightDisplay.textContent = weight.toFixed(1);
      const bmi = (weight / (height * height)).toFixed(1);
      bmiDisplay.textContent = bmi;
      weightInput.value = "";
    }
  });
});
