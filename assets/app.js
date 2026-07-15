/* ============================================================
   SÂM LỐC - SCORE TRACKER
   Main Application Logic
   ============================================================ */

// --- DOM Elements ---
const name_p = document.querySelectorAll('.name_p');
const input_name = document.getElementById('ip_name');
const input_score = document.querySelectorAll('.input_score');
const btn_add = document.getElementById('btnAdd');
const total = document.querySelectorAll('.total');
const tbody = document.getElementById('tableBody');
const tableHead = document.getElementById('tableHead');
const btn_clr = document.getElementById('btnClear');
const btn_audio = document.getElementById('btnAudio');
const audio = document.querySelector('.audio');
const slotSelect = document.getElementById('slotSelect');
const playerCountToggles = document.getElementById('playerCountToggles');
const toastContainer = document.getElementById('toastContainer');
const confirmModal = document.getElementById('confirmModal');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
const emptyState = document.getElementById('emptyState');
const roundCount = document.getElementById('roundCount');
const currentYearSpan = document.getElementById('currentYear');
const themeToggle = document.getElementById('themeToggle');
const autoSubmitToggle = document.getElementById('autoSubmitToggle');

// --- Constants ---
let PLAYER_COUNT = 5;
let isPlaying = false;
let s = null;
let autoSubmit = false;
const autoSubmitKey = 'samlokAutoSubmit';

// Player data
let namearr = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
let dataupdate = [0, 0, 0, 0, 0];
let players = [[], [], [], [], []];
const tr = [];

// --- Set current year ---
if (currentYearSpan) {
  currentYearSpan.textContent = new Date().getFullYear();
}

// --- Toast System ---
function showToast(message, type = 'error') {
  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto-remove after animation
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

// --- Modal System ---
function showConfirmModal(onConfirm) {
  confirmModal.classList.add('active');

  const handleConfirm = () => {
    confirmModal.classList.remove('active');
    cleanup();
    onConfirm();
  };

  const handleCancel = () => {
    confirmModal.classList.remove('active');
    cleanup();
  };

  const cleanup = () => {
    modalConfirm.removeEventListener('click', handleConfirm);
    modalCancel.removeEventListener('click', handleCancel);
    confirmModal.removeEventListener('click', handleOverlay);
  };

  const handleOverlay = (e) => {
    if (e.target === confirmModal) {
      handleCancel();
    }
  };

  modalConfirm.addEventListener('click', handleConfirm);
  modalCancel.addEventListener('click', handleCancel);
  confirmModal.addEventListener('click', handleOverlay);
}

// --- Audio Control ---
function toggleAudio() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    btn_audio.innerHTML = '<span class="btn-icon">🔇</span>';
    mobAudio.classList.add('is-muted');
    mobAudio.querySelector('.mob-action-icon').textContent = '🔇';
  } else {
    audio.play();
    isPlaying = true;
    btn_audio.innerHTML = '<span class="btn-icon">🔊</span>';
    mobAudio.classList.remove('is-muted');
    mobAudio.querySelector('.mob-action-icon').textContent = '🔊';
  }
}

btn_audio.addEventListener('click', toggleAudio);

audio.addEventListener('ended', () => {
  isPlaying = false;
  btn_audio.innerHTML = '<span class="btn-icon">🔇</span>';
  mobAudio.classList.add('is-muted');
  mobAudio.querySelector('.mob-action-icon').textContent = '🔇';
});

// --- Theme System ---
const themeKey = 'samlokTheme';
let chartReady = false;
let currentTheme = 'dark';
function applyTheme(theme) {
  currentTheme = theme;
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggle) themeToggle.textContent = '🌙';
  }
  // Refresh chart colors to match theme (only once the chart exists)
  if (chartReady && typeof chart !== 'undefined') {
    const tickColor = theme === 'light' ? '#7a7364' : '#c4b99a';
    chart.options.scales.xAxes[0].ticks.fontColor = tickColor;
    chart.options.scales.yAxes[0].ticks.fontColor = tickColor;
    chart.options.tooltips.backgroundColor = theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(26, 51, 41, 0.95)';
    chart.options.tooltips.titleFontColor = theme === 'light' ? '#b8922e' : '#d4a843';
    chart.options.tooltips.bodyFontColor = theme === 'light' ? '#23291f' : '#e8e0d0';
    chart.update();
  }
}

if (themeToggle) {
  applyTheme(window.localStorage.getItem(themeKey) || 'dark');
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    window.localStorage.setItem(themeKey, next);
  });
}

// --- Player Count Toggles ---
playerCountToggles.addEventListener('click', (e) => {
  const toggle = e.target.closest('.count-toggle');
  if (!toggle) return;

  const count = parseInt(toggle.dataset.count);
  if (count === PLAYER_COUNT) return;

  PLAYER_COUNT = count;

  // Update active state
  document.querySelectorAll('.count-toggle').forEach(t => t.classList.remove('active'));
  toggle.classList.add('active');

  updatePlayerVisibility();
  resetGame();
});

// --- Slot Selection ---
slotSelect.addEventListener('change', (e) => {
  s = e.target.value ? parseInt(e.target.value) - 1 : null;
  input_name.value = '';
});

// --- Name Input ---
input_name.addEventListener('input', () => {
  if (s == null) {
    showToast('Vui lòng chọn vị trí (slot) trước khi đặt tên', 'warning');
    input_name.value = '';
    return;
  }
  const displayName = input_name.value || `Player ${s + 1}`;
  name_p[s].textContent = displayName;
  namearr[s] = displayName;

  // Cập nhật label trong khu vực nhập điểm
  const scoreLabel = document.querySelector(`.input_p${s + 1} .input-label`);
  if (scoreLabel) {
    scoreLabel.textContent = displayName;
  }

  // Cập nhật header bảng lịch sử ván đấu
  updateTableHeader();

  updateChartData();
  chart.update();
});

// --- Track last focused score input ---
let lastFocusedScoreInput = null;

input_score.forEach((input) => {
  input.addEventListener('focus', () => {
    lastFocusedScoreInput = input;
  });
});

// --- Quick Point Buttons ---
document.querySelector('.quick-actions').addEventListener('click', (e) => {
  const quickBtn = e.target.closest('.quick-btn');
  if (!quickBtn) return;

  const val = parseInt(quickBtn.dataset.val);

  // Use the last focused score input if available
  if (lastFocusedScoreInput && !lastFocusedScoreInput.classList.contains('player-hidden')) {
    lastFocusedScoreInput.value = val;
    lastFocusedScoreInput.focus();
    checkAutoSubmit();
    return;
  }

  // Fallback: find first empty visible input
  for (let i = 0; i < input_score.length; i++) {
    const inp = input_score[i];
    if (inp.classList.contains('player-hidden')) continue;
    if (!inp.value || inp.value === '0') {
      inp.value = val;
      inp.focus();
      checkAutoSubmit();
      return;
    }
  }
});

// --- Player Visibility ---
function updatePlayerVisibility() {
  for (let i = 1; i <= 5; i++) {
    const playerElements = document.querySelectorAll(`.player-${i}`);
    playerElements.forEach(el => {
      if (i <= PLAYER_COUNT) {
        el.classList.remove('player-hidden');
      } else {
        el.classList.add('player-hidden');
      }
    });
  }
  updateSlotOptions();
  updateTableHeader();
}

// --- Slot Options ---
function updateSlotOptions() {
  slotSelect.innerHTML = '<option value="" disabled selected>Pick slot</option>';
  for (let i = 1; i <= PLAYER_COUNT; i++) {
    slotSelect.innerHTML += `<option value="${i}">Slot ${i}</option>`;
  }
}

// --- Table Header ---
function updateTableHeader() {
  const headerNames = namearr.slice(0, PLAYER_COUNT);
  let headerRow = '<tr>';
  headerNames.forEach((name) => {
    headerRow += `<th>${name}</th>`;
  });
  headerRow += '</tr>';
  tableHead.innerHTML = headerRow;
  render();
}

// --- Chart ---
const chartColors = {
  bg: [
    'rgba(231, 76, 60, 0.25)',
    'rgba(46, 204, 113, 0.25)',
    'rgba(165, 105, 189, 0.25)',
    'rgba(240, 160, 75, 0.25)',
    'rgba(93, 173, 226, 0.25)',
  ],
  border: ['#e74c3c', '#2ecc71', '#a569bd', '#f0a04b', '#5dade2'],
};

const data = {
  labels: namearr,
  datasets: [{
    data: [0, 0, 0, 0, 0],
    backgroundColor: [...chartColors.bg],
    borderColor: [...chartColors.border],
    borderWidth: 2,
  }],
};

const chart = new Chart('myChart', {
  type: 'bar',
  data: data,
  options: {
    legend: { display: false },
    scales: {
      xAxes: [{
        ticks: {
          fontColor: '#c4b99a',
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
        },
        gridLines: {
          color: 'rgba(61, 48, 32, 0.3)',
          zeroLineColor: 'rgba(212, 168, 67, 0.3)',
        },
      }],
      yAxes: [{
        ticks: {
          fontColor: '#c4b99a',
          fontSize: 11,
          fontFamily: "'Inter', sans-serif",
          beginAtZero: true,
        },
        gridLines: {
          color: 'rgba(61, 48, 32, 0.3)',
          zeroLineColor: 'rgba(212, 168, 67, 0.5)',
        },
      }],
    },
    tooltips: {
      backgroundColor: 'rgba(26, 51, 41, 0.95)',
      titleFontColor: '#d4a843',
      bodyFontColor: '#e8e0d0',
      borderColor: 'rgba(212, 168, 67, 0.3)',
      borderWidth: 1,
      cornerRadius: 8,
      titleFontFamily: "'Inter', sans-serif",
      bodyFontFamily: "'Inter', sans-serif",
    },
  },
});

chartReady = true;
// Apply saved theme colors to the chart now that it exists
applyTheme(currentTheme);

function updateChartData() {
  data.labels = namearr.slice(0, PLAYER_COUNT);
  data.datasets[0].data = dataupdate.slice(0, PLAYER_COUNT);
  data.datasets[0].backgroundColor = chartColors.bg.slice(0, PLAYER_COUNT);
  data.datasets[0].borderColor = chartColors.border.slice(0, PLAYER_COUNT);
}

// --- Game Logic ---
function resetGame() {
  for (let i = 0; i < PLAYER_COUNT; i++) {
    namearr[i] = `Player ${i + 1}`;
    if (name_p[i]) {
      name_p[i].textContent = `Player ${i + 1}`;
    }
    // Reset label trong khu vực nhập điểm
    const scoreLabel = document.querySelector(`.input_p${i + 1} .input-label`);
    if (scoreLabel) {
      scoreLabel.textContent = `P${i + 1}`;
    }
  }

  players = [[], [], [], [], []];
  dataupdate = [0, 0, 0, 0, 0];
  tr.length = 0;
  updateTableHeader();
  updateTotals();
  updateChartData();
  chart.update();
  clearinput();
  updateEmptyState();
}

function clearinput() {
  for (let i = 0; i < input_score.length; i++) {
    input_score[i].value = '';
  }
}

function calculateMissingScore(scores) {
  let missingIndex = -1;
  let nonZeroCount = 0;
  let sum = 0;
  let emptyCount = 0;

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] === 0 || scores[i] === null || isNaN(scores[i])) {
      // Check if input was actually empty (not '0')
      if (input_score[i].value.trim() === '' || input_score[i].value === null) {
        emptyCount++;
        missingIndex = i;
      } else {
        // User typed 0
        nonZeroCount++;
      }
    } else {
      sum += scores[i];
      nonZeroCount++;
    }
  }

  if (nonZeroCount === 0 && emptyCount === PLAYER_COUNT) {
    showToast('Vui lòng nhập ít nhất một điểm số', 'warning');
    return null;
  }

  if (emptyCount === 0) {
    showToast(`Đã nhập đủ ${PLAYER_COUNT} điểm. Hãy để trống một ô để tính điểm tự động`, 'warning');
    return null;
  }

  if (emptyCount > 1) {
    showToast(`Vui lòng chỉ để trống đúng 1 ô. Hiện đang trống ${emptyCount} ô`, 'warning');
    return null;
  }

  const missingScore = -sum;
  scores[missingIndex] = missingScore;
  return scores;
}

function push() {
  const scores = [];
  for (let i = 0; i < PLAYER_COUNT; i++) {
    const raw = input_score[i].value.trim();
    scores.push(raw === '' ? 0 : Number(raw));
  }

  const calculatedScores = calculateMissingScore([...scores]);
  if (!calculatedScores) {
    return;
  }

  // Update player data
  for (let i = 0; i < PLAYER_COUNT; i++) {
    players[i].push(calculatedScores[i]);
  }

  // Add to table rows
  let row = '<tr>';
  for (let i = 0; i < PLAYER_COUNT; i++) {
    const val = calculatedScores[i];
    const cls = val > 0 ? 'score-positive' : val < 0 ? 'score-negative' : '';
    row += `<td class="${cls}">${val}</td>`;
  }
  row += '</tr>';
  tr.push(row);

  updateTotals();
  updateEmptyState();
  clearinput();

  // Focus first input on non-touch devices only (avoids forcing the
  // mobile keyboard open after every round)
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isTouch && input_score[0]) input_score[0].focus();
}

// --- Animated count-up ---
function animateValue(el, start, end, duration = 600) {
  const obj = el;
  if (obj._animFrame) cancelAnimationFrame(obj._animFrame);
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    obj.textContent = current;
    if (progress < 1) {
      obj._animFrame = requestAnimationFrame(step);
    } else {
      obj.textContent = end;
    }
  }
  obj._animFrame = requestAnimationFrame(step);
}

function updateTotals() {
  let maxTotal = -Infinity;
  for (let i = 0; i < PLAYER_COUNT; i++) {
    const playerTotal = players[i].reduce((a, b) => a + b, 0);
    dataupdate[i] = playerTotal;
    if (playerTotal > maxTotal) maxTotal = playerTotal;
  }

  for (let i = 0; i < PLAYER_COUNT; i++) {
    const playerTotal = dataupdate[i];
    const prev = parseInt(total[i].textContent) || 0;
    animateValue(total[i], prev, playerTotal);

    // Color based on value
    if (playerTotal > 0) {
      total[i].style.color = '#2ecc71';
    } else if (playerTotal < 0) {
      total[i].style.color = '#e74c3c';
    } else {
      total[i].style.color = '';
    }
  }

  updateLeader(maxTotal);
}

// --- Leader crown badge ---
function updateLeader(maxTotal) {
  for (let i = 1; i <= 5; i++) {
    const chip = document.querySelector(`.player-chip.player-${i}`);
    if (chip) chip.classList.remove('is-leader');
  }
  if (maxTotal === -Infinity || maxTotal <= 0) return;
  for (let i = 0; i < PLAYER_COUNT; i++) {
    if (dataupdate[i] === maxTotal) {
      const chip = document.querySelector(`.player-chip.player-${i + 1}`);
      if (chip && !chip.classList.contains('player-hidden')) {
        chip.classList.add('is-leader');
      }
      break;
    }
  }
}

function render() {
  tbody.innerHTML = tr.join('');
  updateRoundCount();
}

function updateEmptyState() {
  if (tr.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('scoreTable').querySelector('tbody').classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    document.getElementById('scoreTable').querySelector('tbody').classList.remove('hidden');
  }
}

function updateRoundCount() {
  roundCount.textContent = tr.length === 0 ? '0 ván' : `${tr.length} ván`;
}

// --- Local Storage ---
const key = 'samlokScoreAppData';

function store() {
  const dock = {};
  for (let i = 0; i < 5; i++) {
    dock[`p${i + 1}`] = players[i] || [];
  }
  dock.playerCount = PLAYER_COUNT;
  dock.namearr = namearr;
  window.localStorage.setItem(key, JSON.stringify(dock));
}

function getStore() {
  const raw = window.localStorage.getItem(key);
  if (raw) {
    try {
      const item = JSON.parse(raw);
      PLAYER_COUNT = item.playerCount || 5;
      namearr = item.namearr || namearr;

      for (let i = 0; i < 5; i++) {
        players[i] = item[`p${i + 1}`] || [];
      }

      // Restore table rows
      if (players[0].length > 0) {
        tr.length = 0;
        for (let j = 0; j < players[0].length; j++) {
          let row = '<tr>';
          for (let i = 0; i < PLAYER_COUNT; i++) {
            const val = players[i][j] || 0;
            const cls = val > 0 ? 'score-positive' : val < 0 ? 'score-negative' : '';
            row += `<td class="${cls}">${val}</td>`;
          }
          row += '</tr>';
          tr.push(row);
        }
      }

      // Restore player names in DOM
      for (let i = 0; i < PLAYER_COUNT; i++) {
        if (name_p[i]) {
          name_p[i].textContent = namearr[i] || `Player ${i + 1}`;
        }
        // Restore label trong khu vực nhập điểm
        const scoreLabel = document.querySelector(`.input_p${i + 1} .input-label`);
        if (scoreLabel) {
          scoreLabel.textContent = namearr[i] || `P${i + 1}`;
        }
      }

      // Restore player count toggle
      const activeToggle = document.querySelector(`.count-toggle[data-count="${PLAYER_COUNT}"]`);
      if (activeToggle) {
        document.querySelectorAll('.count-toggle').forEach(t => t.classList.remove('active'));
        activeToggle.classList.add('active');
      }
    } catch (e) {
      // Invalid data, ignore
    }
  }
}

// --- Submit Round (reused by button, Enter key, mobile bar & auto-submit) ---
function submitRound() {
  push();
  updateChartData();
  chart.update();
  render();
  store();
}

// --- Event Listeners ---
btn_add.addEventListener('click', submitRound);

btn_clr.addEventListener('click', () => {
  showConfirmModal(() => {
    window.localStorage.removeItem(key);
    window.location.reload();
  });
});

// --- Mobile Sticky Action Bar (thumb-reachable on phones) ---
const mobAdd = document.getElementById('mobAdd');
const mobClear = document.getElementById('mobClear');
const mobAudio = document.getElementById('mobAudio');

function addRound() {
  if (navigator.vibrate) navigator.vibrate(15); // subtle haptic tap
  submitRound();
}

if (mobAdd) mobAdd.addEventListener('click', addRound);
if (mobClear) {
  mobClear.addEventListener('click', () => {
    showConfirmModal(() => {
      window.localStorage.removeItem(key);
      window.location.reload();
    });
  });
}
if (mobAudio) mobAudio.addEventListener('click', toggleAudio);

// --- Auto-submit toggle ---
function saveAutoSubmit() {
  window.localStorage.setItem(autoSubmitKey, autoSubmit ? '1' : '0');
}

function loadAutoSubmit() {
  autoSubmit = window.localStorage.getItem(autoSubmitKey) === '1';
  if (autoSubmitToggle) autoSubmitToggle.checked = autoSubmit;
}

if (autoSubmitToggle) {
  autoSubmitToggle.addEventListener('change', () => {
    autoSubmit = autoSubmitToggle.checked;
    saveAutoSubmit();
    if (autoSubmit) {
      checkAutoSubmit();
    }
  });
}

// Returns true if exactly one visible score input is empty
// (meaning every other player already has a value entered)
function exactlyOneEmptyInput() {
  let emptyCount = 0;
  for (let i = 0; i < PLAYER_COUNT; i++) {
    const inp = input_score[i];
    if (!inp || inp.classList.contains('player-hidden')) continue;
    if (inp.value.trim() === '') emptyCount++;
  }
  // Auto-submit only when exactly one visible input remains empty
  // (i.e. every other player already has a value entered).
  return emptyCount === 1;
}

// Trigger auto-submit when the last necessary score is entered
function checkAutoSubmit() {
  if (!autoSubmit) return;
  if (exactlyOneEmptyInput()) {
    submitRound();
  }
}

// Listen on each score input: when auto-submit is on and only one
// input is left empty, automatically record the round.
input_score.forEach((input) => {
  input.addEventListener('input', checkAutoSubmit);
});

// --- Enter key to submit ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeEl = document.activeElement;
    // Check if we're in a score input
    if (activeEl && activeEl.classList.contains('input_score')) {
      e.preventDefault();
      submitRound();
    }
  }
});

// --- Page unload - save data ---
window.addEventListener('beforeunload', () => {
  store();
});

// --- Scroll Reveal ---
function setupReveal() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => c.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => observer.observe(c));
}

// --- Initialize ---
function init() {
  getStore();
  loadAutoSubmit();
  updatePlayerVisibility();
  updateSlotOptions();
  updateTableHeader();
  updateTotals();
  updateChartData();
  chart.update();
  render();
  // Ensure empty state is correct
  if (tr.length === 0) {
    // Already handled by updateEmptyState called via render -> but updateTableHeader calls render before tr might be populated
  }
  updateEmptyState();
  setupReveal();

  // Update total display colors
  for (let i = 0; i < 5; i++) {
    const val = dataupdate[i];
    if (total[i]) {
      if (val > 0) total[i].style.color = '#2ecc71';
      else if (val < 0) total[i].style.color = '#e74c3c';
    }
  }
}

init();