# Research Findings — Personal Podcast Gallery

## NeoDB Integration
- **Decision**: Use the official NeoDB podcast episode endpoint `GET https://neodb.social/api/podcast/episode/{uuid}` with UUIDs sourced from the curator’s list.  
  **Rationale**: Endpoint returns the precise metadata needed (title, description, cover URL, official site). It avoids maintaining duplicate data locally and aligns with the constitution’s NeoDB Data Authority principle.  
  **Alternatives considered**:  
  - Caching metadata in a JSON file committed to the repo — rejected because it risks stale data and violates single-source-of-truth mandate.  
  - Scraping podcast RSS feeds — rejected due to inconsistent structures and higher maintenance compared to NeoDB’s normalized schema.

- **Decision**: Require an environment variable `NEODB_API_BASE=https://neodb.social/api` injected at build time, with optional bearer token `NEODB_API_TOKEN` if private access becomes necessary.  
  **Rationale**: Keeps configuration flexible while preserving static hosting; avoids hardcoding service URLs or secrets.  
  **Alternatives considered**:  
  - Embedding the base URL directly in code — rejected to maintain configurability for staging mirrors or proxying.  
  - Storing tokens in source — rejected due to security risk.

- **Decision**: Standardize request wrapper with 5-second timeout and retry-once policy, surfacing descriptive errors to the UI.  
  **Rationale**: Prevents the gallery from hanging on slow responses and provides predictable UX.  
  **Alternatives considered**:  
  - Infinite retries — rejected to avoid rate-limit issues.  
  - Immediate failure without retry — rejected because transient network hiccups are common.

## Asset Pipeline & Performance
- **Decision**: Use esbuild as the bundler/minifier producing `/dist` with hashed assets, image optimization handled by a pre-processing script (Sharp or imagemin) executed manually before commit.  
  **Rationale**: Esbuild is fast, supports vanilla JS, and outputs static files; separate image pipeline keeps bundle <200 KB.  
  **Alternatives considered**:  
  - Vite static mode — viable but introduces more tooling overhead for this simple site.  
  - No bundler — rejected because bundling/minification materially improves performance budget compliance.

- **Decision**: Prefer WebP/AVIF image formats with responsive `srcset` and lazy loading for below-the-fold cards.  
  **Rationale**: Minimizes payload while preserving quality, directly helping meet performance budget and responsiveness goals.  
  **Alternatives considered**:  
  - Serving original JPEG/PNG — rejected due to larger payloads.  
  - Converting on-the-fly via third-party CDN — rejected because it introduces external dependencies beyond static hosting.

## Accessibility & Testing Tooling
- **Decision**: Integrate axe-core CLI against the built `dist/index.html` and enqueue manual keyboard navigation checks in QA list.  
  **Rationale**: Axe-core reliably surfaces WCAG 2.1 AA violations; manual checks ensure focus management and reduced-motion considerations are honored.  
  **Alternatives considered**:  
  - Relying solely on manual testing — rejected to maintain repeatable automated evidence.  
  - Using only browser extensions — rejected due to lack of automation for CI.

- **Decision**: Run Lighthouse CI in two modes (mobile, desktop) after each build, storing report artifacts for PR evidence.  
  **Rationale**: Ensures compliance with >=90 Performance/Best Practices requirement and provides historical tracking.  
  **Alternatives considered**:  
  - Single Lighthouse run — rejected because mobile and desktop can diverge.  
  - Other performance tools (PageSpeed Insights API) — rejected due to more complex automation for a static repo.

## User Evidence & Moderation
- **Decision**: Conduct a lean moderated usability session with three representative listeners, capturing 5-second recognition metrics and qualitative notes.  
  **Rationale**: Meets SC-001 requirement without overburdening resources; three participants provide qualitative confirmation for a personal gallery.  
  **Alternatives considered**:  
  - Larger formal study — rejected as disproportionate for personal project scope.  
  - Unmoderated remote test — rejected due to difficulty measuring 5-second recognition reliably.

- **Decision**: Store a curator-managed `sensitive` boolean alongside each UUID in `src/data/podcasts.json` to drive blur overlays.  
  **Rationale**: Keeps sensitive content control simple, versioned, and co-located with the curated list; avoids additional config files.  
  **Alternatives considered**:  
  - Separate sensitive list — rejected to prevent divergence between sources.  
  - Runtime toggles stored in localStorage — rejected because they are not shareable across deployments.

- **Decision**: Implement a nightly metadata audit script (`scripts/audit-metadata.js`) that logs refresh status, delta detection, and timestamps to support SC-004.  
  **Rationale**: Automates freshness validation and produces evidence without manual logging; script can run locally or via scheduled job.  
  **Alternatives considered**:  
  - Manual weekly spot checks — rejected because they cannot guarantee 95% within 24 hours.  
  - Full backend service — rejected as unnecessary for static hosting context.

## Risk Mitigation Notes
- Respect NeoDB rate limits by debouncing fetches and caching responses in `localStorage` for the session (with explicit manual refresh control).  
- Provide placeholder imagery and short copy truncation when metadata is missing, preventing layout collapse.  
- Document manual review steps for color contrast adjustments whenever theme tokens change.
