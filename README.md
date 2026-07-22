# Mohammed — Portfolio Website

A personal portfolio site (React + TypeScript + Vite + Tailwind CSS v4) with a built-in admin
dashboard for editing every piece of content — no code changes required.

Live at: https://mahyoub88.github.io

## Features

- Home, About, Experience, Work, Articles, Skills, and Contact sections in one page
- Dark / light theme toggle
- `/admin` dashboard (password-protected) to edit hero text, specializations, tools, stats,
  experience, projects, articles, and contact/social links — changes save instantly to the
  browser
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

1. Go to `/admin` and sign in.
2. Default password is `admin123` — change it immediately from **Settings → Change Admin
   Password**.
3. Edit any section from the sidebar. Click **Save Changes** to persist to this browser
   (localStorage).
4. Use **Settings → Export content.json** to download a backup, or **Import JSON** to restore
   one.
5. To make edits permanent and visible to every visitor, use **Settings → Publish to GitHub**
   (see below) and then redeploy, or manually copy the exported JSON over
   `src/data/defaultContent.json` and commit it.

### Publish to GitHub (optional)

This lets the dashboard commit your edits directly to `src/data/defaultContent.json` in this
repo via the GitHub REST API, called from your browser.

1. Create a GitHub **fine-grained personal access token** scoped only to this repository with
   **Contents: Read and write** permission.
2. In **Settings → Publish to GitHub**, fill in the owner (`Mahyoub88`), repo
   (`Mahyoub88.github.io`), branch (`main`), and file path (`src/data/defaultContent.json` by
   default), paste the token, and click **Publish to GitHub**.
3. GitHub Pages redeploys automatically on push, and the new content becomes the default for
   everyone, including visitors with no local edits.

The token is stored only in your browser's local storage and used solely to call the GitHub API
directly — only use this on a device you trust.

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
