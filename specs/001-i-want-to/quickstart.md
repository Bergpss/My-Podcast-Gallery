# Quickstart — Personal Podcast Gallery

## Prerequisites
- Node.js 20.x (for tooling only; output remains static HTML/CSS/JS)
- npm 10.x
- Access to NeoDB podcast UUID list curated by the site owner
- Optional: NeoDB API token if the curated list includes private entries

## 1. Clone & Install Tooling
```bash
npm install
```

## 2. Configure Environment
1. Copy `.env.example` to `.env`.
2. Populate the following variables:
   - `NEODB_API_BASE=https://neodb.social/api`
   - `NEODB_API_TOKEN=` (leave blank if not required)
   - `PODCAST_UUIDS=` comma-separated list of podcast UUIDs to feature. Maintain the canonical list (with optional `"sensitive": true` flags and curator notes) in `src/data/podcasts.json`.

## 3. Prepare Assets
1. Place full-resolution cover art assets in `src/assets/raw/` (JPEG or PNG).
2. Run the optimizer:
   ```bash
   npm run prepare:images   # Sharp + imagemin create multi-size WebP/AVIF variants
   ```
3. Optimized outputs are written to `src/assets/optimized/` with a generated `manifest.json` describing each variant. Replace gallery references with the optimized filenames to respect performance budgets (<200 KB gzipped per page).

## 4. Build the Static Site
```bash
npm run build            # Produces dist/ with hashed assets via esbuild
```
The build script injects the environment variables defined in `.env` so the bundled client can read `NEODB_API_BASE`, `NEODB_API_TOKEN`, and `PODCAST_UUIDS` at runtime.

## 5. Run Quality Gates
```bash
npm run test:accessibility   # Runs axe-core in jsdom against dist/index.html
npm run test:lighthouse      # Launches Chrome headless, audits mobile + desktop, stores JSON in docs/evidence/lighthouse/
npm run test:responsive      # Captures 300/360/768/1200/1800 px screenshots via Puppeteer
npm run usability            # Generates a timestamped moderated-session template under docs/evidence/usability/
npm run audit:metadata       # Fetches each NeoDB UUID, logs results to docs/evidence/metadata/
```
All commands must pass before submitting a pull request. Set `CHROME_PATH` or `PUPPETEER_EXECUTABLE_PATH` if Chrome/Chromium is installed in a non-standard location.

## 6. Preview Locally
```bash
npm run preview          # Serves dist/ for manual QA
```
Manual validation checklist:
- Keyboard navigation reaches every interactive element with visible focus.
- Color contrast meets WCAG 2.1 AA thresholds.
- Loading/error states display meaningful messages when NeoDB fetch fails (simulate by disconnecting network).
- Sensitive podcasts are blurred with warning badge and can be revealed intentionally.

## 7. Deployment
Deploy the contents of `dist/` to any static hosting provider (e.g., Netlify, GitHub Pages, Vercel static export). No server configuration is required.

## Evidence Collection for PRs
- Attach the latest axe-core summary (console output) and Lighthouse reports from `docs/evidence/lighthouse/`
- Include responsive screenshots saved in `docs/evidence/responsive/` (300, 360, 768, 1200, 1800 widths)
- Add moderated usability notes generated under `docs/evidence/usability/`
- Commit the latest metadata audit log from `docs/evidence/metadata/`
- Reference any unusual findings or follow-up actions in the pull request description
