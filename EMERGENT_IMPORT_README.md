# Riverina Revenue Radar import notes

This package is the React/Vite source app for Telios Pest Management's Riverina Revenue Radar.

## If importing into Emergent or another app builder

Use the clean source zip where `package.json` is at the top level of the zip. After import, the app can be installed and run with:

```bash
npm install
npm run build
npm run start
```

The app entry point is `client/src/App.tsx`. The inspection report workflow is in `client/src/components/ReportsView.tsx`.

## If adding it to an existing website

Use the static website zip. Upload the contents of that zip to a subfolder such as `/riverina-radar/` on your website hosting. The static zip contains only:

- `index.html`
- `assets/`

That version is easiest for ordinary website hosting, but it does not add login, saved reports, database storage, or customer history by itself.

## Recommended production upgrade

For day-to-day business use, add a proper database and login so Telios can save client records, inspection reports, device maps, photos, chemical usage logs, SDS records and follow-up actions.
