(function () {
  "use strict";

  const MAX_PLAYERS = 5;
  const STORAGE_KEY = "scoreAppData";
  const THEME_KEY = "samTheme";

  const CHART_PALETTE_LIGHT = [
    { bg: "rgba(220, 38, 38, 0.35)", border: "#dc2626" },
    { bg: "rgba(22, 163, 74, 0.35)", border: "#16a34a" },
    { bg: "rgba(147, 51, 234, 0.35)", border: "#9333ea" },
    { bg: "rgba(234, 88, 12, 0.35)", border: "#ea580c" },
    { bg: "rgba(37, 99, 235, 0.35)", border: "#2563eb" },
  ];

  const CHART_PALETTE_DARK = [
    { bg: "rgba(248, 113, 113, 0.4)", border: "#f87171" },
    { bg: "rgba(74, 222, 128, 0.4)", border: "#4ade80" },
    { bg: "rgba(192, 132, 252, 0.4)", border: "#c084fc" },
    { bg: "rgba(251, 146, 60, 0.4)", border: "#fb923c" },
    { bg: "rgba(96, 165, 250, 0.4)", border: "#60a5fa" },
  ];

  function isDarkTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function chartPalette() {
    return isDarkTheme() ? CHART_PALETTE_DARK : CHART_PALETTE_LIGHT;
  }

  function chartAxisTheme() {
    if (isDarkTheme()) {
      return {
        tick: "#94a3b8",
        grid: "rgba(148, 163, 184, 0.18)",
        zero: "rgba(148, 163, 184, 0.35)",
      };
    }
    return {
      tick: "#64748b",
      grid: "rgba(100, 116, 139, 0.15)",
      zero: "rgba(100, 116, 139, 0.28)",
    };
  }

  let playerCount = MAX_PLAYERS;
  let selectedSlotIndex = null;
  let isPlaying = false;

  const nameLabels = Array.from(
    { length: MAX_PLAYERS },
    (_, i) => `Player ${i + 1}`
  );
  const totals = Array(MAX_PLAYERS).fill(0);
  const players = Array.from({ length: MAX_PLAYERS }, () => []);
  const tableRows = [];

  const el = {
    nameCells: document.querySelectorAll(".name_p"),
    inputName: document.querySelector(".input_name"),
    inputsScore: document.querySelectorAll(".input_score"),
    btnAdd: document.querySelector(".btn_add"),
    btnClr: document.querySelector(".btn_clr"),
    btnAudio: document.querySelector(".btn_audio"),
    audio: document.querySelector(".audio"),
    totals: document.querySelectorAll(".total"),
    tbody: document.querySelector(".tbody"),
    resAdd: document.querySelector(".add_responsive"),
    resClr: document.querySelector(".clear_responsive"),
    playerCountSelect: document.getElementById("player_count"),
    slotSelect: document.querySelector(".slit"),
    themeToggle: document.getElementById("themeToggle"),
  };

  const axisOpts = chartAxisTheme();

  const chartData = {
    labels: [...nameLabels],
    datasets: [
      {
        data: Array(MAX_PLAYERS).fill(0),
        backgroundColor: chartPalette().map((c) => c.bg),
        borderColor: chartPalette().map((c) => c.border),
        borderWidth: 1,
      },
    ],
  };

  const chart = new Chart("myChart", {
    type: "bar",
    data: chartData,
    options: {
      legend: { display: false },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: axisOpts.tick,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
            },
            gridLines: {
              color: axisOpts.grid,
              zeroLineColor: axisOpts.zero,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              fontColor: axisOpts.tick,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
            },
            gridLines: {
              color: axisOpts.grid,
              zeroLineColor: axisOpts.zero,
            },
          },
        ],
      },
    },
  });

  function applyChartTheme() {
    const axis = chartAxisTheme();
    const pal = chartPalette();
    const x = chart.options.scales.xAxes[0];
    const y = chart.options.scales.yAxes[0];
    x.ticks.fontColor = axis.tick;
    x.gridLines.color = axis.grid;
    x.gridLines.zeroLineColor = axis.zero;
    y.ticks.fontColor = axis.tick;
    y.gridLines.color = axis.grid;
    y.gridLines.zeroLineColor = axis.zero;
    const ds = chartData.datasets[0];
    ds.backgroundColor = pal.map((c) => c.bg);
    ds.borderColor = pal.map((c) => c.border);
    updateChartSlice();
    chart.update();
  }

  function setTheme(mode) {
    const next = mode === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    syncThemeToggle();
    applyChartTheme();
  }

  function syncThemeToggle() {
    const btn = el.themeToggle;
    if (!btn) return;
    const dark = isDarkTheme();
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function toggleTheme() {
    setTheme(isDarkTheme() ? "light" : "dark");
  }

  function initMaterialSelects() {
    M.FormSelect.init(document.querySelectorAll("select"));
  }

  function updatePlayerVisibility() {
    for (let i = 1; i <= MAX_PLAYERS; i++) {
      document.querySelectorAll(`.player-${i}`).forEach((node) => {
        node.classList.toggle("player-hidden", i > playerCount);
      });
    }
  }

  function rebuildSlotOptions() {
    const { slotSelect } = el;
    slotSelect.innerHTML =
      '<option value="" disabled selected>Pick slot</option>';
    for (let i = 1; i <= playerCount; i++) {
      slotSelect.innerHTML += `<option value="${i}">Slot ${i}</option>`;
    }
    initMaterialSelects();
  }

  function updateChartSlice() {
    const ds = chartData.datasets[0];
    const pal = chartPalette();
    chartData.labels = nameLabels.slice(0, playerCount);
    ds.data = totals.slice(0, playerCount);
    ds.backgroundColor = pal.slice(0, playerCount).map((c) => c.bg);
    ds.borderColor = pal.slice(0, playerCount).map((c) => c.border);
  }

  function clearScoreInputs() {
    el.inputsScore.forEach((input) => {
      input.value = "";
    });
  }

  function renderTable() {
    el.tbody.innerHTML = tableRows.join("");
  }

  function updateTotals() {
    for (let i = 0; i < playerCount; i++) {
      const sum = players[i].reduce((a, b) => a + b, 0);
      el.totals[i].innerText = String(sum);
      totals[i] = sum;
    }
  }

  function syncChart() {
    updateChartSlice();
    chart.update();
  }

  function calculateMissingScore(scores) {
    let missingIndex = -1;
    let nonZeroCount = 0;
    let sum = 0;

    for (let i = 0; i < scores.length; i++) {
      if (scores[i] === 0) {
        missingIndex = i;
      } else {
        sum += scores[i];
        nonZeroCount++;
      }
    }

    if (nonZeroCount === 0) {
      alert("Please enter at least one score");
      return null;
    }
    if (nonZeroCount === playerCount) {
      alert(
        "All scores are entered. Please leave one player's score empty to calculate."
      );
      return null;
    }
    if (nonZeroCount !== playerCount - 1) {
      alert(
        `Please enter exactly ${playerCount - 1} scores and leave one empty`
      );
      return null;
    }

    const next = scores.slice();
    next[missingIndex] = -sum;
    return next;
  }

  function addRound() {
    const scores = [];
    for (let i = 0; i < playerCount; i++) {
      scores.push(Number(el.inputsScore[i].value) || 0);
    }

    const calculated = calculateMissingScore(scores);
    if (!calculated) return;

    for (let i = 0; i < playerCount; i++) {
      players[i].push(calculated[i]);
    }

    let row = "<tr>";
    for (let i = 0; i < playerCount; i++) {
      row += `<td>${calculated[i]}</td>`;
    }
    row += "</tr>";
    tableRows.push(row);

    updateTotals();
  }

  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const item = JSON.parse(raw);
      for (let i = 0; i < MAX_PLAYERS; i++) {
        players[i] = item[`p${i + 1}`] || [];
      }
    } catch {
      /* ignore corrupt storage */
    }
  }

  function resetGame() {
    for (let i = 0; i < playerCount; i++) {
      nameLabels[i] = `Player ${i + 1}`;
      if (el.nameCells[i]) {
        el.nameCells[i].innerHTML = nameLabels[i];
      }
    }
    for (let i = 0; i < MAX_PLAYERS; i++) {
      players[i] = [];
    }
    tableRows.length = 0;
    renderTable();
    updateTotals();
    syncChart();
    clearScoreInputs();
  }

  function handlePlayerCountChange() {
    playerCount = parseInt(el.playerCountSelect.value, 10) || MAX_PLAYERS;
    updatePlayerVisibility();
    rebuildSlotOptions();
    resetGame();
  }

  function handleSlotChange() {
    const v = el.slotSelect.value;
    const idx = parseInt(v, 10);
    selectedSlotIndex = Number.isFinite(idx) ? idx - 1 : null;
    el.inputName.value = "";
  }

  function handleNameInput() {
    if (selectedSlotIndex == null || selectedSlotIndex < 0) {
      alert("Please select a slot first");
      el.inputName.value = "";
      return;
    }
    el.nameCells[selectedSlotIndex].innerHTML = el.inputName.value;
    nameLabels[selectedSlotIndex] = el.inputName.value;
    syncChart();
  }

  function handleAddClick() {
    addRound();
    clearScoreInputs();
    renderTable();
    syncChart();
  }

  function handleClearClick() {
    if (confirm("This will clear all data. Are you sure?")) {
      location.reload();
    }
  }

  function bindAudio() {
    el.btnAudio.addEventListener("click", () => {
      if (isPlaying) {
        el.audio.pause();
        isPlaying = false;
      } else {
        el.audio.play();
        isPlaying = true;
      }
    });
    el.audio.addEventListener("ended", () => {
      isPlaying = false;
    });
  }

  function bindUi() {
    el.playerCountSelect.addEventListener("change", handlePlayerCountChange);
    el.slotSelect.addEventListener("change", handleSlotChange);
    el.inputName.addEventListener("input", handleNameInput);
    el.btnAdd.addEventListener("click", handleAddClick);
    el.resAdd.addEventListener("click", handleAddClick);
    el.btnClr.addEventListener("click", handleClearClick);
    el.resClr.addEventListener("click", handleClearClick);

    document.querySelectorAll('a[href="#!"]').forEach((a) => {
      a.addEventListener("click", (e) => e.preventDefault());
    });

    if (el.themeToggle) {
      el.themeToggle.addEventListener("click", toggleTheme);
    }

    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });
  }

  function init() {
    syncThemeToggle();
    bindAudio();
    bindUi();
    loadFromStorage();
    updatePlayerVisibility();
    rebuildSlotOptions();
    updateTotals();
    renderTable();
    applyChartTheme();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
