# vaasuli.com

Recovery automation platform for Indian NBFCs and fintechs.  
Marketing site + platform dashboard. Deployed on Vercel.

---

## Repo structure

```
vaasuli/
├── index.html           Landing page
├── style.css            Landing page styles
├── script.js            Landing page JS (calculator, modal, Formspree)
├── privacy-policy.html  DPDP Act 2023 compliant privacy policy
├── vercel.json          Vercel routing + security headers
├── og-image.png         ← ADD THIS: 1200×630px OG image before launch
└── platform/
    ├── index.html       App shell (auth → onboarding → dashboard SPA)
    ├── style.css        Platform styles
    └── app.js           Platform JS (routing, upload flow, dispatch)
```

---

## Before going live — replace these 3 placeholders

### 1. Formspree (pilot lead capture form)
- Go to [formspree.io](https://formspree.io) → New Form
- Copy your form ID (e.g. `xpzgkwlb`)
- In `script.js` line 9, replace:
  ```js
  const FORMSPREE_ID = 'FORMSPREE_FORM_ID';
  ```
  with:
  ```js
  const FORMSPREE_ID = 'xpzgkwlb';
  ```

### 2. Google Analytics 4
- Go to [analytics.google.com](https://analytics.google.com) → Admin → Data Streams
- Copy your Measurement ID (e.g. `G-ABC123DEFG`)
- In `index.html`, replace both instances of `G-XXXXXXXXXXXX`

### 3. Meta Pixel
- Go to [Meta Events Manager](https://business.facebook.com/events_manager) → Connect Data Sources
- Copy your Pixel ID (e.g. `1234567890123456`)
- In `index.html`, replace both instances of `XXXXXXXXXXXXXXX`
- Also replace in `privacy-policy.html`

### 4. WhatsApp number
- In `script.js` line 8, replace:
  ```js
  const WA_NUMBER = '919999999999';
  ```
  with your actual WhatsApp Business number (country code + number, no spaces or `+`)

### 5. Ad platform verification meta tags
- **Google Search Console**: Go to Search Console → Add Property → HTML tag method → copy verification code → replace `GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE` in `index.html`
- **Meta Business Manager**: Go to Business Settings → Brand Safety → Domains → Add → copy verification token → replace `META_DOMAIN_VERIFICATION_TOKEN` in `index.html`

### 6. OG image
- Create a 1200×630px image and save as `og-image.png` in the repo root
- Referenced in `index.html` OG and Twitter meta tags

---

## Deploy to Vercel

### Option A — GitHub integration (recommended)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select this repo → Deploy (no build settings needed — static site)
4. Add custom domain `vaasuli.com` in Vercel → Settings → Domains
5. Update DNS: add Vercel's A record and CNAME at your domain registrar

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Local development

No build step needed. Open directly in browser or use any static server:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve .
```

Then open `http://localhost:3000`

---

## Platform (dashboard)

The `/platform/` folder is a fully clickable prototype SPA.  
It is not connected to a live backend yet.

For production backend integration, see:  
**`vaasuli-architecture-v1.docx`** — full Node.js + Supabase architecture spec.

Key integration points in `platform/app.js`:
- `goOnboard()` → replace with Supabase `signUp()` call
- `dispatchBatch()` → replace with POST to `/api/v1/batches/:id/confirm`
- Pilot counter → pull from `organisations.pilot_cases_used` via Supabase client

---

## Stack

| Layer | Technology |
|---|---|
| Hosting | Vercel (static) |
| Form handling | Formspree |
| Analytics | Google Analytics 4 |
| Ads | Meta Pixel |
| Fonts | Google Fonts (Bricolage Grotesque, DM Sans, JetBrains Mono) |
| Backend (future) | Node.js + Supabase — see architecture doc |

---

*Technology by ClearCase. Legal notices prepared by empanelled advocates.*
