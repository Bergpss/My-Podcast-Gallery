#!/usr/bin/env node
import { access } from 'node:fs/promises';
import path from 'node:path';

const CANDIDATE_PATHS = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);

export async function resolveChromeExecutable() {
  for (const candidate of CANDIDATE_PATHS) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  throw new Error(
    [
      'Unable to locate a Chrome executable.',
      'Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH to a valid Chrome/Chromium binary.'
    ].join(' ')
  );
}

export function toFileUrl(filePath) {
  const absolute = path.resolve(filePath);
  const prefix = process.platform === 'win32' ? 'file:///' : 'file://';
  return `${prefix}${absolute.split(path.sep).join('/')}`;
}
