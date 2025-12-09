


//init selections
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, "slot_input");
});

// Constants
let PLAYER_COUNT = 5;
const name_p = document.querySelectorAll(".name_p");
const input_name = document.querySelector(".input_name");
const input_score = document.querySelectorAll(".input_score");
const btn_add = document.querySelector('.btn_add');
const total = document.querySelectorAll('.total');
const tbody = document.querySelector(".tbody");
const btn_clr = document.querySelector(".btn_clr");
const btn_audio = document.querySelector(".btn_audio");
const audio = document.querySelector(".audio");
const res_add = document.querySelector(".add_responsive");
const res_clr = document.querySelector(".clear_responsive");
const playerCountSelect = document.getElementById("player_count");
let isPlaying = false;

// Audio control
btn_audio.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play();
        isPlaying = true;
    }
});

audio.addEventListener('ended', () => {
    isPlaying = false;
});

// Player data
let namearr = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
let s = null;
let dataupdate = [0, 0, 0, 0, 0];
let players = [[], [], [], [], []]; // Array of arrays for each player's scores
const tr = [];

// Player count change handler
playerCountSelect.addEventListener('change', (e) => {
    PLAYER_COUNT = parseInt(e.target.value);
    updatePlayerVisibility();
    resetGame();
});

// Update player visibility based on player count
function updatePlayerVisibility() {
    // Hide all players first
    for (let i = 1; i <= 5; i++) {
        const playerElements = document.querySelectorAll(`.player-${i}`);
        playerElements.forEach(el => {
            el.classList.add('player-hidden');
        });
    }

    // Show only the selected number of players
    for (let i = 1; i <= PLAYER_COUNT; i++) {
        const playerElements = document.querySelectorAll(`.player-${i}`);
        playerElements.forEach(el => {
            el.classList.remove('player-hidden');
        });
    }

    // Update slot options based on player count
    updateSlotOptions();
}

// Update slot selection options based on player count
function updateSlotOptions() {
    const slotSelect = document.querySelector(".slit");
    slotSelect.innerHTML = '<option value="" disabled selected>Pick slot</option>';

    for (let i = 1; i <= PLAYER_COUNT; i++) {
        slotSelect.innerHTML += `<option value="${i}">Slot ${i}</option>`;
    }

    // Reinitialize Materialize select
    M.FormSelect.init(slotSelect, "slot_input");
}

// Update chart data based on current player count
function updateChartData() {
    // Update chart labels
    data.labels = namearr.slice(0, PLAYER_COUNT);

    // Update chart data
    data.datasets[0].data = dataupdate.slice(0, PLAYER_COUNT);

    // Update background colors (keep only needed colors)
    const bgColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(54, 162, 235, 0.2)',
    ];
    data.datasets[0].backgroundColor = bgColors.slice(0, PLAYER_COUNT);

    // Update border colors
    const borderColors = ['red', 'green', 'violet', 'orange', 'blue'];
    data.datasets[0].borderColor = borderColors.slice(0, PLAYER_COUNT);
}

// Reset game when player count changes
function resetGame() {
    // Reset player names
    for (let i = 0; i < PLAYER_COUNT; i++) {
        namearr[i] = `Player ${i + 1}`;
        if (name_p[i]) {
            name_p[i].innerHTML = `Player ${i + 1}`;
        }
    }

    // Reset scores
    players = [[], [], [], [], []];
    dataupdate = [0, 0, 0, 0, 0];

    // Clear table
    tr.length = 0;
    render();

    // Update chart
    updateChartData();
    chart.update();

    // Clear inputs
    clearinput();
}

// Slot selection
const slot = document.querySelector(".slit");
slot.addEventListener('change', (e) => {
    s = e.target.value - 1;
    input_name.value = '';
});

input_name.addEventListener('input', () => {
    if (s == null) {
        alert('Please select a slot first');
        input_name.value = '';
        return;
    }
    name_p[s].innerHTML = input_name.value;
    namearr[s] = input_name.value;
    chart.update();
});

const clearinput = () => {
    for (let i = 0; i < input_score.length; i++) {
        input_score[i].value = null;
    }
};

const calculateMissingScore = (scores) => {
    // Find which player has 0 score (missing)
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

    // Validate input
    if (nonZeroCount === 0) {
        alert("Please enter at least one score");
        return null;
    }

    if (nonZeroCount === PLAYER_COUNT) {
        alert(`All scores are entered. Please leave one player's score empty to calculate.`);
        return null;
    }

    if (nonZeroCount !== PLAYER_COUNT - 1) {
        alert(`Please enter exactly ${PLAYER_COUNT - 1} scores and leave one empty`);
        return null;
    }

    // Calculate missing score (sum should be zero)
    const missingScore = -sum;
    scores[missingIndex] = missingScore;
    return scores;
};

const push = () => {
    // Get all scores from input
    const scores = [];
    for (let i = 0; i < PLAYER_COUNT; i++) {
        scores.push(Number(input_score[i].value) || 0);
    }

    // Calculate missing score
    const calculatedScores = calculateMissingScore([...scores]);
    if (!calculatedScores) {
        return; // Error already handled in calculateMissingScore
    }

    // Update player data
    for (let i = 0; i < PLAYER_COUNT; i++) {
        players[i].push(calculatedScores[i]);
    }

    // Add to table
    let row = '<tr>';
    for (let i = 0; i < PLAYER_COUNT; i++) {
        row += `<td>${calculatedScores[i]}</td>`;
    }
    row += '</tr>';
    tr.push(row);

    // Update totals
    updateTotals();
};

const updateTotals = () => {
    for (let i = 0; i < PLAYER_COUNT; i++) {
        const playerTotal = players[i].reduce((a, b) => a + b, 0);
        total[i].innerText = playerTotal;
        dataupdate[i] = playerTotal;
    }
};

const key = "scoreAppData";
const stored = () => {
    const dock = {};
    for (let i = 0; i < PLAYER_COUNT; i++) {
        dock[`p${i + 1}`] = players[i];
    }
    window.localStorage.setItem(key, JSON.stringify(dock));
};

const getStore = () => {
    var data = window.localStorage.getItem(key);
    if (data) {
        var item = JSON.parse(data);
        for (let i = 0; i < PLAYER_COUNT; i++) {
            players[i] = item[`p${i + 1}`] || [];
        }
    }
};

const data = {
    labels: namearr,
    datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
            'red',
            'green',
            'violet',
            'orange',
            'blue'
        ],
        borderWidth: 1
    }]
};

const chart = new Chart("myChart", {
    type: "bar",
    data: data,
    options: {
        legend: { display: false }
    }
});

const render = () => {
    tbody.innerHTML = tr.join('');
};

render();

// Event listeners
btn_clr.addEventListener('click', () => {
    if (confirm('This will clear all data. Are you sure?') == true) {
        window.location.reload(true);
    }
});

btn_add.addEventListener('click', () => {
    push();
    data.datasets[0].data = dataupdate;
    chart.update();
    clearinput();
    render();
});

res_add.addEventListener('click', () => {
    push();
    clearinput();
    render();
});

res_clr.addEventListener('click', () => {
    if (confirm('This will clear all data. Are you sure?') == true) {
        window.location.reload(true);
    }
});

// Initialize player visibility on page load
document.addEventListener('DOMContentLoaded', function () {
    updatePlayerVisibility();
    updateSlotOptions();
});

// Initialize from local storage if available
getStore();
updateTotals();
render();
