# Database handoff — Riverina Revenue Radar

This document describes the HTTP routes the React client expects so that
prospects and outreach script edits can be persisted in the Emergent database.

The client lives at `client/src/lib/radarApi.ts`. Until these routes exist and
return JSON, the app falls back to the seeded prospect list (`PROSPECTS` in
`client/src/lib/prospects.ts`) and treats any new lead or script edit as
"session only".

The client never uses `localStorage`, `sessionStorage`, `IndexedDB`, or
cookies. Persistence must be on the server.

All endpoints live under `/api/admin/radar/*` and accept and return JSON.

---

## `GET /api/admin/radar/prospects`

Return every prospect in the database.

- **Response 200**: JSON array of `Prospect` objects (see shape below).
- **Response 404 / 5xx / non-JSON**: client treats this as "endpoint not
  available yet" and falls back to the seeded prospect list. The Add lead form
  shows the session-only banner.

`Prospect` shape (matches `client/src/lib/prospects.ts`):

```jsonc
{
  "id": "manual-acme-foods-1714694400000-0",
  "companyName": "Acme Foods",
  "category": "Food processor",
  "categoryGroup": "Other", // one of CATEGORY_GROUPS
  "town": "Griffith, NSW",
  "websiteUrl": "https://example.com",
  "publicSourceUrl": "https://example.com/about",
  "whyGoodFit": "…",
  "buyerTitles": ["Operations Manager", "QA Manager"],
  "leadScore": 72,                  // 1–100
  "outreachAngle": "…",
  "tier": 2,                        // 1 | 2 | 3
  "estMonthlyValue": 1400           // AUD per month, integer
}
```

Allowed `categoryGroup` values: `Winery / Brewery / Distillery`,
`Meat Processing`, `Dairy`, `Grain & Feed`, `Cold Storage & Logistics`,
`Packing & Citrus`, `Rice & Food Manufacturing`, `Other`.

---

## `POST /api/admin/radar/prospects`

Insert a new prospect.

- **Request body**: a single `Prospect` object as defined above. The client
  generates the `id` (`manual-…-<timestamp>-<idx>`); the server may overwrite
  it and return the canonical record.
- **Response 200/201**: the saved `Prospect` (the client merges any
  server-side fields — for example, a new `id` — back onto the row in memory).
- **Response 4xx / 5xx / network error**: the client keeps the prospect in
  memory for this session only and shows the amber "session only" banner.

The client always optimistically prepends the new prospect locally before the
POST resolves, so the server should be idempotent on the supplied `id` if
possible.

---

## `GET /api/admin/radar/outreach-scripts?prospectId=<id>&buyerTitle=<title>`

Return the saved override for a single (prospect, buyer title) pair.

- **Response 200** with body: an `OutreachScriptOverride` object (shape below).
- **Response 200 with empty/null body, or 404**: treated as "no override yet"
  — the client falls back to the generated draft from
  `client/src/lib/outreach.ts`.
- **Response 5xx / non-JSON / network error**: treated as "endpoint not
  available yet" — same fallback.

`OutreachScriptOverride` shape:

```jsonc
{
  "prospectId": "berton-vineyards-0",
  "buyerTitle": "Operations Manager",
  "emailSubject": "…",
  "emailBody": "…",
  "phoneOpener": "…",
  "linkedInNote": "…",          // <= 300 chars
  "updatedAt": "2026-05-07T01:23:45.000Z" // optional, server-managed
}
```

---

## `POST /api/admin/radar/outreach-scripts`

Upsert an override for a (prospect, buyer title) pair. Use this — there is no
separate `PUT`.

- **Request body**: an `OutreachScriptOverride` object as above. `(prospectId,
  buyerTitle)` is the natural key — overwrite if it exists.
- **Response 200/201**: the saved `OutreachScriptOverride` (typically with
  `updatedAt` set). The client merges this back over the in-memory copy and
  shows a green "Saved to database" banner.
- **Response 4xx / 5xx / network error**: the client keeps the edits in
  memory for this session only and shows the amber "session only" banner.

The user must press the explicit **Save script edits** button to trigger the
POST — typing in the script fields does not auto-save.

---

## Notes for Emergent

- The client treats any of `non-2xx`, network error, or non-JSON content type
  as "endpoint not implemented yet" and silently falls back without crashing.
  This means partial rollouts are safe: ship the prospects endpoints first,
  then the outreach-scripts endpoints, in any order.
- There is no auth header expected from the client today; if an auth scheme
  is added, return 401 and the client will fall back to seeded data.
- All data is plain JSON over HTTPS; no binary, no streaming, no websockets.
- `id` for prospects is a string. For seeded prospects it is a slug-ish form
  like `berton-vineyards-0`; for manual leads it is `manual-<slug>-<timestamp>-<idx>`.
  Treat it as opaque and unique.
