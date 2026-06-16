# Canadian Digital Policy Tracker

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

| Bill | Title | Theme | Lead department |
|------|-------|-------|-----------------|
| C-36 | Protecting Privacy and Consumer Data Act (PIPEDA reform) | Privacy | ISED |
| C-22 | Lawful Access Act, 2026 | Surveillance & lawful access | Public Safety Canada |
| C-34 | Safe Social Media Act | Online safety | Canadian Heritage |
| C-8  | Critical Cyber Systems Protection | Cybersecurity | Public Safety Canada |

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

## Independence

Digital Policy Tracker is a non-partisan, non-profit, independent resource. It is not
affiliated with the Government of Canada, Parliament, any political party, or any bill's
sponsors or opponents. Legislative status comes directly from the Parliament of Canada's
LEGISinfo feed; news is aggregated across outlets. Editorial notes are independent
analysis, not legal advice.
