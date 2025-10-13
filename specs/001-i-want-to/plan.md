# Implementation Plan: Personal Podcast Gallery

**Branch**: `001-i-want-to` | **Date**: 2025-10-13 | **Spec**: [/Users/kangberg/Dev/My-Web/My-Podcast-Gallery/specs/001-i-want-to/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-i-want-to/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/scripts/bash/setup-plan.sh` for the execution workflow.

## Summary

Curate a personal podcast gallery that fetches metadata from NeoDB using a maintained UUID list, presenting cover art, titles, and descriptions in a modern, accessible, responsive layout delivered entirely via static HTML, CSS, and JavaScript while staying within performance budgets.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: none (vanilla stack mandated)  
**Storage**: N/A (static site with live NeoDB fetch)  
**Testing**: Accessibility audits (axe-core), Performance audits (Lighthouse CI), Visual regression (manual responsive screenshots)  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari) on mobile and desktop  
**Project Type**: web (static site)  
**Performance Goals**: First meaningful paint <=2s on standard broadband; Lighthouse Performance/Best Practices >=90  
**Constraints**: Initial payload <=200 KB gzipped; static hosting only; NeoDB rate limits respected  
**Scale/Scope**: Personal gallery (<100 podcasts) with unauthenticated public access

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Framework-Free Static Delivery**: Author everything in vanilla HTML/CSS/JS with optional build step (esbuild) that outputs static `/dist`; no runtime frameworks or server rendering.
- **Responsive Layout Fidelity**: Implement mobile-first CSS covering 300 px, <=360 px, 768 px, >=1200 px, and >=1800 px viewports, validated via manual responsive review and automated viewport snapshots.
- **NeoDB Data Authority**: Centralize fetch logic in `src/scripts/api.js`, pulling metadata from `https://neodb.social/api/podcast/episode/{uuid}` with UUID list stored in configuration; handle fail/empty states gracefully.
- **Accessible Modern Presentation**: Follow WCAG 2.1 AA with semantic landmarks, keyboard navigation, high-contrast theme tokens, and automated axe-core scans to detect regressions.
- **Performance Budget Discipline**: Enforce <200 KB gzipped budget via build reports, lazy-load images, prefer AVIF/WebP, and run Lighthouse CI targeting >=90 Performance/Best Practices before merge.

**Gate Status**: PASS — all constitutional requirements have documented coverage and measurement plans prior to research kickoff.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
src/
├── index.html
├── styles/
├── scripts/
├── assets/
└── data/               # optional: static fixtures or cached payloads

dist/                   # build output (static files only)
```

**Structure Decision**: Adhere to single static web project with source under `src/` and build output in `dist/`, matching constitution implementation standards.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Phase 0: Research Agenda

1. **NeoDB Integration Details**  
   - Confirm expected response schema for `GET https://neodb.social/api/podcast/episode/{uuid}` (fields, optional data, rate limits).  
   - Determine authentication requirements (headers, API tokens) and safe storage in static context (build-time var injection).

2. **Asset Pipeline & Performance Controls**  
   - Evaluate lightweight build tooling (esbuild vs. Vite static mode) for bundling/minification while keeping vanilla runtime.  
   - Identify image optimization workflow (manual pre-processing vs. automated compression) to meet 200 KB budget.

3. **Accessibility & Testing Tooling**  
   - Select automated accessibility audit approach (axe-core CLI integration) compatible with static dist.  
   - Define repeatable Lighthouse CI configuration for Performance/Best Practices >=90 checks.

**Deliverable**: `/specs/001-i-want-to/research.md` documenting decisions, rationale, and alternatives; update plan if any gate impact arises.

## Phase 1: Design & Documentation Plan

1. **Data Modeling**  
   - Translate NeoDB payload into internal entities (`Podcast`, `PodcastCollection`, `StatusMessage`) with validation rules in `/specs/001-i-want-to/data-model.md`.

2. **Contracts & API Expectations**  
   - Capture external dependency contract for NeoDB endpoint in `/specs/001-i-want-to/contracts/neodb-podcast-episode.openapi.yaml`, noting required headers and error payload structure.

3. **Interaction & State Design**  
   - Document UI states (loading, success, empty, error) and responsive behavior per breakpoint in data model/state diagrams.

4. **Quickstart Authoring**  
   - Produce `/specs/001-i-want-to/quickstart.md` with environment setup (UUID inventory, `.env.example`), build/test commands (`npm run build`, `npm run test:accessibility`, `npm run test:lighthouse`), and validation checklist.

5. **Agent Context Sync**  
   - Ensure `.specify/scripts/bash/update-agent-context.sh codex` reflects chosen tooling (already executed post-plan updates).

**Exit Criteria**: Constitution Check re-run post-design → PASS; all design artifacts ready for `/speckit.tasks`.

## Phase 2: Implementation Preparation (Preview)

- Outline coding tasks (deferred to `/speckit.tasks`) covering HTML scaffolding, CSS theme tokens, API module, caching/loading states, and evidence capture pipeline.
- Define moderated usability testing playbook: recruit three participants, prepare 5-second recognition script, and list evidence artifacts for SC-001.
- Outline lightweight nightly metadata audit workflow (script or manual log) that records NeoDB sync timestamps for 30 consecutive days.
- Identify verification evidence to attach in PRs (responsive screenshots, Lighthouse report JSON, axe audit log).

## Risks & Mitigations

- **NeoDB Rate Limits or Downtime**: Implement polite request pacing and cache results in `localStorage`; provide clear offline messaging.  
- **Image Weight Overages**: Pre-process cover art via build step or request lower-resolution variants if available; enforce lint step to flag large assets.  
- **Accessibility Regression**: Integrate axe-core into CI and maintain manual checklist for keyboard navigation, focus order, and color contrast.
- **Sensitive Imagery Exposure**: Provide curator-managed flagging with default blur overlay and warning badge to prevent unexpected display of sensitive cover art.

## Constitution Re-Check (Post-Design)

Upon completing Phase 1 artifacts (data model, contracts, quickstart) and updating agent context, re-evaluate each gate with actual documentation links. Success criterion: all evidence recorded in repository so `/speckit.tasks` can proceed without additional clarifications. Current status: **Scheduled**.
