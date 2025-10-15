import { fetchPodcasts } from './api.js';
import {
  createLoadingState,
  createReadyState,
  createEmptyState,
  createErrorState,
  selectStatusCopy,
  StatusType
} from './ui-state.js';

const PODCAST_ENV = (process.env.PODCAST_UUIDS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const PLACEHOLDER_IMAGE = './assets/media/placeholder-cover.svg';

async function loadCuratedList() {
  try {
    const response = await fetch('./data/podcasts.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load curated list (${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Curated data must be an array.');
    }
    return data;
  } catch (error) {
    console.error('Unable to load curated list:', error);
    return [];
  }
}

function deriveCurationOrder(curatedData) {
  if (PODCAST_ENV.length > 0) {
    return PODCAST_ENV.map((uuid) => {
      const match = curatedData.find((item) => item.uuid === uuid);
      return match ? match : { uuid, sensitive: false };
    });
  }
  return curatedData;
}

function truncateDescription(description, limit = 120) {
  const fallback = 'No description provided.';
  if (!description) {
    return { displayText: fallback, fullText: fallback, isTruncated: false };
  }

  const normalized = String(description).replace(/<[^>]*>/g, '').trim();
  if (!normalized) {
    return { displayText: fallback, fullText: fallback, isTruncated: false };
  }

  if (normalized.length <= limit) {
    return { displayText: normalized, fullText: normalized, isTruncated: false };
  }

  const displayText = `${normalized.slice(0, limit).trim()}…`;
  return { displayText, fullText: normalized, isTruncated: true };
}

function createCardElement(template, podcast, metadata) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.podcast-card');
  card.dataset.uuid = podcast.uuid;
  card.dataset.sensitive = String(Boolean(podcast.sensitive));
  card.dataset.sensitiveVisible = podcast.sensitive ? 'false' : 'true';

  const coverUrl = metadata.cover_image_url ?? metadata.cover ?? metadata.image ?? PLACEHOLDER_IMAGE;
  const image = fragment.querySelector('.podcast-card__image');
  image.src = coverUrl;
  image.alt = metadata.title ? `${metadata.title} cover art` : 'Podcast cover art';
  image.decoding = 'async';

  const title = fragment.querySelector('.podcast-card__title');
  title.textContent = metadata.title ?? 'Untitled podcast';

  const description = fragment.querySelector('.podcast-card__description');
  const descriptionContent = truncateDescription(metadata.description);

  const descriptionText = document.createElement('span');
  descriptionText.className = 'podcast-card__description-text';
  description.replaceChildren(descriptionText);

  if (descriptionContent.isTruncated) {
    const descriptionId = `description-${podcast.uuid}`;
    description.dataset.expanded = 'false';
    descriptionText.id = descriptionId;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'podcast-card__description-toggle';
    toggle.setAttribute('aria-controls', descriptionId);

    const setExpandedState = (expanded) => {
      description.dataset.expanded = expanded ? 'true' : 'false';
      descriptionText.textContent = expanded ? descriptionContent.fullText : descriptionContent.displayText;
      toggle.textContent = expanded ? '收起' : '展开';
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    toggle.addEventListener('click', () => {
      const isExpanded = description.dataset.expanded === 'true';
      setExpandedState(!isExpanded);
    });

    setExpandedState(false);

    description.appendChild(toggle);
  } else {
    descriptionText.textContent = descriptionContent.fullText;
    description.removeAttribute('data-expanded');
  }

  const notesContainer = fragment.querySelector('.podcast-card__notes');
  const notesText = notesContainer?.querySelector('.podcast-card__notes-text');
  const rawNotes = typeof podcast.notes === 'string' ? podcast.notes.trim() : '';

  if (notesContainer && notesText) {
    if (rawNotes) {
      const sanitizedNotes = rawNotes.replace(/<[^>]*>/g, '').trim();
      if (sanitizedNotes) {
        notesText.textContent = sanitizedNotes;
        notesContainer.hidden = false;
      } else {
        notesContainer.remove();
      }
    } else {
      notesContainer.remove();
    }
  }

  const link = fragment.querySelector('[data-link]');
  const meta = fragment.querySelector('.podcast-card__meta');

  if (metadata.official_site) {
    link.href = metadata.official_site;
    link.textContent = 'Visit official site';
  } else if (coverUrl && coverUrl !== PLACEHOLDER_IMAGE) {
    link.href = coverUrl;
    link.textContent = 'View cover image';
  } else {
    link.remove();
  }

  if (!meta || meta.children.length === 0) {
    meta?.remove();
  }

  const revealButton = fragment.querySelector('[data-reveal-button]');
  if (podcast.sensitive) {
    revealButton.addEventListener('click', () => {
      const isVisible = card.dataset.sensitiveVisible === 'true';
      card.dataset.sensitiveVisible = isVisible ? 'false' : 'true';
      revealButton.setAttribute('aria-pressed', String(!isVisible));
      revealButton.textContent = isVisible ? 'Reveal cover' : 'Hide cover';
    });
    revealButton.setAttribute('aria-pressed', 'false');
    revealButton.setAttribute('aria-controls', `cover-${podcast.uuid}`);
    image.id = `cover-${podcast.uuid}`;
  } else {
    revealButton.remove();
  }

  return fragment;
}

function updateStatus(messageElement, state) {
  const copy = selectStatusCopy(state);
  if (!messageElement) return;
  messageElement.textContent = '';
  if (copy.title) {
    const strong = document.createElement('strong');
    strong.textContent = copy.title;
    messageElement.append(strong);
    if (copy.body) {
      messageElement.append(' ', copy.body);
    }
  } else if (copy.body) {
    messageElement.textContent = copy.body;
  }
  if (copy.type) {
    messageElement.dataset.statusType = copy.type;
  }
}

function renderGallery(galleryElement, template, podcasts, metadataMap) {
  galleryElement.innerHTML = '';
  for (const item of podcasts) {
    const metadata = metadataMap.get(item.uuid);
    if (!metadata) continue;
    const card = createCardElement(template, item, metadata);
    galleryElement.appendChild(card);
  }
}

function coalesceMetadata(results) {
  const successful = [];
  const metadataMap = new Map();
  const failures = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      metadataMap.set(result.uuid, result.data);
      successful.push({ uuid: result.uuid, data: result.data });
    } else {
      failures.push(result.error);
      console.error(`Failed to load podcast ${result.uuid}:`, result.error);
    }
  }

  return { successful, metadataMap, failures };
}

function applyYear() {
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

async function bootstrapGallery() {
  const galleryElement = document.getElementById('gallery');
  const statusMessageEl = document.querySelector('[data-status-message]');
  const template = document.getElementById('podcast-card-template');

  if (!galleryElement || !statusMessageEl || !template) {
    console.error('Gallery DOM structure missing required elements.');
    return;
  }

  let state = createLoadingState();
  updateStatus(statusMessageEl, state);

  const curatedData = await loadCuratedList();
  const curatedList = deriveCurationOrder(curatedData);

  if (!curatedList || curatedList.length === 0) {
    state = createEmptyState();
    updateStatus(statusMessageEl, state);
    galleryElement.innerHTML = '';
    return;
  }

  try {
    const results = await fetchPodcasts(curatedList.map((item) => item.uuid));
    const { successful, metadataMap, failures } = coalesceMetadata(results);

    if (successful.length === 0) {
      state = createErrorState(failures[0] ?? new Error('No podcasts loaded.'));
      updateStatus(statusMessageEl, state);
      galleryElement.innerHTML = '';
      return;
    }

    renderGallery(galleryElement, template, curatedList, metadataMap);

    state = createReadyState(successful);
    if (failures.length > 0) {
      state = {
        ...state,
        message: {
          type: StatusType.WARNING,
          title: 'Loaded with warnings',
          body: `${successful.length} podcast${successful.length === 1 ? '' : 's'} loaded. ${failures.length} failed—see console for details.`
        }
      };
    }
    updateStatus(statusMessageEl, state);
  } catch (error) {
    state = createErrorState(error);
    updateStatus(statusMessageEl, state);
    galleryElement.innerHTML = '';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyYear();
    bootstrapGallery();
  });
} else {
  applyYear();
  bootstrapGallery();
}
