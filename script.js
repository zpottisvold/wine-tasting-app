/* ═══════════════════════════════════════════════
   Wine Tasting Notes — script.js
   ═══════════════════════════════════════════════ */

const STORAGE_KEY = 'wineTastings_v2';

/* ── Single-select button groups ──────────────── */
document.querySelectorAll('.button-group').forEach(group => {
  group.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.toggle('active', !btn.dataset._wasActive);

      // track if it was already active so clicking again deselects
      group.querySelectorAll('button').forEach(b => {
        b.dataset._wasActive = b.classList.contains('active') ? '1' : '';
      });
    });
  });
});

/* ── Multi-select chips ───────────────────────── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('active'));
});

/* ── Color swatches (single-select per color type) */
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    document.querySelectorAll(`.color-btn[data-group="${group}"]`).forEach(b => {
      b.classList.remove('active');
    });
    btn.classList.add('active');
  });
});

/* ── Collect current state ───────────────────── */
function collectState() {
  // Single-select groups
  function getGroup(selector) {
    const active = document.querySelector(`${selector} button.active`);
    return active ? active.textContent.trim() : '';
  }

  // Multi-select chips
  function getChips(group) {
    return [...document.querySelectorAll(`.chip-group[data-group="${group}"] .chip.active`)]
      .map(c => c.textContent.trim());
  }

  // Color swatch
  function getColor() {
    const active = document.querySelector('.color-btn.active');
    return active ? active.textContent.trim() : '';
  }

  return {
    // Details
    wineName: document.getElementById('wineName').value.trim(),
    producer: document.getElementById('producer').value.trim(),
    vintage: document.getElementById('vintage').value.trim(),

    // Look
    lookIntensity: getGroup('[data-group="lookIntensity"]'),
    color: getColor(),
    clarity: getGroup('[data-group="clarity"]'),
    bubbles: getGroup('[data-group="bubbles"]'),

    // Nose
    noseCondition: getGroup('[data-group="noseCondition"]'),
    noseIntensity: getGroup('[data-group="noseIntensity"]'),
    noseFruit: getChips('noseFruit'),
    noseNonFruit: getChips('noseNonFruit'),
    noseDevelopment: getGroup('[data-group="noseDevelopment"]'),
    noseNotes: document.getElementById('noseNotes').value.trim(),

    // Palate
    sweetness: getGroup('[data-group="sweetness"]'),
    acidity: getGroup('[data-group="acidity"]'),
    tannin: getGroup('[data-group="tannin"]'),
    tanninTexture: getGroup('[data-group="tanninTexture"]'),
    body: getGroup('[data-group="body"]'),
    alcohol: getGroup('[data-group="alcohol"]'),
    finish: getGroup('[data-group="finish"]'),
    palateFlavours: getChips('palateFlavours'),
    palataNotes: document.getElementById('palataNotes').value.trim(),

    // Conclusions
    quality: getGroup('[data-group="quality"]'),
    readiness: getGroup('[data-group="readiness"]'),

    // Guess
    guessGrape: document.getElementById('guessGrape').value.trim(),
    guessCountry: document.getElementById('guessCountry').value.trim(),
    guessRegion: document.getElementById('guessRegion').value.trim(),
    guessProducer: document.getElementById('guessProducer').value.trim(),
    guessVintage: document.getElementById('guessVintage').value.trim(),
    guessPrice: getGroup('[data-group="guessPrice"]'),
    overallNotes: document.getElementById('overallNotes').value.trim(),

    timestamp: new Date().toISOString(),
    id: Date.now().toString(),
  };
}

/* ── Apply state to DOM ───────────────────────── */
function applyState(data) {
  // Text fields
  const fields = ['wineName', 'producer', 'vintage', 'noseNotes', 'palataNotes',
                  'guessGrape', 'guessCountry', 'guessRegion', 'guessProducer',
                  'guessVintage', 'overallNotes'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = data[id] || '';
  });

  // Single-select groups
  const singleGroups = {
    lookIntensity: data.lookIntensity,
    clarity: data.clarity,
    bubbles: data.bubbles,
    noseCondition: data.noseCondition,
    noseIntensity: data.noseIntensity,
    noseDevelopment: data.noseDevelopment,
    sweetness: data.sweetness,
    acidity: data.acidity,
    tannin: data.tannin,
    tanninTexture: data.tanninTexture,
    body: data.body,
    alcohol: data.alcohol,
    finish: data.finish,
    quality: data.quality,
    readiness: data.readiness,
    guessPrice: data.guessPrice,
  };

  Object.entries(singleGroups).forEach(([groupName, value]) => {
    const group = document.querySelector(`[data-group="${groupName}"]`);
    if (!group) return;
    group.querySelectorAll('button').forEach(btn => {
      const isActive = btn.textContent.trim() === value;
      btn.classList.toggle('active', isActive);
      btn.dataset._wasActive = isActive ? '1' : '';
    });
  });

  // Color swatches
  document.querySelectorAll('.color-btn').forEach(btn => {
    const isActive = btn.textContent.trim() === (data.color || '');
    btn.classList.toggle('active', isActive);
  });

  // Chip groups
  const chipGroups = {
    noseFruit: data.noseFruit || [],
    noseNonFruit: data.noseNonFruit || [],
    palateFlavours: data.palateFlavours || [],
  };

  Object.entries(chipGroups).forEach(([groupName, activeChips]) => {
    document.querySelectorAll(`.chip-group[data-group="${groupName}"] .chip`).forEach(chip => {
      chip.classList.toggle('active', activeChips.includes(chip.textContent.trim()));
    });
  });
}

/* ── Clear all fields ─────────────────────────── */
function clearAll() {
  document.querySelectorAll('input, textarea').forEach(el => el.value = '');
  document.querySelectorAll('button.active').forEach(btn => {
    btn.classList.remove('active');
    btn.dataset._wasActive = '';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Local storage helpers ───────────────────── */
function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(tastings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tastings));
}

/* ── Render saved panel ───────────────────────── */
function renderSavedPanel() {
  const tastings = loadAll();
  const list = document.getElementById('savedList');
  const count = document.getElementById('savedCount');

  count.textContent = tastings.length;

  if (tastings.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍷</div>
        <p>No tastings saved yet.<br>Fill in your notes and tap Save.</p>
      </div>`;
    return;
  }

  list.innerHTML = tastings.map((t, i) => {
    const name = t.wineName || t.guessGrape || 'Unnamed Wine';
    const date = new Date(t.timestamp).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const meta = [
      t.guessCountry,
      t.guessRegion,
      t.guessVintage || t.vintage,
      t.quality,
    ].filter(Boolean).join(' · ');

    return `
      <div class="saved-item" data-index="${i}">
        <div class="saved-item-name">${escHtml(name)}</div>
        ${meta ? `<div class="saved-item-meta">${escHtml(meta)}</div>` : ''}
        <div class="saved-item-date">${date}</div>
        <div class="saved-item-actions">
          <button class="btn-load" data-index="${i}">Load</button>
          <button class="btn-delete" data-index="${i}">Delete</button>
        </div>
      </div>`;
  }).join('');

  // Load
  list.querySelectorAll('.btn-load').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const tasting = tastings[+btn.dataset.index];
      applyState(tasting);
      closePanel();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Tasting loaded');
    });
  });

  // Delete
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm('Delete this tasting?')) return;
      tastings.splice(+btn.dataset.index, 1);
      saveAll(tastings);
      renderSavedPanel();
    });
  });
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Panel open/close ─────────────────────────── */
const panel = document.getElementById('savedPanel');
const overlay = document.getElementById('overlay');

function openPanel() {
  renderSavedPanel();
  panel.classList.remove('hidden');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  panel.classList.add('hidden');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('viewSaved').addEventListener('click', openPanel);
document.getElementById('closePanel').addEventListener('click', closePanel);
overlay.addEventListener('click', closePanel);

/* ── Toast ─────────────────────────────────────── */
let toastTimer;
function showToast(msg = 'Saved ✓') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

/* ── Save ─────────────────────────────────────── */
document.getElementById('saveButton').addEventListener('click', () => {
  const state = collectState();
  const tastings = loadAll();
  tastings.unshift(state);          // newest first
  saveAll(tastings);
  document.getElementById('savedCount').textContent = tastings.length;
  showToast('Tasting saved ✓');
});

/* ── Clear ────────────────────────────────────── */
document.getElementById('clearButton').addEventListener('click', () => {
  if (confirm('Clear all fields and start a new tasting?')) clearAll();
});

/* ── Update count on load ────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const tastings = loadAll();
  document.getElementById('savedCount').textContent = tastings.length;
});
