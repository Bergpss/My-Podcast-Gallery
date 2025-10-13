export function getCachedPodcast(uuid) {
  const raw = window.localStorage.getItem(`podcast:${uuid}`);
  return raw ? JSON.parse(raw) : null;
}

export function setCachedPodcast(uuid, payload) {
  window.localStorage.setItem(`podcast:${uuid}`, JSON.stringify(payload));
}
