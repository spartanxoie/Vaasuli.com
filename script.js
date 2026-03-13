/* ═══════════════════════════════════════════════════════════════
   VAASULI.COM — LANDING PAGE SCRIPTS
   Covers: scroll reveal, recovery calculator, modal, Formspree handler
════════════════════════════════════════════════════════════════ */

/* ─── CONFIG ─────────────────────────────────────────────────────
   Replace these three values before going live.
   ─────────────────────────────────────────────────────────────── */
const WA_NUMBER       = '919999999999';     // WhatsApp: country code + number, no + or spaces
const FORMSPREE_ID    = 'FORMSPREE_FORM_ID'; // e.g. xpzgkwlb from formspree.io/forms


/* ─── SCROLL REVEAL ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('in')),
  { threshold: 0.07 }
);
document.querySelectorAll('.rev').forEach(el => revealObserver.observe(el));


/* ─── CURRENCY FORMATTERS ─────────────────────────────────────── */
function fmtAmt(n) {
  return n >= 100000
    ? '₹' + (n / 100000).toFixed(1) + 'L'
    : '₹' + (n / 1000).toFixed(0) + 'K';
}

function fmtRs(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + Math.round(n);
}


/* ─── RECOVERY PIPELINE CALCULATOR ───────────────────────────── */
function calc() {
  const vol = parseInt(document.getElementById('vol').value);
  const amt = parseInt(document.getElementById('amt').value);

  document.getElementById('d-vol').textContent = vol.toLocaleString('en-IN');
  document.getElementById('d-amt').textContent = fmtAmt(amt);

  // Per-notice fee based on volume tier
  const feeNotice = vol >= 10000 ? 33 : vol >= 500 ? 99 : 499;
  const feeODR    = 1499;
  const feeCourt  = 2499;

  // Accounts at each stage
  const s1Accounts = vol;
  const s2Accounts = Math.round(vol * 0.70);  // 30% settle at stage 1
  const s3Accounts = Math.round(vol * 0.15);  // 55% cumulative → 15% to ODR
  const s4Accounts = Math.round(vol * 0.07);  // 8% more settle at ODR → 7% to court

  // Vaasuli fees
  const cost1 = s1Accounts * 15;
  const cost2 = s2Accounts * feeNotice;
  const cost3 = s3Accounts * feeODR;
  const cost4 = s4Accounts * feeCourt;
  const totalCost = cost1 + cost2 + cost3 + cost4;

  // Estimated recoveries (18% of outstanding per settled account)
  const overdue = amt * 0.18;
  const rec1 = Math.round(vol * 0.30 * overdue);
  const rec2 = Math.round(s2Accounts * 0.55 * overdue);
  const rec3 = Math.round(s3Accounts * 0.55 * overdue);
  const rec4 = Math.round(s4Accounts * 0.40 * overdue);
  const totalRec = rec1 + rec2 + rec3 + rec4;

  // Stage 1 — Soft Reminder
  document.getElementById('f1').textContent = fmtRs(cost1);
  document.getElementById('r1').textContent = fmtRs(rec1);
  document.getElementById('n1').textContent = Math.round(vol * 0.30).toLocaleString('en-IN') + ' accounts';

  // Stage 2 — Legal Notice
  document.getElementById('f2').innerHTML =
    fmtRs(cost2) + ' <span style="font-size:9px;color:var(--t3);font-family:\'JetBrains Mono\',monospace">₹' + feeNotice + '/notice</span>';
  document.getElementById('r2').textContent = fmtRs(rec2);
  document.getElementById('n2').textContent = s2Accounts.toLocaleString('en-IN') + ' accounts';

  // Stage 3 — Arbitration
  document.getElementById('f3').innerHTML =
    fmtRs(cost3) + ' <span style="font-size:9px;color:var(--t3);font-family:\'JetBrains Mono\',monospace">₹1,499/case</span>';
  document.getElementById('r3').textContent = fmtRs(rec3);
  document.getElementById('n3').textContent = s3Accounts.toLocaleString('en-IN') + ' cases';

  // Stage 4 — SARFAESI / S.138
  document.getElementById('f4').innerHTML =
    fmtRs(cost4) + ' <span style="font-size:9px;color:var(--t3);font-family:\'JetBrains Mono\',monospace">₹2,499/case</span>';
  document.getElementById('r4').textContent = fmtRs(rec4);
  document.getElementById('n4').textContent = s4Accounts.toLocaleString('en-IN') + ' cases';

  // Totals
  document.getElementById('grand-total').textContent = fmtRs(totalRec);
  document.getElementById('total-cost-lbl').textContent = 'total Vaasuli cost: ' + fmtRs(totalCost);
  document.getElementById('total-sub').textContent =
    'from ' + vol.toLocaleString('en-IN') + ' DPD accounts this month';

  // CTA label
  document.getElementById('c-cta').textContent = 'Recover ' + fmtRs(totalRec) + ' this month →';
}

// Run on page load
calc();


/* ─── WHATSAPP HELPER ─────────────────────────────────────────── */
function buildWaUrl(msg) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
}

function setWaLinks() {
  const base = 'Hi, I want to start a free Vaasuli pilot for my NBFC.';
  document.getElementById('wa-btn').href = buildWaUrl(base);
  document.getElementById('wa-btn-success').href = buildWaUrl(base);
}
setWaLinks();


/* ─── MODAL ───────────────────────────────────────────────────── */
function openPilot() {
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // GA4 event
  if (typeof gtag !== 'undefined') trackEvent('pilot_cta_click');
  // Meta Pixel event
  if (typeof fbq !== 'undefined') fbq('track', 'InitiateCheckout', { content_name: 'Vaasuli Free Pilot' });
}

function closePilot() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closePilot();
}

// Close on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePilot(); });


/* ─── FORMSPREE SUBMISSION ────────────────────────────────────── */
function submitForm() {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const company = document.getElementById('f-company').value.trim();
  const role    = document.getElementById('f-role').value;
  const loan    = document.getElementById('f-loan').value;
  const vol     = document.getElementById('f-vol-s').value;

  if (!name || !phone || !company || !role || !loan || !vol) {
    alert('Please fill in all fields to claim your free pilot.');
    return;
  }

  // Disable button during submission
  const btn = document.querySelector('.m-submit');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  fetch('https://formspree.io/f/' + FORMSPREE_ID, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mobile:     phone,
      company,
      role,
      loan_type:  loan,
      dpd_volume: vol,
      _subject:   'Vaasuli Pilot Request: ' + company,
      _gotcha:    ''   // Honeypot — must stay empty
    })
  })
  .then(res => {
    if (res.ok) {
      // Fire GA4 conversion
      if (typeof gtag !== 'undefined') {
        trackEvent('pilot_form_submit', {
          company_name: company,
          loan_type: loan,
          dpd_volume: vol
        });
      }
      // Fire Meta Pixel Lead event
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: 'Vaasuli Free Pilot',
          content_category: loan
        });
      }

      // Pre-fill WhatsApp message with lead details
      const waMsg =
        'Hi Vaasuli team, I want to start a free 10-case pilot.\n\n' +
        'Name: '       + name    + '\n' +
        'Company: '    + company + '\n' +
        'Role: '       + role    + '\n' +
        'Loan Type: '  + loan    + '\n' +
        'DPD Volume: ' + vol     + '/month\n' +
        'Phone: '      + phone   + '\n\n' +
        'Please get in touch to set up my pilot.';

      document.getElementById('wa-btn-success').href = buildWaUrl(waMsg);

      // Show success state
      document.getElementById('m-form-state').style.display = 'none';
      document.getElementById('m-success-state').style.display = 'block';

    } else {
      res.json().then(data => {
        alert(data.errors
          ? data.errors.map(e => e.message).join(', ')
          : 'Submission failed. Please try WhatsApp below.');
      });
      btn.disabled = false;
      btn.textContent = 'Claim Free Pilot →';
    }
  })
  .catch(() => {
    alert('Network error. Please use the WhatsApp button below to reach us directly.');
    btn.disabled = false;
    btn.textContent = 'Claim Free Pilot →';
  });
}
