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
   - `PODCAST_UUIDS=` comma-separated list of podcast UUIDs to feature (each entry may optionally include `"sensitive": true` in `src/data/podcasts.json` to blur cover art).

## 3. Prepare Assets
```bash
npm run prepare:images   # Converts cover art to WebP/AVIF and generates srcset variants
```
(Ensure output files remain under the 200 KB gzipped budget; the script will warn on overages.)

## 4. Build the Static Site
```bash
npm run build            # Produces dist/ with hashed assets via esbuild
```

## 5. Run Quality Gates
```bash
npm run test:accessibility   # axe-core audit against dist/index.html
npm run test:lighthouse      # Lighthouse CI (mobile + desktop)
npm run test:responsive      # Captures viewport screenshots for 300px, <=360px, 768px, >=1200px, >=1800px
npm run usability            # Guides moderated 5-second recognition session (three participants)
npm run audit:metadata       # Executes scripts/audit-metadata.js for nightly freshness log
```
All commands must pass before submitting a pull request.

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
- Attach latest axe-core and Lighthouse reports (JSON or HTML)
- Provide responsive screenshots for mobile (<=360 px), tablet (768 px), and desktop (>=1200 px)
- Provide extreme viewport evidence (300 px & 1800 px captures)
- Include timestamped note confirming NeoDB data refreshed successfully within last 24 hours
- Attach usability session summary and metadata audit log excerpt covering the latest run
