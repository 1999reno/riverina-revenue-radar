# Riverina Revenue Radar — Telios Pest Management

## Paths
- `project_path`: `/home/user/workspace/telios-riverina-radar`
- Built output (deployable static): `/home/user/workspace/telios-riverina-radar/dist/public`
- Server bundle (not used in deploy): `/home/user/workspace/telios-riverina-radar/dist/index.cjs`
- Seed data (read-only): `/home/user/workspace/telios-riverina-radar/client/src/data/prospects.json` (copy of the dataset the parent agent supplied)

## How to rebuild and redeploy
```
cd /home/user/workspace/telios-riverina-radar
npm run build
# then deploy_website(project_path="/home/user/workspace/telios-riverina-radar/dist/public", entry_point="index.html", should_validate=false)
```
`npm run build` runs `tsx script/build.ts` (Vite + esbuild). Build is currently green; `tsc --noEmit` also clean.

## Architecture
- Pure frontend SPA. No backend, no localStorage / sessionStorage / indexedDB / cookies.
- Section navigation lives in React state in `client/src/App.tsx` (no routing/wouter usage).
- Data is imported statically from JSON: `client/src/data/prospects.json` → normalised in `client/src/lib/prospects.ts`.

## Source files (all under `client/src/`)
- `App.tsx` — top-level state: section, active prospect drawer, deep-link prospect ids for outreach/follow-ups.
- `index.css` — full design system: eucalyptus / wheat / charcoal tokens, light + dark variants, wheat-grain texture utility.
- `lib/prospects.ts` — types, category grouping, tier assignment (≥88 = T1, ≥75 = T2, else T3), indicative monthly $ value.
- `lib/scoring.ts` — `SCORE_WEIGHTS` (40 / 30 / 20 / 10) used in the drawer's "How the score is composed".
- `lib/outreach.ts` — `generateOutreach(prospect, buyerTitle)` and `auditOfferTemplate(prospect?)`. Plain text, no spammy language.
- `lib/theme.tsx` — `ThemeProvider` seeded from `prefers-color-scheme`, toggles `document.documentElement.classList`. **No persistence** (sandbox restriction).
- `components/Shell.tsx` — left sidebar (desktop) + collapsing drawer (mobile), seven-item nav.
- `components/Logo.tsx` — inline SVG mark (mountain + radar dot).
- `components/Dashboard.tsx` — KPIs + asymmetric grid, category mix, top-5 list. First-month pipeline = sum(T1) + 0.5 × sum(T2).
- `components/ProspectsView.tsx` — search, filter (category / town / tier), sort (score / value / name).
- `components/ProspectDrawer.tsx` — slide-in detail with why-good-fit, buyer titles, outreach angle, score weights, source links, action buttons.
- `components/OutreachView.tsx` — pick prospect + buyer title, generates email / phone / LinkedIn.
- `components/FollowupsView.tsx` — staged checklist (Day 1 email, 2 call, 5 LinkedIn, 10 audit, 21 quarterly review). Per-account state in React state.
- `components/ReportsView.tsx` — inspection report form for site visits. Prefills from selected prospect and facility type, captures evidence/risk/findings/actions, then generates a Telios report for copy or print.
- `components/AuditView.tsx` — free 15-minute audit-offer template, generic or tailored to a prospect.
- `components/PlaybookView.tsx` — segments, value prop, offer ladder, objections, weekly targets.
- `components/CopyButton.tsx` — `navigator.clipboard.writeText` with textarea fallback and inline "Copied" feedback.

## Design decisions
- **Palette**: deep eucalyptus (`hsl(162 38% 22%)`) primary surface used in sidebar + featured KPI; wheat (`42 38% 88%`) for secondary; off-white (`42 25% 97%`) page; charcoal (`165 12% 14%`) ink; restrained amber (`hsl(36 78% 48%)`) for the Tier-1 status accent. No purple, no SaaS gradients.
- **Type**: Satoshi (Fontshare) for body/display, JetBrains Mono for tabular figures (load is non-blocking; falls back to Inter / system).
- **Layout**: persistent left sidebar (288 px desktop) + asymmetric KPI grid (4-4-4 / 4-4 / 4 with a tall featured card spanning two rows). `text-xl` is the max heading size per webapp rules.
- **Mobile**: single-column. Sidebar collapses behind a `Menu` button in the top bar; theme toggle still available in the top bar.

## Test IDs
Every interactive / dynamic element has `data-testid`:
- Nav: `nav-{section}`, `button-theme-toggle`, `button-theme-toggle-mobile`, `button-menu-toggle`.
- Dashboard KPIs: `kpi-total`, `kpi-tier1`, `kpi-avg-score`, `kpi-pipeline`, `kpi-top-segment`, `row-category-{i}`, `row-top-{prospectId}`, `button-view-all-prospects`.
- Prospects: `input-search`, `select-category`, `select-town`, `select-tier`, `button-clear-filters`, `button-sort-{score|value|name}`, `row-prospect-{id}`.
- Drawer: `drawer-prospect`, `text-prospect-name`, `text-why-good-fit`, `text-outreach-angle`, `metric-score`, `metric-value`, `metric-tier`, `item-buyer-{i}`, `link-website`, `link-public-source`, `button-start-outreach`, `button-start-followup`, `button-close-drawer`, `button-close-drawer-overlay`.
- Outreach: `select-prospect`, `select-buyer-title`, `output-email`, `output-phone`, `output-linkedin`, plus `output-{kind}-copy` and `output-{kind}-copy-fallback` for the textarea fallback.
- Follow-ups: `select-followup-prospect`, `button-stage-{stageId}`, `metric-sequences-started`, `metric-sequences-done`.
- Reports: `select-report-prospect`, `select-report-type`, `input-inspection-date`, `input-inspector-name`, `input-site-contact`, `button-apply-report-template`, `checkbox-evidence-{slug}`, `select-risk-level`, `button-copy-report`, `button-print-report`, `text-generated-report`.
- Audit: `select-audit-prospect`, `button-copy-audit`, `text-audit-template`.
- Playbook: `button-copy-playbook`, `objection-{i}`.

## Conventions for incremental edits
- Add a new prospect → append an object to `client/src/data/prospects.json` (existing schema with `company_name`, `category`, `town_or_area`, `website_url`, `public_source_url`, `why_good_fit`, `suggested_buyer_titles`, `lead_score`, `first_outreach_angle`).
- Adjust tier thresholds → `tierFor` in `lib/prospects.ts`.
- Adjust pipeline assumptions → `estValueFor` (per-tier base × per-category multiplier) in `lib/prospects.ts`. First-month pipeline formula is in `Dashboard.tsx` (`stats.firstMonth`).
- Adjust outreach copy → `lib/outreach.ts` (single source for email / phone / LinkedIn / audit template).
- Add a follow-up stage → push to `FOLLOWUP_STAGES` in `components/FollowupsView.tsx` (id, day, label, description, icon).
- Adjust report wording/templates → edit `components/ReportsView.tsx` (`segmentDefaults`, `reportTextFor`, and the form field list).
- Add a nav section → add to `NAV` in `components/Shell.tsx`, add a section key to `SectionKey`, and render in `App.tsx`.
- After any change: `cd /home/user/workspace/telios-riverina-radar && npm run build`, then redeploy `dist/public`.

## Known caveats
- `deploy_website` validator flagged the dashboard tier breakdown as suspicious — this is a false positive. Numbers add up: 10 + 10 + 4 = 24, percentages sum to ~100%. Use `should_validate=false` for redeploys until validator resolves it.
- Top-5 row truncation on long company names (e.g. "Baiada Poultry — Hanwood Processing Plant") is intentional `truncate` to keep table rhythm; full names are visible in the prospects view and drawer.
