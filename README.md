# Digital Policy Tracker

A real-time tracker for the bills shaping Canada's digital future — lawful access,
online safety, cybersecurity and privacy. Legislative status is pulled directly from
the Parliament of Canada's [LEGISinfo](https://www.parl.ca/legisinfo/en/overview) feed,
so the page reflects where each bill actually stands.

Intended home: **digitalpolicytracker.ca**

## How it works

- **Front end** (`index.html`, `assets/`): a static page that fetches `/api/bills` and
  renders a card per bill with a legislative-progress stepper (House 1st/2nd/3rd →
  Senate 1st/2nd/3rd → Royal Assent), the latest activity, and a short editorial note.
- **Live data** (`netlify/functions/bills.js`): a Netlify Function that fetches the
  LEGISinfo session feed server-side (the feed blocks direct browser access), merges it
  with the editorial watchlist, computes each bill's progress, and returns clean JSON
  with CORS and 30-minute edge caching.
- **Editorial layer** (`netlify/functions/watchlist.js`): the curated list of bills and
  the "why it matters" notes. **This is the only file you edit day to day.**
- **Auto-discovery**: any other government bill in the session matching digital/privacy/
  cyber keywords is surfaced under "Newly detected digital bills" — this catches new
  bills (like the forthcoming privacy bill) automatically.
- **Snapshot fallback** (`data/snapshot.json`): a baked copy so the page still renders if
  the function is briefly unavailable or when opened locally without the Netlify dev server.

## Currently tracked

| Bill | Title | Theme |
|------|-------|-------|
| C-36 | Protecting Privacy and Consumer Data Act (PIPEDA reform) | Privacy |
| C-22 | Lawful Access Act, 2026 | Surveillance & lawful access |
| C-34 | Safe Social Media Act | Online safety |
| C-8  | Critical Cyber Systems Protection | Cybersecurity |
| C-2  | Strong Borders Act | Border & data |

## Add or change a bill

Edit `netlify/functions/watchlist.js`. To start tracking the privacy bill once it is
tabled, set its `billNumber` (e.g. `"C-XX"`) on the placeholder entry — the live status
flows in automatically. To refresh the local snapshot:

```bash
node -e "require('./netlify/functions/bills').handler().then(r=>require('fs').writeFileSync('data/snapshot.json', JSON.stringify(JSON.parse(r.body),null,2)))"
```

## Run locally

```bash
netlify dev        # full experience, live function at /api/bills
# or, static-only with the snapshot fallback:
python3 -m http.server 8000
```

## Deploy

1. Push this repo to GitHub.
2. In Netlify: New site from Git → pick the repo. `netlify.toml` sets publish dir and
   the functions dir; no build step needed.
3. Add the custom domain `digitalpolicytracker.ca` in Netlify → Domain settings, then
   point the domain's DNS at Netlify (the `.ca` must be registered first via a CIRA
   registrar). Netlify provisions HTTPS automatically.

Data source: Parliament of Canada — LEGISinfo. Editorial notes are independent analysis,
not legal advice.
