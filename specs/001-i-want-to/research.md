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

## Risk Mitigation Notes
- Respect NeoDB rate limits by debouncing fetches and caching responses in `localStorage` for the session (with explicit manual refresh control).  
- Provide placeholder imagery and short copy truncation when metadata is missing, preventing layout collapse.  
- Document manual review steps for color contrast adjustments whenever theme tokens change.
