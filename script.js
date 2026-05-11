/* ═══════════════════════════════════════════════════
   Wine Tasting Notes — script.js
   Wheel + AI + existing functionality
═══════════════════════════════════════════════════ */

const STORAGE_KEY = 'wineTastings_v2';
const API_KEY_KEY = 'wt_anthropic_key';

/* ── Wheel Data ──────────────────────────────────────
   8 categories → sub-categories → specific descriptors
─────────────────────────────────────────────────── */
const WHEEL_DATA = [
  {
    id: 'fruit', label: 'Fruit', color: '#C0392B',
    sub: [
      { label: 'Citrus',      items: ['Lemon', 'Lime', 'Grapefruit', 'Orange Peel', 'Mandarin'] },
      { label: 'Stone Fruit', items: ['Peach', 'Apricot', 'Nectarine', 'White Plum', 'Mirabelle'] },
      { label: 'Tropical',    items: ['Mango', 'Pineapple', 'Lychee', 'Passion Fruit', 'Banana', 'Guava'] },
      { label: 'Red Fruit',   items: ['Strawberry', 'Raspberry', 'Cherry', 'Cranberry', 'Redcurrant', 'Pomegranate'] },
      { label: 'Black Fruit', items: ['Blackberry', 'Blackcurrant', 'Blueberry', 'Black Cherry', 'Damson'] },
      { label: 'Dried Fruit', items: ['Fig', 'Prune', 'Raisin', 'Date', 'Sultana'] },
    ],
  },
  {
    id: 'floral', label: 'Floral', color: '#8E44AD',
    sub: [
      { label: 'Rose',       items: ['Rose', 'Rose Water', 'Rose Petal'] },
      { label: 'Violet',     items: ['Violet', 'Iris', 'Lavender'] },
      { label: 'Blossom',    items: ['Orange Blossom', 'Jasmine', 'Acacia', 'Elderflower', 'Honeysuckle'] },
    ],
  },
  {
    id: 'herbal', label: 'Herbal', color: '#27AE60',
    sub: [
      { label: 'Green',   items: ['Cut Grass', 'Green Bell Pepper', 'Tomato Leaf', 'Hay', 'Green Tea'] },
      { label: 'Herbs',   items: ['Mint', 'Eucalyptus', 'Thyme', 'Rosemary', 'Fennel', 'Dill', 'Tarragon'] },
      { label: 'Vegetal', items: ['Asparagus', 'Artichoke', 'Cabbage', 'Olive', 'Seaweed'] },
    ],
  },
  {
    id: 'spice', label: 'Spice', color: '#D35400',
    sub: [
      { label: 'Warm Spice', items: ['Cinnamon', 'Clove', 'Nutmeg', 'Anise', 'Liquorice', 'Cardamom'] },
      { label: 'Pepper',     items: ['Black Pepper', 'White Pepper', 'Pink Pepper'] },
      { label: 'Savoury',    items: ['Soy Sauce', 'Marmite', 'Olive Brine', 'Dried Meat', 'Anchovy'] },
    ],
  },
  {
    id: 'oak', label: 'Oak', color: '#795548',
    sub: [
      { label: 'Toast',          items: ['Toast', 'Bread', 'Brioche', 'Biscuit', 'Grain'] },
      { label: 'Vanilla & Cream', items: ['Vanilla', 'Cream', 'Butterscotch', 'Caramel', 'Toffee'] },
      { label: 'Wood',           items: ['Cedar', 'Pencil Shavings', 'Sawdust', 'Coconut', 'Sandalwood'] },
      { label: 'Smoke & Char',   items: ['Smoke', 'Charcoal', 'Ash', 'Tobacco'] },
      { label: 'Coffee & Choc',  items: ['Coffee', 'Espresso', 'Dark Chocolate', 'Mocha', 'Cocoa'] },
    ],
  },
  {
    id: 'earth', label: 'Earth', color: '#546E7A',
    sub: [
      { label: 'Mineral',        items: ['Flint', 'Chalk', 'Slate', 'Wet Stone', 'Oyster Shell', 'Iodine'] },
      { label: 'Petrol & Resin', items: ['Petrol', 'Kerosene', 'Pine Resin', 'Rubber', 'Wax'] },
      { label: 'Earthy',         items: ['Forest Floor', 'Mushroom', 'Truffle', 'Damp Earth', 'Compost', 'Clay'] },
    ],
  },
  {
    id: 'animal', label: 'Animal', color: '#6D4C41',
    sub: [
      { label: 'Leather',      items: ['Leather', 'Suede', 'Cigar Box', 'Old Books', 'Saddle'] },
      { label: 'Barnyard',     items: ['Farmyard', 'Horse', 'Brett', 'Manure'] },
      { label: 'Game & Meat',  items: ['Game', 'Venison', 'Blood', 'Charcuterie'] },
    ],
  },
  {
    id: 'other', label: 'Other', color: '#455A64',
    sub: [
      { label: 'Nutty',      items: ['Almond', 'Hazelnut', 'Walnut', 'Marzipan', 'Nougat'] },
      { label: 'Oxidative',  items: ['Sherry', 'Maderized', 'Rancio', 'Walnut Oil', 'Varnish'] },
      { label: 'Yeasty',     items: ['Bread Dough', 'Yeast', 'Lees', 'Sauerkraut'] },
    ],
  },
];

// Flat list of all valid descriptors (for AI validation)
const ALL_ITEMS = WHEEL_DATA.flatMap(c => c.sub.flatMap(s => s.items));

/* ── Wheel State ─────────────────────────────────── */
const wheelState = {
  nose:   { selected: new Set(), activeCat: null, activeSub: null },
  palate: { selected: new Set(), activeCat: null, activeSub: null },
};

/* ═══════════════════════════════════════════════════
   SVG WHEEL BUILDER
═══════════════════════════════════════════════════ */
function arcPath(a0, a1, ri, ro) {
  const cos = Math.cos, sin = Math.sin;
  const x1 = cos(a0)*ro, y1 = sin(a0)*ro;
  const x2 = cos(a1)*ro, y2 = sin(a1)*ro;
  const x3 = cos(a1)*ri, y3 = sin(a1)*ri;
  const x4 = cos(a0)*ri, y4 = sin(a0)*ri;
  const la = (a1 - a0 > Math.PI) ? 1 : 0;
  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `A ${ro} ${ro} 0 ${la} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    `A ${ri} ${ri} 0 ${la} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function buildWheelSVG(svgId) {
  const n   = WHEEL_DATA.length;
  const ri  = 36, ro = 97;
  const gap = 0.028;
  const off = -Math.PI / 2;
  const mr  = (ri + ro) / 2;

  let paths = '', texts = '';

  WHEEL_DATA.forEach((cat, i) => {
    const a0 = off + (i / n) * 2 * Math.PI + gap;
    const a1 = off + ((i + 1) / n) * 2 * Math.PI - gap;
    const am = (a0 + a1) / 2;
    const lx = (Math.cos(am) * mr).toFixed(2);
    const ly = (Math.sin(am) * mr).toFixed(2);

    paths += `<path
      d="${arcPath(a0, a1, ri, ro)}"
      fill="${cat.color}"
      stroke="white"
      stroke-width="1.5"
      class="wheel-segment"
      data-idx="${i}"
    />`;

    // Split label onto two lines if needed
    const words = cat.label.split(' ');
    if (words.length === 1) {
      texts += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
        font-size="8" font-weight="600" fill="white" pointer-events="none"
        font-family="DM Sans, sans-serif">${cat.label}</text>`;
    } else {
      const ly0 = (parseFloat(ly) - 4.5).toFixed(2);
      const ly1 = (parseFloat(ly) + 4.5).toFixed(2);
      texts += `
        <text x="${lx}" y="${ly0}" text-anchor="middle" dominant-baseline="middle"
          font-size="7.5" font-weight="600" fill="white" pointer-events="none"
          font-family="DM Sans, sans-serif">${words[0]}</text>
        <text x="${lx}" y="${ly1}" text-anchor="middle" dominant-baseline="middle"
          font-size="7.5" font-weight="600" fill="white" pointer-events="none"
          font-family="DM Sans, sans-serif">${words.slice(1).join(' ')}</text>`;
    }
  });

  const center = `
    <circle cx="0" cy="0" r="${ri}" fill="#FAF7F2" stroke="#E2D9D0" stroke-width="1"/>
    <text x="0" y="-5" text-anchor="middle" dominant-baseline="middle"
      font-size="7.5" fill="#aaa" font-family="DM Sans, sans-serif" pointer-events="none">tap to</text>
    <text x="0" y="5" text-anchor="middle" dominant-baseline="middle"
      font-size="7.5" fill="#aaa" font-family="DM Sans, sans-serif" pointer-events="none">explore</text>`;

  return `<svg id="${svgId}" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">
    ${paths}${texts}${center}
  </svg>`;
}

/* ═══════════════════════════════════════════════════
   BUILD PANEL HTML
═══════════════════════════════════════════════════ */
function buildPanelHTML(ctx) {
  const ph = ctx === 'nose'
    ? 'e.g. "smells like my gran\'s fruit bowl" or "forest after rain"…'
    : 'e.g. "tastes like dark berries with a hint of coffee"…';

  return `
    <div class="wheel-panel">

      <div class="wheel-area">
        ${buildWheelSVG(ctx + 'Svg')}
      </div>

      <div class="wheel-drill">
        <div class="drill-subs hidden" id="${ctx}Subs"></div>
        <div class="drill-items hidden" id="${ctx}Items"></div>
      </div>

      <div class="ai-section">
        <div class="ai-header">
          <div class="ai-header-left">
            <span class="ai-gem">✦</span>
            <span class="ai-title">Describe it in plain words</span>
          </div>
          <button class="ai-key-btn" id="${ctx}KeyBtn">API key</button>
        </div>
        <div class="ai-messages" id="${ctx}Msgs"></div>
        <div class="ai-input-row">
          <input class="ai-input" id="${ctx}Input" type="text"
            placeholder="${ph}" autocomplete="off" />
          <button class="ai-send" id="${ctx}Send">&#8594;</button>
        </div>
      </div>

      <div class="selected-section hidden" id="${ctx}SelSection">
        <div class="selected-header">
          <span class="selected-label">Selected descriptors</span>
          <button class="clear-sel-btn" id="${ctx}ClearSel">Clear all</button>
        </div>
        <div class="selected-tags" id="${ctx}Tags"></div>
      </div>

    </div>`;
}

/* ═══════════════════════════════════════════════════
   WHEEL INTERACTION
═══════════════════════════════════════════════════ */
function initWheel(ctx) {
  const state  = wheelState[ctx];
  const svg    = document.getElementById(ctx + 'Svg');
  const subsEl = document.getElementById(ctx + 'Subs');
  const itmEl  = document.getElementById(ctx + 'Items');

  svg.querySelectorAll('.wheel-segment').forEach(seg => {
    seg.addEventListener('click', () => {
      const idx = +seg.dataset.idx;

      // Toggle: click the same segment again to close
      if (state.activeCat === idx) {
        resetDrill(ctx);
        return;
      }

      state.activeCat = idx;
      state.activeSub = null;

      // Visual dim/highlight
      svg.querySelectorAll('.wheel-segment').forEach(s => {
        s.classList.toggle('dimmed',     +s.dataset.idx !== idx);
        s.classList.toggle('active-seg', +s.dataset.idx === idx);
      });

      // Render sub-category buttons
      const cat = WHEEL_DATA[idx];
      subsEl.innerHTML = cat.sub.map((sub, si) =>
        `<button class="drill-sub-btn" data-si="${si}"
          style="--cat-color:${cat.color}">${sub.label}</button>`
      ).join('');

      subsEl.querySelectorAll('.drill-sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.activeSub = +btn.dataset.si;
          subsEl.querySelectorAll('.drill-sub-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderItems(ctx, idx, +btn.dataset.si);
        });
      });

      subsEl.classList.remove('hidden');
      itmEl.classList.add('hidden');
      itmEl.innerHTML = '';
    });
  });
}

function resetDrill(ctx) {
  const state = wheelState[ctx];
  state.activeCat = null;
  state.activeSub = null;
  const svg = document.getElementById(ctx + 'Svg');
  svg.querySelectorAll('.wheel-segment').forEach(s => {
    s.classList.remove('dimmed', 'active-seg');
  });
  document.getElementById(ctx + 'Subs').classList.add('hidden');
  document.getElementById(ctx + 'Items').classList.add('hidden');
}

function renderItems(ctx, catIdx, subIdx) {
  const state  = wheelState[ctx];
  const cat    = WHEEL_DATA[catIdx];
  const sub    = cat.sub[subIdx];
  const itmEl  = document.getElementById(ctx + 'Items');

  itmEl.innerHTML = sub.items.map(item =>
    `<button class="drill-item-btn ${state.selected.has(item) ? 'active' : ''}"
      data-item="${item}" style="--cat-color:${cat.color}">${item}</button>`
  ).join('');

  itmEl.querySelectorAll('.drill-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.dataset.item;
      if (state.selected.has(item)) {
        state.selected.delete(item);
        btn.classList.remove('active');
      } else {
        state.selected.add(item);
        btn.classList.add('active');
      }
      renderTags(ctx);
    });
  });

  itmEl.classList.remove('hidden');
}

/* ── Tags (selected descriptors) ─────────────────── */
function renderTags(ctx) {
  const state   = wheelState[ctx];
  const tagsEl  = document.getElementById(ctx + 'Tags');
  const section = document.getElementById(ctx + 'SelSection');

  if (state.selected.size === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  tagsEl.innerHTML = [...state.selected].map(item => {
    const cat   = WHEEL_DATA.find(c => c.sub.some(s => s.items.includes(item)));
    const color = cat ? cat.color : '#666';
    return `<span class="descriptor-tag" data-item="${item}" style="--cat-color:${color}">
      ${escHtml(item)}<i class="tag-x" data-item="${item}">×</i>
    </span>`;
  }).join('');

  tagsEl.querySelectorAll('.tag-x').forEach(x => {
    x.addEventListener('click', () => {
      const item = x.dataset.item;
      state.selected.delete(item);
      // Reflect in item buttons if panel still open
      document.querySelector(`#${ctx}Items .drill-item-btn[data-item="${item}"]`)
        ?.classList.remove('active');
      renderTags(ctx);
    });
  });
}

/* Highlight items that the AI suggested (if same sub is open) */
function refreshItemButtons(ctx) {
  const state = wheelState[ctx];
  document.querySelectorAll(`#${ctx}Items .drill-item-btn`).forEach(btn => {
    btn.classList.toggle('active', state.selected.has(btn.dataset.item));
  });
}

/* ═══════════════════════════════════════════════════
   API KEY MANAGEMENT
═══════════════════════════════════════════════════ */
function getKey()       { return localStorage.getItem(API_KEY_KEY) || ''; }
function saveKey(k)     { localStorage.setItem(API_KEY_KEY, k); }
function clearKey()     { localStorage.removeItem(API_KEY_KEY); }

function updateKeyBtns() {
  const hasKey = !!getKey();
  document.querySelectorAll('.ai-key-btn').forEach(btn => {
    btn.textContent = hasKey ? 'Key set ✓' : 'Set API key';
    btn.classList.toggle('key-set', hasKey);
  });
}

function openKeyModal(afterSave) {
  const modal   = document.getElementById('apiKeyModal');
  const input   = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('apiKeySave');
  const cancel  = document.getElementById('apiKeyCancel');

  input.value = getKey();
  modal.classList.remove('hidden');
  setTimeout(() => input.focus(), 80);

  const doSave = () => {
    const val = input.value.trim();
    if (val) { saveKey(val); updateKeyBtns(); modal.classList.add('hidden'); afterSave?.(); }
    else     { input.focus(); }
    saveBtn.removeEventListener('click', doSave);
    cancel.removeEventListener('click', doCancel);
  };
  const doCancel = () => {
    modal.classList.add('hidden');
    saveBtn.removeEventListener('click', doSave);
    cancel.removeEventListener('click', doCancel);
  };

  saveBtn.addEventListener('click', doSave);
  cancel.addEventListener('click', doCancel);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); }, { once: true });
}

/* ═══════════════════════════════════════════════════
   AI CHAT
═══════════════════════════════════════════════════ */
function initAIChat(ctx) {
  const input   = document.getElementById(ctx + 'Input');
  const sendBtn = document.getElementById(ctx + 'Send');
  const keyBtn  = document.getElementById(ctx + 'KeyBtn');
  const clearSelBtn = document.getElementById(ctx + 'ClearSel');

  keyBtn.addEventListener('click', () => openKeyModal());

  clearSelBtn.addEventListener('click', () => {
    wheelState[ctx].selected.clear();
    renderTags(ctx);
    refreshItemButtons(ctx);
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;

    if (!getKey()) {
      openKeyModal(() => {
        // Retry after key is saved
        input.value = text;
        send();
      });
      return;
    }

    addBubble(ctx, text, 'user');
    input.value   = '';
    sendBtn.disabled = true;

    const thinkingBubble = addBubble(ctx, 'Thinking…', 'thinking');

    try {
      const result = await callAI(text, ctx);
      thinkingBubble.remove();

      if (result.message) {
        addBubble(ctx, result.message, 'assistant');
      }

      if (result.suggestions?.length) {
        const state = wheelState[ctx];
        let added = 0;
        result.suggestions.forEach(item => {
          if (ALL_ITEMS.includes(item)) {
            state.selected.add(item);
            added++;
          }
        });
        if (added) {
          renderTags(ctx);
          refreshItemButtons(ctx);
        }
      }
    } catch (err) {
      thinkingBubble.remove();
      const msg = err.message?.includes('401')
        ? 'Invalid API key. Tap "Key set ✓" to update it.'
        : 'Couldn\'t reach the AI right now. Try again or browse the wheel.';
      addBubble(ctx, msg, 'error');
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
}

function addBubble(ctx, text, type) {
  const msgsEl = document.getElementById(ctx + 'Msgs');
  const div = document.createElement('div');
  div.className = `ai-bubble ${type}`;
  div.textContent = text;
  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  return div;
}

async function callAI(description, ctx) {
  const label = ctx === 'nose' ? 'nose / aromas' : 'palate / taste flavours';

  const system = `You are a wine tasting assistant embedded in a tasting notes app.
The user is describing what they detect on the ${label} of a wine in everyday, non-technical language.
Translate their description into proper wine tasting vocabulary.

Available descriptors — you MUST only suggest items from this exact list:
${ALL_ITEMS.join(', ')}

Respond ONLY with a raw JSON object. No markdown, no code fences, no extra text. Format:
{"message":"1-2 warm sentences acknowledging their description and what it likely corresponds to in wine terms.","suggestions":["ExactDescriptor1","ExactDescriptor2"]}

Limit to 2–5 suggestions. Only use exact strings from the list above.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: description }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const raw  = data.content?.find(b => b.type === 'text')?.text || '{}';
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

/* ═══════════════════════════════════════════════════
   INITIALISE ALL WHEEL PANELS
═══════════════════════════════════════════════════ */
function initAllPanels() {
  document.querySelectorAll('.wheel-ai-container').forEach(container => {
    const ctx = container.dataset.context;
    container.innerHTML = buildPanelHTML(ctx);
    initWheel(ctx);
    initAIChat(ctx);
  });
  updateKeyBtns();
}

/* ═══════════════════════════════════════════════════
   EXISTING CONTROLS (button groups, colour swatches)
═══════════════════════════════════════════════════ */
document.querySelectorAll('.button-group').forEach(group => {
  group.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      if (!wasActive) btn.classList.add('active');
    });
  });
});

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn[data-group="color"]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ═══════════════════════════════════════════════════
   COLLECT & APPLY STATE
═══════════════════════════════════════════════════ */
function getGroup(sel) {
  const a = document.querySelector(`${sel} button.active`);
  return a ? a.textContent.trim() : '';
}

function collectState() {
  return {
    wineName:    document.getElementById('wineName').value.trim(),
    producer:    document.getElementById('producer').value.trim(),
    vintage:     document.getElementById('vintage').value.trim(),

    lookIntensity: getGroup('[data-group="lookIntensity"]'),
    color:         document.querySelector('.color-btn.active')?.textContent.trim() || '',
    clarity:       getGroup('[data-group="clarity"]'),
    bubbles:       getGroup('[data-group="bubbles"]'),

    noseCondition:   getGroup('[data-group="noseCondition"]'),
    noseIntensity:   getGroup('[data-group="noseIntensity"]'),
    noseDescriptors: [...wheelState.nose.selected],
    noseDevelopment: getGroup('[data-group="noseDevelopment"]'),
    noseNotes:       document.getElementById('noseNotes').value.trim(),

    sweetness:        getGroup('[data-group="sweetness"]'),
    acidity:          getGroup('[data-group="acidity"]'),
    tannin:           getGroup('[data-group="tannin"]'),
    tanninTexture:    getGroup('[data-group="tanninTexture"]'),
    body:             getGroup('[data-group="body"]'),
    alcohol:          getGroup('[data-group="alcohol"]'),
    finish:           getGroup('[data-group="finish"]'),
    palateDescriptors: [...wheelState.palate.selected],
    palataNotes:       document.getElementById('palataNotes').value.trim(),

    quality:   getGroup('[data-group="quality"]'),
    readiness: getGroup('[data-group="readiness"]'),

    guessGrape:   document.getElementById('guessGrape').value.trim(),
    guessCountry: document.getElementById('guessCountry').value.trim(),
    guessRegion:  document.getElementById('guessRegion').value.trim(),
    guessProducer: document.getElementById('guessProducer').value.trim(),
    guessVintage: document.getElementById('guessVintage').value.trim(),
    guessPrice:   getGroup('[data-group="guessPrice"]'),
    overallNotes: document.getElementById('overallNotes').value.trim(),

    timestamp: new Date().toISOString(),
    id: Date.now().toString(),
  };
}

function applyState(data) {
  // Text fields
  const fields = ['wineName', 'producer', 'vintage', 'noseNotes', 'palataNotes',
    'guessGrape', 'guessCountry', 'guessRegion', 'guessProducer', 'guessVintage', 'overallNotes'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = data[id] || '';
  });

  // Single-select button groups
  const groups = {
    lookIntensity: data.lookIntensity, clarity: data.clarity, bubbles: data.bubbles,
    noseCondition: data.noseCondition, noseIntensity: data.noseIntensity, noseDevelopment: data.noseDevelopment,
    sweetness: data.sweetness, acidity: data.acidity, tannin: data.tannin,
    tanninTexture: data.tanninTexture, body: data.body, alcohol: data.alcohol,
    finish: data.finish, quality: data.quality, readiness: data.readiness, guessPrice: data.guessPrice,
  };
  Object.entries(groups).forEach(([name, val]) => {
    if (!val) return;
    const grp = document.querySelector(`[data-group="${name}"]`);
    if (!grp) return;
    grp.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.textContent.trim() === val));
  });

  // Color swatch
  document.querySelectorAll('.color-btn').forEach(b =>
    b.classList.toggle('active', b.textContent.trim() === (data.color || '')));

  // Wheel selections — support both new format and legacy chip format
  const noseItems = [
    ...(data.noseDescriptors || []),
    ...(data.noseFruit || []),
    ...(data.noseNonFruit || []),
  ].filter(item => ALL_ITEMS.includes(item));

  const palateItems = [
    ...(data.palateDescriptors || []),
    ...(data.palateFlavours || []),
  ].filter(item => ALL_ITEMS.includes(item));

  wheelState.nose.selected   = new Set(noseItems);
  wheelState.palate.selected = new Set(palateItems);
  renderTags('nose');
  renderTags('palate');
}

function clearAll() {
  document.querySelectorAll('input, textarea').forEach(el => el.value = '');
  document.querySelectorAll('button.active').forEach(b => b.classList.remove('active'));

  ['nose', 'palate'].forEach(ctx => {
    wheelState[ctx].selected.clear();
    wheelState[ctx].activeCat = null;
    wheelState[ctx].activeSub = null;
    resetDrill(ctx);
    renderTags(ctx);
    document.getElementById(ctx + 'Msgs').innerHTML = '';
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════════════ */
function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveAll(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

/* ═══════════════════════════════════════════════════
   SAVED PANEL
═══════════════════════════════════════════════════ */
function renderSavedPanel() {
  const list   = loadAll();
  const el     = document.getElementById('savedList');
  document.getElementById('savedCount').textContent = list.length;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🍷</div><p>No tastings saved yet.<br>Fill in your notes and tap Save.</p></div>`;
    return;
  }

  el.innerHTML = list.map((t, i) => {
    const name = t.wineName || t.guessGrape || 'Unnamed Wine';
    const meta = [t.guessCountry, t.guessRegion, t.guessVintage || t.vintage, t.quality].filter(Boolean).join(' · ');
    const date = new Date(t.timestamp).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    return `
      <div class="saved-item">
        <div class="saved-item-name">${escHtml(name)}</div>
        ${meta ? `<div class="saved-item-meta">${escHtml(meta)}</div>` : ''}
        <div class="saved-item-date">${date}</div>
        <div class="saved-item-actions">
          <button class="btn-load" data-i="${i}">Load</button>
          <button class="btn-delete" data-i="${i}">Delete</button>
        </div>
      </div>`;
  }).join('');

  el.querySelectorAll('.btn-load').forEach(btn => {
    btn.addEventListener('click', () => {
      applyState(list[+btn.dataset.i]);
      closePanel();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Tasting loaded');
    });
  });

  el.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this tasting?')) return;
      list.splice(+btn.dataset.i, 1);
      saveAll(list);
      renderSavedPanel();
    });
  });
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Panel open/close ─────────────────────────────── */
const panel   = document.getElementById('savedPanel');
const overlay = document.getElementById('overlay');
function openPanel()  { renderSavedPanel(); panel.classList.remove('hidden'); overlay.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closePanel() { panel.classList.add('hidden'); overlay.classList.add('hidden'); document.body.style.overflow = ''; }

document.getElementById('viewSaved').addEventListener('click', openPanel);
document.getElementById('closePanel').addEventListener('click', closePanel);
overlay.addEventListener('click', closePanel);

/* ── Toast ────────────────────────────────────────── */
let toastTimer;
function showToast(msg = 'Saved ✓') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
}

/* ── Save / Clear ─────────────────────────────────── */
document.getElementById('saveButton').addEventListener('click', () => {
  const list = loadAll();
  list.unshift(collectState());
  saveAll(list);
  document.getElementById('savedCount').textContent = list.length;
  showToast('Tasting saved ✓');
});

document.getElementById('clearButton').addEventListener('click', () => {
  if (confirm('Clear all fields and start a new tasting?')) clearAll();
});

/* ═══════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAllPanels();
  document.getElementById('savedCount').textContent = loadAll().length;
});
