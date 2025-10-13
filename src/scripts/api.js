const DEFAULT_TIMEOUT = 5000;
const MAX_ATTEMPTS = 2;

const API_BASE = (process.env.NEODB_API_BASE ?? '').replace(/\/$/, '');
const API_TOKEN = process.env.NEODB_API_TOKEN ?? '';

export class ApiError extends Error {
  constructor(message, { status, detail, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.detail = detail ?? null;
    if (cause) {
      this.cause = cause;
    }
  }
}

if (!API_BASE) {
  console.warn('NEODB_API_BASE is not defined. API requests will fail until the environment is configured.');
}

function buildUrl(pathname, searchParams) {
  if (!API_BASE) {
    throw new ApiError('API base URL is not configured. Set NEODB_API_BASE in your environment.');
  }
  const url = new URL(pathname, API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`);
  if (searchParams && typeof searchParams === 'object') {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'undefined' || value === null) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url;
}

function createHeaders(additionalHeaders = {}) {
  const headers = new Headers({ Accept: 'application/json', ...additionalHeaders });
  if (API_TOKEN) {
    headers.set('Authorization', `Bearer ${API_TOKEN}`);
  }
  return headers;
}

function mergeSignals(primary, secondary) {
  if (!primary) return secondary;
  if (!secondary) return primary;
  const controller = new AbortController();
  const abort = () => controller.abort();
  primary.addEventListener('abort', abort);
  secondary.addEventListener('abort', abort);
  return controller.signal;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const signal = mergeSignals(options.signal, controller.signal);
  try {
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(timeout);
  }
}

function shouldRetry(response, attempt) {
  if (attempt >= MAX_ATTEMPTS - 1) {
    return false;
  }
  if (!response) {
    return true;
  }
  return response.status === 429 || response.status >= 500;
}

async function request(pathname, { method = 'GET', body, headers = {}, searchParams, timeout = DEFAULT_TIMEOUT, signal } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const url = buildUrl(pathname, searchParams);
      const response = await fetchWithTimeout(
        url,
        {
          method,
          body,
          headers: createHeaders(headers),
          signal
        },
        timeout
      );

      if (!response.ok) {
        if (shouldRetry(response, attempt)) {
          continue;
        }
        let detail = null;
        try {
          detail = await response.json();
        } catch {
          detail = await response.text();
        }
        throw new ApiError(`NeoDB request failed with status ${response.status}`, {
          status: response.status,
          detail
        });
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      lastError = error instanceof ApiError ? error : new ApiError(error.message, { cause: error });
      if (error.name === 'AbortError' && attempt < MAX_ATTEMPTS - 1) {
        continue;
      }
      if (shouldRetry(null, attempt)) {
        continue;
      }
      break;
    }
  }
  throw lastError ?? new ApiError('Unknown API error');
}

export async function fetchPodcast(uuid, options = {}) {
  if (!uuid) {
    throw new ApiError('UUID is required to fetch podcast metadata.');
  }
  return request(`podcast/episode/${encodeURIComponent(uuid)}`, { ...options, method: 'GET' });
}

export async function fetchPodcasts(uuids, options = {}) {
  return Promise.all(
    uuids.map(async (uuid) => {
      try {
        const data = await fetchPodcast(uuid, options);
        return { status: 'fulfilled', uuid, data };
      } catch (error) {
        return { status: 'rejected', uuid, error };
      }
    })
  );
}
