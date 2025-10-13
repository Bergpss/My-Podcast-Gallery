# Podcast Refresh Runbook

Use this playbook when updating the curated gallery or adjusting sensitive cover controls.

## 1. Update the Curated List
- Edit `src/data/podcasts.json` to add, remove, or reorder entries.
- Include the `notes` field to track maintenance reminders and set `"sensitive": true` whenever the cover should remain blurred by default.
- Keep the array order in sync with the desired card rendering order.

## 2. Sync Environment Variables
- Update `PODCAST_UUIDS` in `.env` to match the curated order (comma-separated UUIDs).
- Commit `.env.example` updates if new configuration keys are introduced.
- Share refreshed `.env` values with collaborators through the secure secrets channel.

## 3. Validate the Gallery
```bash
npm run build
npm run test:accessibility
npm run test:lighthouse
npm run test:responsive
```
- Confirm the status banner reports “Gallery ready” without warnings.
- Spot-check at least one sensitive card to ensure the blur overlay and “Reveal cover” control behave as expected.

## 4. Capture Evidence
- Run `npm run audit:metadata` to log the latest NeoDB sync into `docs/evidence/metadata/`.
- Update `docs/evidence/US1/` with new screenshots or notes whenever the curated list changes.

## 5. Deployment Checklist
- Publish the updated `dist/` folder through the static host.
- Verify production uses the fresh `.env` values and that sensitive covers remain protected.
- Schedule the next manual review (recommended monthly) and log reminders in your calendar.
