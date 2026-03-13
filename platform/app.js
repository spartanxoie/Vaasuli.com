/* ═══════════════════════════════════════════════════════════════
   VAASULI PLATFORM — APP JS
   API-connected version
════════════════════════════════════════════════════════════════ */

const API = 'https://api.vaasuli.com';

/* ─── TOKEN HELPERS ───────────────────────────────────────────── */
function getToken() { return sessionStorage.getItem('vToken'); }
function setToken(t) { sessionStorage.setItem('vToken', t); }
function setUser(u) { sessionStorage.setItem('vUser', JSON.stringify(u)); }
function getUser() { try { return JSON.parse(sessionStorage.getItem('vUser')); } catch { return null; } }
function clearSession() { sessionStorage.removeItem('vToken'); sessionStorage.removeItem('vUser'); }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

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
    dashboard: 'Dashboard', cases: 'All Cases', upload: 'Upload Cases',
    detail: 'Case Detail', billing: 'Billing & Plans',
    review: 'Review Queue', editor: 'Notice Editor',
    templates: 'Form Templates', builder: 'Form Builder',
    clients: 'My Clients', earnings: 'Earnings', profile: 'Profile'
  };
  document.getElementById('tb-title').textContent = titles[id] || id;

  const user = getUser();
  document.getElementById('tb-crumb').textContent = user?.company || user?.name || 'Vaasuli';

  if (id === 'dashboard') loadDashboard();
  if (id === 'cases') loadCases();
}

function goOnboard() { show('onboard'); }
function goApp() {
  show('app');
  loadDashboard();
}
function goAuth() {
  clearSession();
  show('auth');
}

/* ─── AUTH ────────────────────────────────────────────────────── */
function authTab(t) {
  document.querySelectorAll('.auth-tab').forEach((el, i) =>
    el.classList.toggle('on', i === (t === 'signin' ? 0 : 1))
  );
  document.getElementById('auth-signin').style.display = t === 'signin' ? 'block' : 'none';
  document.getElementById('auth-signup').style.display = t === 'signup' ? 'block' : 'none';
}

async function doLogin() {
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  const btn = document.getElementById('login-btn');
  if (!email || !password) return showToast('Enter email and password', 'error');

  btn.textContent = 'Signing in…';
  btn.disabled = true;
  try {
    const res = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    setUser(data.user);
    showToast('Welcome back, ' + data.user.name + '!', 'success');
    goApp();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

async function doRegister() {
  const name = document.getElementById('reg-name')?.value;
  const email = document.getElementById('reg-email')?.value;
  const password = document.getElementById('reg-password')?.value;
  const company = document.getElementById('reg-company')?.value;
  const role = document.querySelector('.role-toggle .on')?.dataset?.role || 'nbfc';
  const btn = document.getElementById('reg-btn');

  if (!name || !email || !password) return showToast('Fill all required fields', 'error');

  btn.textContent = 'Creating account…';
  btn.disabled = true;
  try {
    const res = await fetch(API + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, company, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setToken(data.token);
    setUser(data.user);
    if (role === 'nbfc') {
      goOnboard();
    } else {
      goApp();
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
}

/* ─── DASHBOARD ───────────────────────────────────────────────── */
async function loadDashboard() {
  try {
    const res = await fetch(API + '/api/cases?limit=100', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { if (res.status === 401) return goAuth(); return; }

    const cases = data.cases || [];
    const total = data.total || 0;
    const uploaded = cases.filter(c => c.status === 'uploaded').length;
    const inProgress = cases.filter(c => ['assigned','draft','review','signed'].includes(c.status)).length;
    const dispatched = cases.filter(c => c.status === 'dispatched').length;

    const setValue = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setValue('dash-total', total);
    setValue('dash-uploaded', uploaded);
    setValue('dash-inprogress', inProgress);
    setValue('dash-dispatched', dispatched);

    // Recent cases table
    const tbody = document.getElementById('recent-cases-tbody');
    if (tbody) {
      tbody.innerHTML = cases.slice(0, 5).map(c => `
        <tr onclick="openCase('${c._id}')">
          <td>${c.borrowerName}</td>
          <td>${c.accountNumber}</td>
          <td>₹${(c.outstanding||0).toLocaleString('en-IN')}</td>
          <td>${c.dpd || '-'}</td>
          <td><span class="badge badge-${c.status}">${c.status}</span></td>
        </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--t3)">No cases yet</td></tr>';
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

/* ─── CASES ───────────────────────────────────────────────────── */
let currentFilter = 'all';

async function loadCases(status) {
  if (status) currentFilter = status;
  const url = currentFilter === 'all'
    ? API + '/api/cases?limit=50'
    : API + '/api/cases?status=' + currentFilter + '&limit=50';
  try {
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { if (res.status === 401) return goAuth(); return; }

    const tbody = document.getElementById('cases-tbody');
    if (!tbody) return;
    const cases = data.cases || [];
    tbody.innerHTML = cases.map(c => `
      <tr onclick="openCase('${c._id}')">
        <td>${c.borrowerName}</td>
        <td>${c.accountNumber}</td>
        <td>₹${(c.outstanding||0).toLocaleString('en-IN')}</td>
        <td>${c.dpd || '-'}</td>
        <td>${c.loanType || '-'}</td>
        <td><span class="badge badge-${c.status}">${c.status}</span></td>
      </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--t3)">No cases found</td></tr>';
  } catch (err) {
    console.error('Cases load error:', err);
  }
}

async function openCase(id) {
  try {
    const res = await fetch(API + '/api/cases/' + id, { headers: authHeaders() });
    const c = await res.json();
    if (!res.ok) return;

    const setValue = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val || '-'; };
    setValue('#detail-name', c.borrowerName);
    setValue('#detail-account', c.accountNumber);
    setValue('#detail-outstanding', '₹' + (c.outstanding||0).toLocaleString('en-IN'));
    setValue('#detail-dpd', c.dpd);
    setValue('#detail-address', c.borrowerAddress);
    setValue('#detail-phone', c.borrowerPhone);
    setValue('#detail-status', c.status);
    setValue('#detail-loantype', c.loanType);

    document.getElementById('current-case-id')?.setAttribute('data-id', id);
    showPage('detail', null);
  } catch (err) {
    console.error('Case load error:', err);
  }
}

function filterPill(el) {
  document.querySelectorAll('.f-pill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  const status = el.dataset.status || 'all';
  loadCases(status);
}

/* ─── UPLOAD FLOW ─────────────────────────────────────────────── */
let parsedCSVData = [];

function uploadStep(n) {
  [1, 2, 3, 4].forEach(i => {
    const panel = document.getElementById('upload-panel-' + i);
    if (panel) panel.style.display = i === n ? 'block' : 'none';
  });
  const steps = document.querySelectorAll('#upload-steps > div');
  steps.forEach((s, i) => {
    const active = i + 1 === n;
    s.style.color = active ? 'var(--mint)' : 'var(--t3)';
    s.style.background = active ? 'var(--mint-d)' : 'transparent';
    s.style.fontWeight = active ? '600' : '500';
  });
}

async function simulateParse() {
  const fileInput = document.getElementById('csv-file-input');
  if (fileInput?.files?.length) {
    await uploadCSV(fileInput.files[0]);
  } else {
    // demo mode - show step 2 with sample data
    uploadStep(2);
  }
}

async function uploadCSV(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(API + '/api/upload/csv', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    showToast(data.created + ' cases uploaded successfully', 'success');
    dispatchBatch();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function selectNT(el) {
  document.querySelectorAll('.nt').forEach(n => n.classList.remove('on'));
  el.classList.add('on');
}

async function dispatchBatch() {
  [1, 2, 3, 4].forEach(i => {
    const p = document.getElementById('upload-panel-' + i);
    if (p) p.style.display = 'none';
  });
  const successEl = document.getElementById('upload-success');
  if (successEl) successEl.style.display = 'block';
  document.querySelector('.sbp-bar').style.width = '100%';
  document.querySelector('.sbp-txt span').textContent = '10 / 10';
}

function resetUpload() {
  const successEl = document.getElementById('upload-success');
  if (successEl) successEl.style.display = 'none';
  uploadStep(1);
}

/* ─── ONBOARDING ──────────────────────────────────────────────── */
let obCurrent = 1;

function obNext(step) {
  document.getElementById('ob-p' + obCurrent).classList.remove('active');
  obCurrent = step;
  document.getElementById('ob-p' + step).classList.add('active');

  [1, 2, 3].forEach(i => {
    const dot = document.getElementById('ob-d' + i);
    const line = i < 3 ? document.getElementById('ob-l' + i) : null;
    dot.classList.toggle('done', i < step);
    dot.classList.toggle('active', i === step);
    if (line) line.classList.toggle('done', i < step);
  });

  if (step === 3) goApp();
}

function toggleChip(el) { el.classList.toggle('on'); }

/* ─── TOAST ───────────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;z-index:9999;transition:opacity 0.3s';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = type === 'error' ? '#ff4444' : type === 'success' ? '#00c896' : '#404147';
  toast.style.color = '#fff';
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.style.opacity = '0', 3000);
}

/* ─── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const user = getUser();
  if (token && user) {
    goApp();
  } else {
    show('auth');
  }
});
