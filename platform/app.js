/* ═══════════════════════════════════════════════════════════════
   VAASULI PLATFORM — APP JS
   Handles: screen routing, auth tabs, onboarding wizard,
   upload flow (CSV → map → notice type → review → dispatch),
   filter pills, case detail navigation
════════════════════════════════════════════════════════════════ */

/* ─── SCREEN ROUTING ──────────────────────────────────────────── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function showPage(id, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');

  if (navEl) {
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('on'));
    navEl.classList.add('on');
  }

  const titles = {
    dashboard: 'Dashboard',
    cases:     'All Cases',
    upload:    'Upload Cases',
    detail:    'Case Detail',
    billing:   'Billing & Plans'
  };
  document.getElementById('tb-title').textContent = titles[id] || id;
  document.getElementById('tb-crumb').textContent =
    id === 'detail'
      ? 'Rajesh Kumar Mehra → Case #ACC-2024-001'
      : 'Finserv Capital Ltd';
}


/* ─── AUTH ────────────────────────────────────────────────────── */
function authTab(t) {
  document.querySelectorAll('.auth-tab').forEach((el, i) =>
    el.classList.toggle('on', i === (t === 'signin' ? 0 : 1))
  );
  document.getElementById('auth-signin').style.display  = t === 'signin'  ? 'block' : 'none';
  document.getElementById('auth-signup').style.display  = t === 'signup'  ? 'block' : 'none';
}

function goOnboard() { show('onboard'); }
function goApp()     { show('app'); }
function goAuth()    { show('auth'); }


/* ─── ONBOARDING WIZARD ───────────────────────────────────────── */
let obCurrent = 1;

function obNext(step) {
  document.getElementById('ob-p' + obCurrent).classList.remove('active');
  obCurrent = step;
  document.getElementById('ob-p' + step).classList.add('active');

  [1, 2, 3].forEach(i => {
    const dot  = document.getElementById('ob-d' + i);
    const line = i < 3 ? document.getElementById('ob-l' + i) : null;
    dot.classList.toggle('done',   i < step);
    dot.classList.toggle('active', i === step);
    if (line) line.classList.toggle('done', i < step);
  });

  if (step === 3) goApp();
}

function toggleChip(el) {
  el.classList.toggle('on');
}


/* ─── UPLOAD FLOW ─────────────────────────────────────────────── */

// Step 1 → Step 2: simulate CSV parse
function simulateParse() {
  uploadStep(2);
}

// Move between upload steps (1=CSV, 2=Map, 3=NoticeType, 4=Review)
function uploadStep(n) {
  [1, 2, 3, 4].forEach(i => {
    const panel = document.getElementById('upload-panel-' + i);
    if (panel) panel.style.display = i === n ? 'block' : 'none';
  });

  // Highlight active step in the step indicator bar
  const steps = document.querySelectorAll('#upload-steps > div');
  steps.forEach((s, i) => {
    const active = i + 1 === n;
    s.style.color      = active ? 'var(--mint)' : 'var(--t3)';
    s.style.background = active ? 'var(--mint-d)' : 'transparent';
    s.style.fontWeight = active ? '600' : '500';
  });
}

// Notice type single-select
function selectNT(el) {
  document.querySelectorAll('.nt').forEach(n => n.classList.remove('on'));
  el.classList.add('on');
}

// Final dispatch: show success screen, update pilot counter
function dispatchBatch() {
  [1, 2, 3, 4].forEach(i => {
    const p = document.getElementById('upload-panel-' + i);
    if (p) p.style.display = 'none';
  });
  document.getElementById('upload-success').style.display = 'block';

  // Saturate pilot counter in sidebar
  document.querySelector('.sbp-bar').style.width = '100%';
  document.querySelector('.sbp-txt span').textContent = '10 / 10';
}

// Reset upload flow back to step 1
function resetUpload() {
  document.getElementById('upload-success').style.display = 'none';
  uploadStep(1);
}


/* ─── FILTER PILLS (Cases page) ───────────────────────────────── */
function filterPill(el) {
  document.querySelectorAll('.f-pill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
}
