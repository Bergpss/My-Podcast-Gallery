# Data Model — Personal Podcast Gallery

## Entities

### Podcast
- **Source**: NeoDB episode endpoint (`/podcast/episode/{uuid}`)
- **Fields**:
  - `uuid` (string, required): Stable identifier supplied by curator list.
  - `title` (string, required): Display name from NeoDB.
  - `description` (string, required): Short synopsis; trimmed to 200 characters for card view with “Read more” option.
  - `cover_image_url` (string, required): Preferred high-resolution image URL; may be transformed into optimized WebP/AVIF asset.
  - `official_site` (string, optional): External URL for visiting podcast source.
  - `tags` (array<string>, optional): Genres or categories for future filtering.
  - `last_synced_at` (datetime, derived): Timestamp of most recent successful fetch, used for cache validation.
  - `sensitive` (boolean, default `false`): Curator-managed flag stored in `src/data/podcasts.json` indicating cover art must be blurred with warning badge.
- **Validation Rules**:
  - Reject podcasts missing both `title` and `cover_image_url`; surface to curator via error log.
  - Sanitize `description` to prevent embedded HTML/unsafe content.
  - Normalize `official_site` to https URLs; open in new tab with rel safeguards.
  - Ensure `sensitive` defaults to `false` when unspecified and triggers CSS blur/warning overlay when true.

### PodcastCollection
- **Fields**:
  - `podcast_ids` (array<string>, required): Ordered list of UUIDs curated by site owner.
  - `display_order` (enum: `curated`, `alphabetical`, `recently_updated`; default `curated`): Determines rendering order.
  - `updated_at` (datetime): Last time the collection list changed; triggers cache bust if newer than stored data.
- **Relationships**:
  - One `PodcastCollection` references many `Podcast` entities.
  - Collection can be swapped (e.g., seasonal lists) without changing gallery logic.

### GalleryUIState
- **Fields**:
  - `status` (enum: `loading`, `ready`, `empty`, `error`): Drives visual state.
  - `message` (string, optional): Human-readable feedback for empty/error states.
  - `visible_podcast_ids` (array<string>): Podcast IDs currently rendered after filters/search (future enhancement ready).
  - `breakpoint` (enum: `mobile`, `tablet`, `desktop`): Derived from viewport width for responsive layout decisions.
- **Transitions**:
  - `loading` -> `ready` when all podcasts fetched successfully.
  - `loading` -> `error` if fetch retries fail; message set to guidance.
  - `ready` -> `empty` when curated list has zero valid podcasts.

### StatusMessage
- **Fields**:
  - `type` (enum: `info`, `warning`, `error`): Controls styling.
  - `title` (string): Short headline (e.g., “NeoDB Slow Right Now”).
  - `body` (string): Detailed explanation, limited to 160 characters.
  - `cta_label` (string, optional): Action text such as “Retry”.
  - `cta_action` (enum: `retry_fetch`, `contact_owner`, `none`): Behavior triggered on interaction.
- **Usage**: Populates alert component during `loading`, `empty`, or `error` states without collapsing layout.

## Derived Data & Helpers
- `OptimizedCover`: Produces responsive `srcset` array based on `cover_image_url`, generating small/medium/large variants.
- `PodcastExcerpt`: Returns first 160 characters of `description` plus ellipsis if truncated.
- `CacheKey(uuid)`: Standardizes key names for `localStorage` caching (`podcast:{uuid}`).
- `SensitiveCoverStyle`: Returns CSS class tokens applied when `sensitive` is true (blur overlay + warning badge).
- `MetadataAuditEntry`: Structured log object `{ uuid, fetched_at, success, delta_detected }` emitted by `audit-metadata.js`.

## Data Flow Overview
1. Load curated UUID array (with `sensitive` flags) from `src/data/podcasts.json` maintained by the owner.
2. For each UUID, fetch Podcast data from NeoDB via API module; hydrate `Podcast` entity with validation/sanitization.
3. Aggregate into `PodcastCollection`; update `GalleryUIState` to `ready` if at least one podcast passes validation.
4. Persist serialized `Podcast` entries and `last_synced_at` in `localStorage` for session reuse; expire when `updated_at` changes or on manual refresh.
