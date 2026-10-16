# Admin dashboard

Open `/admin` and unlock the existing browser vault. Its password and encrypted GitHub token stay in that browser; no credentials are bundled into the public site.

## Content

The existing section editors manage the homepage content. Projects now include dark/light cover images, alternative text, source media, captions, links and IDs. Education includes degree documents; credentials include images, descriptions, verification links and validity dates. Media fields accept a URL or upload a new file to `public/uploads/` using the configured GitHub branch. Copying a public repository path into a URL drops the `public` prefix.

Uploads create a file commit immediately. Save the content draft afterwards to publish references to those files. New projects need complete media and status fields; publishing generates their case-study page and adds it to the sitemap. Removing a project card retains its existing detailed page and source files; use Pages & Files to remove those separately when appropriate.

## Appearance and SEO

Manage the default theme, theme backgrounds/surfaces, accent colors, font stack, desktop statistics columns, section order/visibility, section headings, footer text, search metadata, sharing image, favicon and indexing. Hidden homepage sections are removed from the navigation automatically. A visitor's selected theme takes priority over the site default. Advanced layouts and CSS are editable in Pages & Files.

## Pages and files

Load the repository file list, filter by path, or open an exact path. Edit HTML, CSS, JavaScript, JSON, SVG and other text files; upload or replace binary media/downloads. Create new files, delete files, inspect the last 20 file revisions and restore a revision as a new commit. A loaded file's SHA is required when replacing or deleting it, so concurrent changes are rejected. HTML previews are sandboxed without script execution.

Files commit directly to the configured branch. Generated fields in case-study pages (title, description, status, hero image, tags, summary facts, pagination and shared header/footer) come from the content editors during build. Edit the project's unique technical sections in its HTML file. The full source, including shared templates in `scripts/sync-projects.mjs`, is available in the advanced file editor.

## Drafts, publishing and deployment

Preview saves a browser-local draft and opens the homepage. Save Changes also commits the content when GitHub is configured; otherwise it saves only locally. A stale published baseline is rejected instead of overwriting newer remote content. Export your draft before reloading and reconciling conflicts.

“Committed to GitHub” confirms the commit, not a completed deployment. Deployment Status lists GitHub Pages workflow runs and matches the last content commit by SHA. Refresh until its deployment succeeds. A configured non-deployment branch must be merged into the deployment branch. Actions read permission is required to inspect runs.

Complete Content edits all content fields as validated JSON. Settings supports JSON backups/imports, vault configuration and password changes. Source and binary changes have their own version history; JSON backups cover content only.

## Validation

`npm test`, `npm run lint`, `npm run build`, and `npm run check:projects` cover publishing conflicts, Unicode files, path validation, upload limits, deployment lookups, new page generation, retained custom sections, SEO and theme updates. `tests/ui.html` is a development-only fixture for exercising editor components without credential setup; it is not a production build entry.
