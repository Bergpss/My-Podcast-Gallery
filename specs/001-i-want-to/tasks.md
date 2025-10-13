---
description: "Task list for Personal Podcast Gallery implementation"
---

# Tasks: Personal Podcast Gallery

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Accessibility (axe-core), performance (Lighthouse CI), and responsive screenshot checks are required where noted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Static site assets live under `src/` (e.g., `src/index.html`, `src/styles/`, `src/scripts/`, `src/assets/`)
- Build artifacts output to `dist/` via `npm run build` (or equivalent) and MUST remain static

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [SETUP] Initialize npm workspace with static-site tooling (`package.json`, npm scripts) at repo root; add dev dependencies `esbuild`, `lighthouse`, `axe-core`, `serve`.
- [ ] T002 [SETUP] Scaffold source tree (`src/index.html`, `src/styles/`, `src/scripts/`, `src/assets/`, `src/data/`) and create placeholder files.
- [ ] T003 [SETUP] Add `.env.example` with `NEODB_API_BASE`, `NEODB_API_TOKEN`, `PODCAST_UUIDS`; update `.gitignore` for `.env`.
- [ ] T004 [P] [SETUP] Create `src/data/podcasts.json` containing curated UUID list template and documentation comments for maintenance.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [FOUND] Configure `scripts/build.js` (or equivalent) to bundle `src` via esbuild into `dist/`; wire npm scripts `build`, `preview`.
- [ ] T006 [P] [FOUND] Implement image optimization pipeline (`scripts/prepare-images.js`) using Sharp/imagemin and register `npm run prepare:images`.
- [ ] T007 [P] [FOUND] Add quality automation: `npm run test:accessibility` (axe-core CLI), `npm run test:lighthouse` (Lighthouse CI config), `npm run test:responsive` (Puppeteer screenshots).
- [ ] T008 [FOUND] Implement `src/scripts/api.js` with fetch wrapper (timeout, retry-once, error normalization) consuming env-configured base URL/token.
- [ ] T009 [FOUND] Establish design tokens in `src/styles/theme.css` (color palette, typography scale, spacing, focus styles).
- [ ] T010 [FOUND] Document build and quality commands in `quickstart.md`, ensuring prerequisites align with constitution mandates.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse my podcast gallery (Priority: P1) 🎯 MVP

**Goal**: Visitors immediately see curated podcasts with cover art, title, description, and action.

**Independent Test**: Load gallery with curated UUIDs; verify every card renders required fields with live NeoDB data or resilient error messaging.

### Tests for User Story 1 ⚠️

- [ ] T011 [US1] Run `npm run build` BEFORE implementation to observe expected failures/missing content and confirm tooling hooks are wired.
- [ ] T012 [US1] Execute `npm run test:accessibility` pre-implementation to capture failing baseline screenshots/logs.
- [ ] T013 [US1] Execute `npm run test:lighthouse` (mobile + desktop) pre-implementation to establish baseline metrics and identify gaps.

### Implementation for User Story 1

- [ ] T014 [US1] Author semantic layout in `src/index.html` (header, main gallery section, status region, footer) with placeholders for cards and status messages.
- [ ] T015 [P] [US1] Implement mobile-first gallery styles in `src/styles/gallery.css` leveraging theme tokens and ensuring card visuals align with modern aesthetic.
- [ ] T016 [P] [US1] Create `src/scripts/gallery.js` to hydrate podcasts: ingest `PODCAST_UUIDS`, request metadata via `api.js`, map to Podcast entity, and render cards.
- [ ] T017 [P] [US1] Implement `src/scripts/ui-state.js` to manage `GalleryUIState` (loading, ready, error, empty) and integrate with status message component.
- [ ] T018 [US1] Add accessible behaviors: alt text, keyboard focus order, skip link, external link semantics in `src/index.html` and `src/scripts/gallery.js`.
- [ ] T019 [US1] Provide default assets (e.g., `src/assets/placeholder-cover.svg`) and update rendering logic for missing covers/descriptions.
- [ ] T020 [US1] Re-run `npm run build` confirming gallery renders successfully with implemented components.
- [ ] T021 [US1] Re-run `npm run test:accessibility` ensuring axe-core passes with zero critical issues; archive report.
- [ ] T022 [US1] Re-run `npm run test:lighthouse` confirming scores >=90 for Performance/Best Practices; store artifacts.
- [ ] T023 [US1] Update documentation (`docs/evidence/US1/notes.md`) confirming acceptance scenarios and linking to reports.
- [ ] T024 [US1] Run moderated usability session with three representative listeners to validate the 5-second recognition metric; capture recordings and raw notes.
- [ ] T025 [US1] Summarize usability findings and archive evidence in `docs/evidence/US1/usability.md`, highlighting outcomes against SC-001.

**Checkpoint**: User Story 1 functional, accessible, and performance-audited independently

---

## Phase 4: User Story 2 - Enjoy the gallery on any device (Priority: P2)

**Goal**: Gallery feels polished on phone, tablet, and desktop with responsive layouts.

**Independent Test**: Verify designs at <=360 px, 768 px, >=1200 px widths with consistent legibility and interaction affordances.

### Tests for User Story 2 ⚠️

- [ ] T026 [US2] Run `npm run test:responsive` to capture mobile/tablet/desktop viewport screenshots; store in `docs/evidence/US2/`.
- [ ] T027 [US2] Validate manual checklist for touch/keyboard interactions across breakpoints; record findings in `docs/evidence/US2/responsive-review.md`.
- [ ] T028 [P] [US2] Capture additional screenshots at 300 px and 1800 px widths to verify extreme viewport handling; archive in `docs/evidence/US2/extreme-breakpoints/`.

### Implementation for User Story 2

- [ ] T029 [US2] Extend `src/styles/theme.css` with responsive typography and spacing scales for breakpoint transitions.
- [ ] T030 [P] [US2] Enhance `src/styles/gallery.css` with grid/flex layouts supporting stacked mobile cards, two-column tablet, multi-column desktop.
- [ ] T031 [P] [US2] Update `src/index.html` (if needed) with viewport previews (e.g., data attributes) to support adaptive styling hooks.
- [ ] T032 [US2] Implement JavaScript hook (optional) in `src/scripts/ui-state.js` to track `breakpoint` enum and adjust visible podcast count or layout toggles.
- [ ] T033 [US2] Re-run `npm run test:lighthouse` focusing on mobile profile; ensure CSS changes keep performance >=90 and document in evidence file.

**Checkpoint**: User Story 2 delivers responsive gallery validated across required breakpoints

---

## Phase 5: User Story 3 - Keep podcast details accurate (Priority: P3)

**Goal**: Metadata stays current with NeoDB via caching, refresh controls, and graceful fallbacks.

**Independent Test**: Trigger sync cycle, confirm updates appear without redeploy, simulate API failures to ensure graceful recovery.

### Tests for User Story 3 ⚠️

- [ ] T034 [US3] Simulate NeoDB failure (mock) and capture screenshots/logs showing resilient messaging; store in `docs/evidence/US3/`.
- [ ] T035 [US3] Verify cache refresh by updating sample podcast metadata and documenting observed change within UI without redeploy.

### Implementation for User Story 3

- [ ] T036 [US3] Add caching module `src/scripts/cache.js` managing `localStorage` entries keyed by UUID with `last_synced_at` validation.
- [ ] T037 [P] [US3] Enhance `src/scripts/api.js` to leverage cache module, respect rate limits, and expose manual refresh hook.
- [ ] T038 [P] [US3] Implement refresh control UI (button) in `src/index.html` with handler in `src/scripts/gallery.js`, including aria-label and disabled states.
- [ ] T039 [US3] Expand status messaging system to surface specific errors (404, 429, 500) using templates in `src/scripts/ui-state.js`.
- [ ] T040 [US3] Document curator workflow for updating UUID list and interpreting error logs in `docs/maintenance/podcast-refresh.md`.
- [ ] T041 [US3] Implement `scripts/audit-metadata.js` to log nightly NeoDB sync status/timestamps and persist results for the 30-day freshness target.
- [ ] T042 [US3] Document rolling metadata audit process in `docs/maintenance/metadata-audit.md`, including a 7-day sample log template and scheduling guidance.

**Checkpoint**: User Story 3 ensures data freshness and resilient handling of NeoDB availability

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] Document final evidence bundle in `docs/evidence/summary.md` (accessibility, performance, responsive, resiliency).
- [ ] T044 [P] Perform code cleanup and ensure ESLint/stylelint (if configured) pass; remove unused assets.
- [ ] T045 [P] Final `npm run build` and smoke test served output via `npm run preview`; capture final approval notes.
- [ ] T046 Publish deployment guide snippet in `docs/deployment.md` outlining static host steps and environment variable expectations.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after User Story 1 ensures base markup/api ready
- **User Story 3 (P3)**: Depends on User Story 1 data rendering; runs parallel with US2 once API hooks exist

### Within Each User Story

- Automated accessibility/performance scripts MUST be prepared and observed failing before implementation work begins.
- Static markup updates in `src/index.html` precede styling changes in `src/styles/`.
- Styling updates precede JavaScript enhancements in `src/scripts/`.
- Responsive screenshots and audit evidence are captured before marking the story complete.

## Parallel Example: User Story 1

```bash
# Launch compliance checks for User Story 1 (if requested):
Task: "npm run test:accessibility -- dist/index.html"
Task: "npm run test:lighthouse -- dist/index.html"

# Parallel file updates for User Story 1:
Task: "Update gallery markup in src/index.html"
Task: "Refine gallery styling in src/styles/gallery.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run build, accessibility, performance audits for US1
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing where specified
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
