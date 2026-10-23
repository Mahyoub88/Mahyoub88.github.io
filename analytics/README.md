# Visitor analytics

A small first-party analytics system for the portfolio: a Cloudflare Worker that receives events from
`public/analytics.js`, stores them in Cloudflare D1, and serves a token-protected dashboard.
It is not part of the Vite build or the GitHub Pages deployment; the Worker is deployed separately.

## What is recorded

| Event | When | Stored |
|---|---|---|
| `pageview` | Every page load and in-app navigation (not `/admin`) | path, title, source, country/region/city, device, OS, browser, language |
| `engaged` | Page hidden or left | active milliseconds on that page |
| `click` | CV download, LinkedIn, GitHub, ORCID, WhatsApp, email | event name |

Visitors are told apart by a random id kept in their own `localStorage` (and one per tab session in
`sessionStorage`). **Not stored:** IP address, user-agent string, cookies, names, e-mail addresses.
Location comes from Cloudflare's request metadata and is only approximate. Rows older than
`RETENTION_DAYS` (default 395) are deleted by a daily cron.

The tracker does nothing when: `ENDPOINT` is empty, the site is opened on localhost, the browser sends
Do Not Track or Global Privacy Control, or the owner has opted out. Visit any page with `?notrack=1` once
in your own browsers to exclude yourself (`?notrack=0` undoes it).

Visitors' names, companies and LinkedIn accounts cannot be learned from a visit. They only appear if a
visitor tells you (for example through the contact form).

## Deploy (one time)

Requires a Cloudflare account and `npx wrangler login`. From this folder:

```bash
npx wrangler d1 create visitor-analytics
```

Paste the printed `database_id` into `wrangler.toml`, then:

```bash
npx wrangler d1 execute visitor-analytics --remote --file=schema.sql
npx wrangler secret put DASHBOARD_TOKEN
npx wrangler deploy
```

Use a long random value for `DASHBOARD_TOKEN` (for example `openssl rand -hex 32`). Optional: `npx wrangler secret put ALERT_WEBHOOK_URL`
with an [ntfy.sh](https://ntfy.sh)-style topic URL to get a notification whenever the CV is downloaded.

`wrangler deploy` prints the Worker URL. Then, in the site repository:

1. Open `public/analytics.js` and set `ENDPOINT` to `<worker url>/collect`.
2. Merge to `main`; the existing GitHub Pages workflow deploys it.

## Using the dashboard

Open the Worker URL in a browser and enter the token. It is kept in `sessionStorage` for that tab only.
The page itself contains no data; numbers are only returned by `/api/stats` for a correct bearer token.
Page views, unique and returning visitors, active time, CV downloads, LinkedIn visits, daily chart, top
pages/projects, sources, countries and cities, devices/OS/browsers and the latest 100 events are shown.

## Tests

`npm test` covers the helpers, the tracker script and (on Node 22+, where `node:sqlite` exists) the Worker
end to end against `schema.sql`.
