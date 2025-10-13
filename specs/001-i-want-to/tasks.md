---
description: "Task list for Personal Podcast Gallery implementation"
---

# Tasks: Personal Podcast Gallery

**Input**: Design documents from `/specs/001-i-want-to/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Accessibility (axe-core), performance (Lighthouse CI), responsive screenshots, moderated usability session, and nightly metadata audit logging are required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Static site assets live under `src/` (e.g., `src/index.html`, `src/styles/`, `src/scripts/`, `src/assets/`, `src/data/`)
- Build artifacts output to `dist/` via `npm run build`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [SETUP] Initialize npm workspace with static-site tooling (`package.json`, npm scripts) at repo root; install dev dependencies `esbuild`, `lighthouse`, `axe-core`, `puppeteer`, `sharp`.
- [X] T002 [SETUP] Scaffold source directories (`src/index.html`, `src/styles/`, `src/scripts/`, `src/assets/`, `src/data/`) and create placeholder files.
- [X] T003 [SETUP] Add `.env.example` documenting `NEODB_API_BASE`, `NEODB_API_TOKEN`, `PODCAST_UUIDS`; update `.gitignore` to exclude `.env`.
- [X] T004 [P] [SETUP] Seed `src/data/podcasts.json` with curated UUID examples including optional `"sensitive": true` flag and inline maintenance notes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [FOUND] Configure `scripts/build.js` (or equivalent) to bundle `src/` via esbuild into `dist/` with hashed assets and HTML entry point.
- [X] T006 [P] [FOUND] Implement image optimization pipeline (`scripts/prepare-images.js`) using Sharp/imagemin; add npm script `prepare:images`.
- [X] T007 [P] [FOUND] Wire quality automation scripts: `npm run test:accessibility`, `npm run test:lighthouse`, `npm run test:responsive`, `npm run usability`, `npm run audit:metadata`.
- [X] T008 [FOUND] Implement `src/scripts/api.js` with fetch wrapper (timeout, retry-once, error normalization) using env-configured base URL/token.
- [X] T009 [FOUND] Establish design tokens in `src/styles/theme.css` (colors, typography scale, spacing, focus styles, warning badge palette).
- [X] T010 [FOUND] Update `specs/001-i-want-to/quickstart.md` with setup commands, quality gates, and manual checklist.
- [X] T011 [FOUND] Create documentation skeleton (`docs/evidence/US1/`, `docs/evidence/US2/`, `docs/evidence/US3/`, `docs/maintenance/`) including README placeholders.

**Checkpoint**: Foundation ready – user story implementation can begin

---

## Phase 3: User Story 1 – Browse my podcast gallery (Priority: P1) 🎯

**Goal**: Visitors immediately see curated podcasts with cover art, title, description, action, and sensitive imagery protections.

**Independent Test**: Load gallery with curated UUIDs; verify each card renders required fields, sensitive covers blur with warning, and loading/error states remain stable.

### Tests for User Story 1 ⚠️

- [X] T012 [US1] Run `npm run build` BEFORE implementation to confirm static pipeline executes and highlights missing gallery output.
- [X] T013 [US1] Execute `npm run test:accessibility` before implementation to capture failing baseline logs.
- [X] T014 [US1] Execute `npm run test:lighthouse` (mobile + desktop) before implementation to capture baseline metrics.

### Implementation for User Story 1

- [X] T015 [US1] Author semantic layout in `src/index.html` (header, skip link, main gallery region, status area, footer).
- [X] T016 [P] [US1] Implement gallery styling in `src/styles/gallery.css` with mobile-first layout and focus-visible treatments.
- [X] T017 [P] [US1] Build `src/scripts/gallery.js` to hydrate podcasts from `PODCAST_UUIDS`, request metadata via `api.js`, and render cards.
- [X] T018 [P] [US1] Create `src/scripts/ui-state.js` managing `GalleryUIState` transitions (loading, ready, empty, error) and wiring status messages.
- [X] T019 [US1] Add accessibility behaviors (alt text, keyboard focus order, external link semantics, reduced-motion respect) across `index.html` and `gallery.js`.
- [X] T020 [US1] Implement sensitive cover handling: blur overlay, warning badge CSS, reveal control, using `sensitive` flags and `src/assets/placeholder-cover.svg`.
- [X] T021 [US1] Update `docs/maintenance/podcast-refresh.md` with instructions for managing `PODCAST_UUIDS` and `sensitive` flags.

### Verification for User Story 1

- [X] T022 [US1] Re-run `npm run build` verifying gallery renders with populated data and sensitive overlays.
- [X] T023 [US1] Re-run `npm run test:accessibility` ensuring zero critical issues; archive report in `docs/evidence/US1/`.
- [X] T024 [US1] Re-run `npm run test:lighthouse` confirming scores >=90 (Performance/Best Practices); store reports in `docs/evidence/US1/`.
- [X] T025 [US1] Execute `npm run usability` with three participants capturing 5-second recognition results (raw notes in `docs/evidence/US1/`).
- [X] T026 [US1] Summarize usability findings and acceptance evidence in `docs/evidence/US1/usability.md`.

**Checkpoint**: User Story 1 functional, accessible, and evidenced independently

---

## Phase 4: User Story 2 – Enjoy the gallery on any device (Priority: P2)

**Goal**: Gallery remains polished and readable across phone, tablet, desktop, and extreme viewport sizes.

**Independent Test**: Verify layouts at 300 px, <=360 px, 768 px, >=1200 px, >=1800 px with consistent legibility and interaction affordances.

### Tests for User Story 2 ⚠️

- [ ] T027 [US2] Run `npm run test:responsive` BEFORE adjustments to capture baseline failure output for comparison.
- [ ] T028 [US2] Prepare responsive review template `docs/evidence/US2/responsive-review.md` outlining checklist items per breakpoint.

### Implementation for User Story 2

- [ ] T029 [US2] Extend `src/styles/theme.css` with responsive typography, spacing scales, and breakpoint tokens (mobile/tablet/desktop/ultra).
- [ ] T030 [P] [US2] Enhance `src/styles/gallery.css` to support stacked mobile, two-column tablet, multi-column desktop, and ultra-wide layouts (300 & 1800 px support).
- [ ] T031 [P] [US2] Update `src/index.html` container structure/data attributes to facilitate responsive hooks and viewport previews.
- [ ] T032 [US2] Update `src/scripts/ui-state.js` to derive and expose current breakpoint enum (mobile/tablet/desktop/ultra) for future adaptive behaviors.

### Verification for User Story 2

- [ ] T033 [US2] Re-run `npm run test:responsive` capturing screenshots at 300, 360, 768, 1200, and 1800 px; store assets in `docs/evidence/US2/`.
- [ ] T034 [US2] Complete manual responsive checklist, documenting results in `docs/evidence/US2/responsive-review.md`.
- [ ] T035 [US2] Re-run `npm run test:lighthouse` (mobile focus) confirming performance >=90 despite responsive enhancements; archive reports in `docs/evidence/US2/`.

**Checkpoint**: User Story 2 validated across required breakpoints with documented evidence

---

## Phase 5: User Story 3 – Keep podcast details accurate (Priority: P3)

**Goal**: Metadata stays current via caching, manual refresh, nightly audit logging, and resilient error handling.

**Independent Test**: Trigger refresh cycle, confirm updated content without redeploy, simulate API failures, and capture nightly audit log demonstrating freshness compliance.

### Implementation for User Story 3

- [ ] T036 [US3] Create `src/scripts/cache.js` managing `localStorage` entries per UUID with `last_synced_at` validation and expiry logic.
- [ ] T037 [P] [US3] Enhance `src/scripts/api.js` to integrate cache layer, respect NeoDB rate limits, and expose manual refresh hooks.
- [ ] T038 [P] [US3] Implement refresh control UI (button) in `src/index.html` with handler in `src/scripts/gallery.js`, including aria-labels and disabled states during fetch.
- [ ] T039 [US3] Expand `src/scripts/ui-state.js` / status messaging to differentiate 404, 429, 500 errors with tailored guidance.
- [ ] T040 [US3] Implement `scripts/audit-metadata.js` logging nightly NeoDB fetch status (`MetadataAuditEntry`) to `docs/maintenance/logs/`.
- [ ] T041 [US3] Update `docs/maintenance/metadata-audit.md` with 7-day sample log template, scheduling guidance, and success criteria for SC-004.
- [ ] T042 [US3] Augment `docs/maintenance/podcast-refresh.md` with manual refresh workflow, cache reset steps, and troubleshooting guidance.

### Verification for User Story 3

- [ ] T043 [US3] Simulate NeoDB failure (e.g., mock 500) and capture screenshots/logs showing resilient messaging in `docs/evidence/US3/`.
- [ ] T044 [US3] Verify cache refresh by modifying sample metadata, reloading, and documenting change observation in `docs/evidence/US3/cache-refresh.md`.
- [ ] T045 [US3] Execute `npm run audit:metadata` capturing log output and verifying success within 24h window; archive sample in `docs/evidence/US3/metadata-audit.log`.

**Checkpoint**: User Story 3 ensures data freshness and resiliency with audit evidence

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T046 [P] Document final evidence bundle in `docs/evidence/summary.md` (accessibility, performance, responsive, usability, metadata).
- [ ] T047 [P] Perform code cleanup, run linting/formatting (stylelint/eslint if configured), and remove unused assets.
- [ ] T048 [P] Execute final `npm run build` and `npm run preview` smoke test; capture approval notes in `docs/evidence/summary.md`.
- [ ] T049 Publish deployment guide snippet in `docs/deployment.md` outlining static hosting steps, environment variables, and audit scheduling reminders.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – begin immediately.
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase; proceed sequentially (P1 -> P2 -> P3) or parallel if staffing allows once prerequisites satisfied.
- **Polish (Final Phase)**: Depends on completion of desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Requires foundational tooling and documentation – no other story dependency.
- **User Story 2 (P2)**: Builds on US1 markup and styling foundation.
- **User Story 3 (P3)**: Depends on US1 data rendering; can proceed in parallel with US2 after API and layout established.

### Within Each User Story

- Automated checks (`build`, `test:accessibility`, `test:lighthouse`, `test:responsive`, `usability`, `audit:metadata`) must be prepared and observed failing before implementation, then rerun for passing evidence.
- HTML updates precede CSS modifications; CSS updates precede JavaScript enhancements touching the same component.
- Evidence artifacts (reports, screenshots, logs, summaries) must be archived before closing the story.

---

## Parallel Example: User Story 1

```bash
# Parallel tasks once layout scaffolded
Task: "Implement gallery styling in src/styles/gallery.css"
Task: "Build src/scripts/gallery.js"
Task: "Create src/scripts/ui-state.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational  
3. Deliver Phase 3: User Story 1  
4. **STOP and VALIDATE**: Accessibility, performance, usability evidence recorded  
5. Deploy/demo MVP

### Incremental Delivery
1. Complete Setup + Foundational  
2. Add User Story 1 → Validate → Deploy/Demo  
3. Add User Story 2 → Validate → Deploy/Demo  
4. Add User Story 3 → Validate → Deploy/Demo  
5. Each increment remains independently testable and evidenced

### Parallel Team Strategy
1. Team completes Setup + Foundational together  
2. Parallel efforts after Phase 2:  
   - Developer A: User Story 1  
   - Developer B: User Story 2  
   - Developer C: User Story 3  
3. Polish phase consolidates shared improvements and deployment

---

## Notes

- [P] tasks operate on distinct files/directories and can proceed concurrently.
- Maintain constitution evidence requirements (screenshots, reports, logs) for every PR.
- Keep `src/data/podcasts.json` as the single curator-managed source for UUIDs and sensitive flags.
