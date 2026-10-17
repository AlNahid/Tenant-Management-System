# Landlord PWA

Google Sheets is the only database. Two tabs: **Tenants** (one row per unit) and **Rent Payments**.
Buildings have no tab: a building exists through its unit rows (ID, name, address).

```
backend/                      Cloudflare Pages Function (API)
  functions/api/[[route]].js  entry: auth check → router
  src/config/schema.js        sheet headers + constants
  src/models/                 sheetModel (generic rows), unitModel, paymentModel   ← data + rules
  src/controllers/            auth, data, setup, unit/building, payment
  src/views/json.js           JSON responses
  src/services/               google (service account), session, util
  src/routes.js               "METHOD path" → controller
frontend/                     static PWA (no build step)
  index.html, manifest.json, sw.js, icon.svg, css/app.css
  js/models/                  store (state + selectors), api, cache (IndexedDB), calc
  js/views/                   layout, dashboard, buildings, tenants, generate, payments, settings, parts, ui, billImage
  js/controllers/             session, building, unit, payment, bill, index (data-act → function)
  js/main.js                  boot + event wiring
tests/                        calc + backend tests (fake in-memory sheet)
```

## Environment variables
Set as **secrets** in Cloudflare (Pages → project → Settings → Variables and Secrets), then redeploy.
For local runs put them in `backend/.dev.vars` (never commit it).

| Name | Value |
|---|---|
| `SHEET_ID` | ID from the spreadsheet URL |
| `GOOGLE_CLIENT_EMAIL` | service-account email (share the sheet with it as Editor) |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON key |
| `LANDLORD_PASSWORD` | the password you sign in with |
| `SESSION_SECRET` | any long random string |

## Run / deploy
```
npm i -g wrangler && wrangler login
npm run dev        # local: http://localhost:8788
npm run deploy     # = cd backend && wrangler pages deploy ../frontend --project-name landlord
npm test
```
Run deploy from the project root (the script switches into `backend/` so Cloudflare finds `functions/`).
First time: sign in → Settings → **Prepare spreadsheet** (creates the two tabs, headers, Occupied/Empty dropdown).

## Behaviour notes
- **Add building** creates the building together with its first unit. **Remove building** deletes all its unit rows. Removing the last unit removes the building.
- **Remove unit/building** never touches Rent Payments; payment rows keep their building/unit snapshots.
- **Delete payment** removes the row from the sheet.
- An old `Buildings` tab (from the previous version) is no longer used; delete it if you like. Buildings that had no units will not appear.
- Offline: read-only from the IndexedDB cache; all writes and bill generation are disabled.

## Backup / recovery
Sheets → File → Version history (name a version monthly) and File → Download → .xlsx weekly. Restore a version and the app reads it on the next sync. Do not delete the header rows.

## Troubleshooting
- "Google authentication failed": re-paste `GOOGLE_PRIVATE_KEY`, confirm Sheets API is enabled.
- "Requested entity was not found": wrong `SHEET_ID`, or the sheet is not shared with the service account.
- Signed out repeatedly: `SESSION_SECRET` changed.
