document.addEventListener("DOMContentLoaded", () => {
  // LÓGICA DO MENU LATERAL
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeMenuBtn = document.getElementById('closeMenu');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');

  if (hamburgerBtn && sideMenu && overlay) {
    function openMenu() {
      sideMenu.classList.add('open');
      overlay.classList.add('active');
      sideMenu.setAttribute('aria-hidden', 'false');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      sideMenu.classList.remove('open');
      overlay.classList.remove('active');
      sideMenu.setAttribute('aria-hidden', 'true');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    hamburgerBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // VALORES DOS KPIS
  const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const visibleMonths = new Date().getMonth() + 1;
  const donationHistory = {
    [currentYear]: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
    [previousYear]: [1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0]
  };
  const donationsThisYear = donationHistory[currentYear].slice(0, visibleMonths);
  const donationsPreviousYear = donationHistory[previousYear].slice(0, visibleMonths);
  const currentTotal = donationsThisYear.reduce((total, value) => total + value, 0);
  const previousTotal = donationsPreviousYear.reduce((total, value) => total + value, 0);
  const annualChange = previousTotal
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
    : 0;

  document.getElementById("currentYearLabel").textContent = `Doações em ${currentYear}`;
  document.getElementById("previousYearLabel").textContent = `Doações em ${previousYear}`;
  document.getElementById("kpi1").textContent = currentTotal;
  document.getElementById("kpi2").textContent = previousTotal;
  document.getElementById("kpi3").textContent = `${annualChange > 0 ? "+" : ""}${annualChange}%`;

  const metricCards = [...document.querySelectorAll(".kpi-card")];
  const compareButton = document.getElementById("compareBtn");
  const chartTitle = document.getElementById("chartTitle");
  const chartDescription = document.getElementById("chartDescription");
  let selectedMetric = "current";
  let donationChart;

  function renderSelectedMetric() {
    const compareYears = selectedMetric === "comparison";
    const selectedYear = selectedMetric === "previous" ? previousYear : currentYear;

    metricCards.forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.metric === selectedMetric));
    });
    compareButton.setAttribute("aria-pressed", String(compareYears));
    compareButton.textContent = compareYears ? "Comparação ativada" : "Comparar anos";

    chartTitle.textContent = compareYears
      ? `Comparação mensal: ${previousYear} e ${currentYear}`
      : `Doações por mês em ${selectedYear}`;
    chartDescription.textContent = compareYears
      ? "Compare o número de doações registradas em cada mês."
      : `Histórico de doações registradas em ${selectedYear}.`;

    if (!donationChart) return;

    donationChart.data.datasets = compareYears
      ? [
          {
            label: String(previousYear),
            data: donationsPreviousYear,
            backgroundColor: "rgba(230, 57, 80, 0.76)",
            borderRadius: 5
          },
          {
            label: String(currentYear),
            data: donationsThisYear,
            backgroundColor: "rgba(14, 148, 136, 0.78)",
            borderRadius: 5
          }
        ]
      : [
          {
            label: String(selectedYear),
            data: donationHistory[selectedYear].slice(0, visibleMonths),
            backgroundColor: selectedMetric === "previous"
              ? "rgba(230, 57, 80, 0.76)"
              : "rgba(14, 148, 136, 0.78)",
            borderRadius: 5
          }
        ];
    donationChart.update();
  }

  metricCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedMetric = card.dataset.metric;
      renderSelectedMetric();
    });
  });

  compareButton.addEventListener("click", () => {
    selectedMetric = selectedMetric === "comparison" ? "current" : "comparison";
    renderSelectedMetric();
  });

  // CONFIGURAÇÃO DO GRÁFICO (CHART.JS)
  const chartCanvas = document.getElementById("simpleChart");

  if (!chartCanvas || typeof Chart === "undefined") {
    return;
  }

  const ctx = chartCanvas.getContext("2d");

  donationChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: monthLabels.slice(0, visibleMonths),
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            color: "#f0f0f0"
          },
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 }
        }
      }
    }
  });

  renderSelectedMetric();
});