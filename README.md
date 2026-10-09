# Mohammed — Portfolio Website

A personal portfolio site (React + TypeScript + Vite + Tailwind CSS v4) with a built-in admin
dashboard for editing every piece of content — no code changes required.

Live at: https://mahyoub88.github.io

## Features

- Home, About, Experience, Work, Articles, Skills, and Contact sections in one page
- Dark / light theme toggle
- `/admin` dashboard to edit hero text, specializations, tools, stats, experience, projects,
  articles, and contact/social links — changes save instantly to the browser
- Export/import content as JSON, reset to defaults
- Optional one-click "Publish to GitHub" that commits the edited content straight to this repo,
  so it becomes the new default for every visitor after redeploy
- Deployable to GitHub Pages (pre-configured), Netlify, Vercel, or any static host

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Using the admin dashboard

The dashboard is per-browser. The first visit to `/admin` on a given browser asks you to create
an **admin vault**: you choose a password (12 characters minimum) and nothing else is required.

There is **no default password**. The password itself is never stored — not in plaintext and not
as a hash. It derives an AES-256-GCM key via PBKDF2 (310,000 iterations, SHA-256), and that key
is what encrypts and decrypts your GitHub token. The key lives in memory only, so:

- Reloading the page asks for the password again. That is intentional.
- Someone who forges the "signed in" state in DevTools gets an empty dashboard shell — without
  the password there is no key, and without the key the stored token stays ciphertext.
- Losing the password means the stored token cannot be recovered. Issue a new token and set the
  vault up again.

Day to day:

1. Go to `/admin` and unlock the vault.
2. Edit any section from the sidebar. Click **Save Changes** to persist to this browser.
3. Use **Settings → Export content.json** to download a backup, or **Import JSON** to restore one.
4. To make edits permanent and visible to every visitor, use **Settings → Publish to GitHub**
   (see below), or manually copy the exported JSON over `src/data/defaultContent.json` and
   commit it.

### Publish to GitHub (optional)

This lets the dashboard commit your edits directly to `src/data/defaultContent.json` in this
repo via the GitHub REST API, called from your browser.

1. Create a GitHub **fine-grained personal access token** scoped only to this repository with
   **Contents: Read and write** permission, and give it an expiry date.
2. In **Settings → Publish to GitHub**, fill in the owner (`Mahyoub88`), repo
   (`Mahyoub88.github.io`), branch (`main`), and file path (`src/data/defaultContent.json` by
   default), paste the token, and click **Encrypt & Save Token**.
3. GitHub Pages redeploys automatically on push, and the new content becomes the default for
   everyone, including visitors with no local edits.

The token is encrypted with your vault key before it is written to local storage, and is
decrypted only for the duration of a publish request. It still passes through this browser in
plaintext at that moment, so only use this on a device you trust. **Remove Token** clears it, and
changing your password re-encrypts it under the new key.

## Deployment

### GitHub Pages (default)

A workflow at `.github/workflows/deploy.yml` builds and deploys this site to GitHub Pages on
every push to `main`. Enable it once under the repo's **Settings → Pages → Source: GitHub
Actions**. Because this repo is named `<username>.github.io`, it serves directly from
`https://mahyoub88.github.io` with no subpath.

### Netlify / Vercel

Build command `npm run build`, publish directory `dist`. SPA fallback configs
(`public/_redirects` for Netlify, `vercel.json` for Vercel) are already included so `/admin`
works on direct load and refresh.

### Any static host

Run `npm run build` and upload the contents of `dist/`.

## Illustrated project documentation

[Browse all case studies](https://mahyoub88.github.io/projects/) · [Project index](docs/PROJECTS.md)

Every portfolio project has a standalone page under `public/projects/`, with two explanatory SVG diagrams, engineering rationale, source notes and an evidence checklist. Existing repository figures, public notebook plots and LinkedIn project media are reused with source context. The cards link to these pages and their source repositories.

Project titles, links, status labels, previews and overview facts are canonical in `src/data/defaultContent.json`. `npm run sync:projects` generates the shared presentation fields, case-study index, collection indexes and `docs/PROJECTS.md`; build runs this synchronization automatically. Project-specific rationale and evidence sections remain editable in `public/projects/<project-id>/index.html`.

Run `npm run check:projects` to verify generated content, unique project identities, image descriptions and local page/media links. Collections are navigation indexes and are excluded from the project count. USV study notes have a separate page at `/notes/usv/`.

Public repositories retain their source documentation and credits. `docs/SOURCE_MEDIA.json` records each matched portfolio media snapshot, source commit and SHA-256 checksum. To restore those snapshots from checked-out source repositories, run `node scripts/sync-source-media.mjs --repo-root <source-checkouts-directory>`. It validates every source before copying. Local snapshots are intentional static-hosting artifacts; independent duplicate copies within the portfolio have been consolidated.

New illustrations must be labeled as explanatory; reference snippets are not recovered firmware, and public-summary charts are not new experiments. Private assessment code and dataset outputs remain private.
