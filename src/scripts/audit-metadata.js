#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DATA_PATH = path.join(ROOT_DIR, 'src', 'data', 'podcasts.json');
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs', 'evidence', 'metadata');

dotenv.config();

const API_BASE = (process.env.NEODB_API_BASE ?? 'https://neodb.social/api').replace(/\/$/, '');
const API_TOKEN = process.env.NEODB_API_TOKEN;

function getEndpoint(uuid) {
  return `${API_BASE}/podcast/episode/${encodeURIComponent(uuid)}`;
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replaceAll(':', '-');
}

async function loadCuratedPodcasts() {
  const raw = await readFile(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('Expected src/data/podcasts.json to contain an array.');
  }
  return data;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function auditPodcast(podcast) {
  const endpoint = getEndpoint(podcast.uuid);
  const headers = { Accept: 'application/json' };
  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const result = {
    uuid: podcast.uuid,
    sensitive: Boolean(podcast.sensitive),
    fetchedAt: new Date().toISOString(),
    status: 'pending'
  };

  try {
    const response = await fetchWithTimeout(endpoint, { headers });
    result.status = response.ok ? 'success' : 'error';
    result.statusCode = response.status;

    if (response.ok) {
      const payload = await response.json();
      result.title = payload.title ?? null;
      result.updatedAt = payload.updated_at ?? null;
      result.deltaDetected = podcast.last_synced_at && payload.updated_at
        ? payload.updated_at !== podcast.last_synced_at
        : null;
    } else {
      result.error = await response.text();
    }
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
  }

  return result;
}

async function runAudit() {
  const podcasts = await loadCuratedPodcasts();
  if (podcasts.length === 0) {
    console.log('No podcasts configured; audit skipped.');
    return;
  }

  console.log(`Auditing ${podcasts.length} curated podcast${podcasts.length > 1 ? 's' : ''}…`);
  const results = [];
  for (const podcast of podcasts) {
    const outcome = await auditPodcast(podcast);
    results.push(outcome);
    const statusIcon = outcome.status === 'success' ? '✓' : outcome.status === 'error' ? '⚠️' : '✗';
    console.log(`${statusIcon} ${podcast.uuid} → ${outcome.status.toUpperCase()}`);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const timestamp = formatTimestamp();
  const outPath = path.join(OUTPUT_DIR, `metadata-audit-${timestamp}.json`);
  await writeFile(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  console.log(`Audit results saved to ${path.relative(ROOT_DIR, outPath)}`);
}

runAudit().catch((error) => {
  console.error('Metadata audit failed:', error.message);
  process.exitCode = 1;
});
