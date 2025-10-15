# Podcast Refresh Runbook

Use this playbook when updating the curated gallery or adjusting sensitive cover controls.

## 1. Update the Curated List
- Edit `src/data/podcasts.json` to add, remove, or reorder entries.
- Include the `notes` field to track maintenance reminders and set `"sensitive": true` whenever the cover should remain blurred by default.
- Keep the array order in sync with the desired card rendering order.

## 2. Validate the Gallery
```bash
npm run build
npm run test:accessibility
npm run test:lighthouse
npm run test:responsive
```
- Confirm the status banner reports “Gallery ready” without warnings.
- Spot-check at least one sensitive card to ensure the blur overlay and “Reveal cover” control behave as expected.

## 3. Capture Evidence
- Run `npm run audit:metadata` to log the latest NeoDB sync into `docs/evidence/metadata/`.
- Update `docs/evidence/US1/` with new screenshots or notes whenever the curated list changes.

## 4. Deployment Checklist
- Publish the updated `dist/` folder through the static host.
- Verify production uses the fresh `.env` values and that sensitive covers remain protected.
- Schedule the next manual review (recommended monthly) and log reminders in your calendar.
