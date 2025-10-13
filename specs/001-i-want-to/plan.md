# Implementation Plan: Personal Podcast Gallery

**Branch**: `001-i-want-to` | **Date**: 2025-10-13 | **Spec**: [/Users/kangberg/Dev/My-Web/My-Podcast-Gallery/specs/001-i-want-to/spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-i-want-to/spec.md`

## Summary

Deliver a static, modern podcast gallery that hydrates curator-selected NeoDB entries, displays cover art (with sensitive imagery safeguards), and maintains accessibility, responsiveness, and performance budgets while providing evidence (audits, usability tests, metadata monitoring) for each core principle.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: none (vanilla stack mandated), build tooling via esbuild, Sharp/imagemin for assets  
**Storage**: N/A runtime (static site); localStorage used for in-browser caching only  
**Testing**: axe-core CLI (accessibility), Lighthouse CI (performance/best practices), Puppeteer screenshots (responsive), moderated usability session, nightly metadata audit script  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari) on mobile and desktop  
**Project Type**: web (static site)  
**Performance Goals**: First meaningful paint <=2s on standard broadband; Lighthouse Performance & Best Practices >=90; initial payload <=200 KB gzipped  
**Constraints**: Framework-free static delivery, NeoDB API as sole data authority, sensitive imagery blurred by default flags, responsive layouts validated at 300/360/768/1200/1800 px widths, evidence artifacts archived per constitution  
**Scale/Scope**: <100 podcasts, unauthenticated public traffic, curator-managed data updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Framework-Free Static Delivery**: Vanilla HTML/CSS/JS only; esbuild bundles to static `dist/` with no runtime frameworks or server dependencies.  
- **Responsive Layout Fidelity**: Mobile-first CSS validated at 300 px, <=360 px, 768 px, >=1200 px, and >=1800 px via automated screenshots and manual review.  
- **NeoDB Data Authority**: `src/scripts/api.js` fetches from `https://neodb.social/api/podcast/episode/{uuid}` using env-configured base/token; curator data limited to UUID list + flags.  
- **Accessible Modern Presentation**: WCAG 2.1 AA enforced with semantic markup, focus management, high-contrast theme tokens, axe-core audits, and documented usability evidence.  
- **Performance Budget Discipline**: Payload budgeting enforced through esbuild reports, image optimization pipeline, lazy loading, Lighthouse CI (mobile + desktop) targeting >=90 performance/best practices, plus audit artifacts.

**Gate Status**: PASS — plan covers every constitutional requirement with explicit validation steps.

## Project Structure

```
src/
├── index.html
├── styles/
│   ├── theme.css
│   └── gallery.css
├── scripts/
│   ├── api.js
│   ├── gallery.js
│   ├── ui-state.js
│   ├── cache.js
│   └── audit-metadata.js
├── assets/
│   └── placeholder-cover.svg
└── data/
    └── podcasts.json        # curated list with sensitive flags

dist/                        # static build output
docs/
├── evidence/
│   ├── US1/
│   ├── US2/
│   └── US3/
└── maintenance/
    ├── podcast-refresh.md
    └── metadata-audit.md
```

**Structure Decision**: Single static web project with curated data/config inside `src/data/`, build artifacts in `dist/`, and evidence/maintenance docs under `docs/` per governance expectations.

## Complexity Tracking

No deviations from constitution; section not required.

## Phase 0: Research Agenda

1. **NeoDB Contract & Rate Limits**  
   - Confirm response schema for `/podcast/episode/{uuid}` (fields, error shapes, rate limits).  
   - Verify authentication/token handling for potential private entries.

2. **Tooling & Automation Choices**  
   - Evaluate esbuild configuration patterns for static HTML projects.  
   - Review Sharp/imagemin strategies to maintain <200 KB payload.  
   - Validate Lighthouse CI + axe-core CLI integration patterns for static builds.

3. **Usability & Monitoring Approaches**  
   - Identify lean moderated testing format (participant recruitment, script, timing capture).  
   - Determine lightweight method for nightly metadata audit (cron-friendly script, logging format).

**Deliverable**: `/specs/001-i-want-to/research.md` capturing decisions, rationales, and rejected alternatives. Any unresolved items must be cleared before Phase 1.

## Phase 1: Design & Documentation Plan

1. **Data Modeling** (`/specs/001-i-want-to/data-model.md`)  
   - Document entities (`Podcast`, `PodcastCollection`, `GalleryUIState`, `StatusMessage`) including new `sensitive` flag and caching metadata.  
   - Define validation rules (sanitization, required fields, blur handling).

2. **Contracts** (`/specs/001-i-want-to/contracts/neodb-podcast-episode.openapi.yaml`)  
   - Capture NeoDB endpoint contract, authentication headers, error payloads, rate-limit semantics.

3. **Quickstart Guide** (`/specs/001-i-want-to/quickstart.md`)  
   - Environment setup (`.env`, `PODCAST_UUIDS` with `sensitive` flags).  
   - Commands: `npm run prepare:images`, `npm run build`, `npm run test:accessibility`, `npm run test:lighthouse`, `npm run test:responsive`, `npm run usability`, `npm run audit:metadata`, `npm run preview`.  
   - Evidence checklist for each core principle.

4. **Agent Context Update**  
   - Run `.specify/scripts/bash/update-agent-context.sh codex` after design docs to sync stack/tooling.

**Exit Criteria**: Constitution check re-run with concrete doc links and zero open clarifications.

## Phase 2: Implementation Preparation (Preview)

- Summarize key implementation concerns for `/speckit.tasks`: HTML structure, gallery rendering, accessibility, responsive styling, caching & refresh, sensitive imagery, usability test orchestration, metadata auditing, evidence archival.  
- Identify artefacts to attach in PRs: audit reports, screenshots, usability summary, metadata logs.

## Risks & Mitigations

- **NeoDB Downtime or Rate Limits**: Retry-once with backoff, status messaging, and cache fallback.  
- **Image Payload Overages**: Automated conversion to WebP/AVIF, lint failing builds exceeding budget.  
- **Accessibility Regression**: Continuous axe-core checks, manual keyboard review.  
- **Sensitive Imagery Exposure**: Curator `sensitive` flag enforcement with default blur + warning badge.  
- **Audit Fatigue**: Document automation for usability scheduling (calendar reminder) and nightly metadata log rotation.

## Constitution Re-Check (Post-Design)

After Phase 1 artifacts and agent context update, reconfirm each constitutional gate with actual references (responsive evidence plan, audit scripts, accessibility tooling, static build output). Plan proceeds to `/speckit.tasks` only when all gates remain PASS.
