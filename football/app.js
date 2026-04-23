// Prediction engine + UI rendering.

const STORAGE_KEY = 'pl-predictions-v2';
const TOP_N = 6;

const state = {
  view: 'mun', // 'mun' | 'top6'
  predictions: loadPredictions(),
};

function loadPredictions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePredictions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.predictions));
}

function teamById(id) {
  return TEAMS.find(t => t.id === id);
}

// Determine the top six from the *current* standings (not predicted).
// This is stable — the fixture list for the Top 6 view is pinned to today's
// top six rather than shifting as predictions change.
function currentTopSix() {
  const rows = buildTable(CURRENT_STANDINGS);
  return rows.slice(0, TOP_N).map(r => r.id);
}

// Build a sorted table from a standings-map. Returns an array of rows with
// id, P, W, D, L, GF, GA, GD, Pts, and pos (1-based).
function buildTable(standingsMap) {
  const rows = Object.entries(standingsMap).map(([id, s]) => ({
    id,
    name: teamById(id).name,
    P: s.P, W: s.W, D: s.D, L: s.L,
    GF: s.GF, GA: s.GA,
    GD: s.GF - s.GA,
    Pts: s.W * 3 + s.D,
  }));
  rows.sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    if (b.GD !== a.GD) return b.GD - a.GD;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.name.localeCompare(b.name);
  });
  rows.forEach((r, i) => r.pos = i + 1);
  return rows;
}

// Apply all valid predictions on top of the current standings.
function predictedStandings() {
  // Deep-copy current standings so we can mutate.
  const map = {};
  for (const id of Object.keys(CURRENT_STANDINGS)) {
    map[id] = { ...CURRENT_STANDINGS[id] };
  }

  for (const fx of FIXTURES) {
    const pred = state.predictions[fx.id];
    if (!pred) continue;
    const { home: hs, away: as } = pred;
    if (!isValidScore(hs) || !isValidScore(as)) continue;

    const h = map[fx.home];
    const a = map[fx.away];
    h.P += 1; a.P += 1;
    h.GF += hs; h.GA += as;
    a.GF += as; a.GA += hs;
    if (hs > as) { h.W += 1; a.L += 1; }
    else if (hs < as) { a.W += 1; h.L += 1; }
    else { h.D += 1; a.D += 1; }
  }
  return map;
}

function isValidScore(n) {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 20;
}

// --- Rendering ---

function render() {
  renderTabs();
  renderFixtures();
  renderTable();
}

function renderTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.view);
  });
}

function fixturesForView() {
  if (state.view === 'mun') {
    return FIXTURES.filter(f => f.home === 'MUN' || f.away === 'MUN');
  }
  const topSix = new Set(currentTopSix());
  return FIXTURES.filter(f => topSix.has(f.home) || topSix.has(f.away));
}

function renderFixtures() {
  const container = document.getElementById('fixtures-body');
  const fixtures = fixturesForView().slice().sort((a, b) => a.date.localeCompare(b.date));
  const byDate = {};
  for (const fx of fixtures) {
    (byDate[fx.date] ||= []).push(fx);
  }

  const dates = Object.keys(byDate).sort();
  container.innerHTML = dates.map(date => {
    const d = new Date(date + 'T12:00:00');
    const label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return `
      <div class="matchday-group">
        <div class="matchday-label">${label}</div>
        ${byDate[date].map(renderFixtureRow).join('')}
      </div>
    `;
  }).join('');

  // Wire up inputs.
  container.querySelectorAll('.score-input').forEach(input => {
    input.addEventListener('input', onScoreChange);
    input.addEventListener('blur', () => {
      // Normalize empty/invalid to blank.
      if (input.value.trim() === '') onScoreChange({ target: input });
    });
  });

  const countEl = document.getElementById('fixtures-count');
  if (countEl) countEl.textContent = `${fixtures.length} fixtures`;
}

function renderFixtureRow(fx) {
  const home = teamById(fx.home);
  const away = teamById(fx.away);
  const pred = state.predictions[fx.id] || {};
  const involvesMun = fx.home === 'MUN' || fx.away === 'MUN';

  return `
    <div class="fixture ${involvesMun ? 'involves-mun' : ''}" data-fixture="${fx.id}">
      <div class="team home">
        <span class="team-name">${home.name}</span>
        <span class="team-badge" title="${home.name}">${home.short}</span>
      </div>
      <div class="score-box">
        <input type="number" class="score-input ${pred.home != null ? 'filled' : ''}"
               data-fixture="${fx.id}" data-side="home"
               min="0" max="20" placeholder="–"
               value="${pred.home != null ? pred.home : ''}" />
        <span class="score-sep">–</span>
        <input type="number" class="score-input ${pred.away != null ? 'filled' : ''}"
               data-fixture="${fx.id}" data-side="away"
               min="0" max="20" placeholder="–"
               value="${pred.away != null ? pred.away : ''}" />
      </div>
      <div class="team away">
        <span class="team-badge" title="${away.name}">${away.short}</span>
        <span class="team-name">${away.name}</span>
      </div>
    </div>
  `;
}

function onScoreChange(e) {
  const el = e.target;
  const id = el.dataset.fixture;
  const side = el.dataset.side;
  const raw = el.value.trim();

  const pred = state.predictions[id] || {};
  if (raw === '') {
    delete pred[side];
  } else {
    const n = parseInt(raw, 10);
    if (!isValidScore(n)) return;
    pred[side] = n;
  }

  if (pred.home == null && pred.away == null) {
    delete state.predictions[id];
  } else {
    state.predictions[id] = pred;
  }

  el.classList.toggle('filled', pred[side] != null);
  savePredictions();
  renderTable();
}

function renderTable() {
  const currentRows = buildTable(CURRENT_STANDINGS);
  const currentPos = Object.fromEntries(currentRows.map(r => [r.id, r.pos]));

  const predictedRows = buildTable(predictedStandings());
  const topSix = new Set(currentTopSix());

  const tbody = document.getElementById('standings-body');
  tbody.innerHTML = predictedRows.map(r => {
    const delta = currentPos[r.id] - r.pos; // positive = moved up
    let change = '';
    if (delta > 0) change = `<span class="pos-change up">▲ ${delta}</span>`;
    else if (delta < 0) change = `<span class="pos-change down">▼ ${-delta}</span>`;

    const classes = [];
    if (r.id === 'MUN') classes.push('highlight-mun');
    if (r.pos <= TOP_N) classes.push('top-six');
    if (r.pos >= 18) classes.push('relegation');

    return `
      <tr class="${classes.join(' ')}">
        <td class="pos-col">${r.pos}</td>
        <td class="team-col">
          <span class="team-badge" style="margin-right:8px">${teamById(r.id).short}</span>
          ${r.name}${change}
        </td>
        <td>${r.P}</td>
        <td>${r.W}</td>
        <td>${r.D}</td>
        <td>${r.L}</td>
        <td>${r.GF}</td>
        <td>${r.GA}</td>
        <td>${r.GD > 0 ? '+' + r.GD : r.GD}</td>
        <td class="pts-col">${r.Pts}</td>
      </tr>
    `;
  }).join('');

  const countEl = document.getElementById('predictions-count');
  if (countEl) {
    const n = Object.values(state.predictions).filter(p => p.home != null && p.away != null).length;
    countEl.textContent = `${n} prediction${n === 1 ? '' : 's'}`;
  }
}

function clearAllPredictions() {
  if (!confirm('Clear all predictions?')) return;
  state.predictions = {};
  savePredictions();
  render();
}

// Init.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      render();
    });
  });
  document.getElementById('clear-btn').addEventListener('click', clearAllPredictions);
  render();
});
