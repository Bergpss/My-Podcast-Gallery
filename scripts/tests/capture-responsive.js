#!/usr/bin/env node
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { resolveChromeExecutable, toFileUrl } from '../utils/browser.js';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DIST_HTML = path.join(ROOT_DIR, 'dist', 'index.html');
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs', 'evidence', 'responsive');

const VIEWPORTS = [
  { name: '300w', width: 300, height: 640 },
  { name: '360w', width: 360, height: 740 },
  { name: '768w', width: 768, height: 1024 },
  { name: '1200w', width: 1200, height: 900 },
  { name: '1800w', width: 1800, height: 1080 }
];

async function ensureBuildExists() {
  try {
    const stats = await stat(DIST_HTML);
    if (!stats.isFile()) {
      throw new Error('dist/index.html not found.');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('dist/index.html not found. Run `npm run build` before capturing responsive screenshots.');
    }
    throw error;
  }
}

async function captureScreenshots() {
  await ensureBuildExists();
  await mkdir(OUTPUT_DIR, { recursive: true });

  const chromePath = await resolveChromeExecutable();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();
    const fileUrl = toFileUrl(DIST_HTML);

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    for (const viewport of VIEWPORTS) {
      await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
      await page.reload({ waitUntil: 'networkidle0' });
      const outPath = path.join(OUTPUT_DIR, `responsive-${viewport.name}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved screenshot: ${path.relative(ROOT_DIR, outPath)}`);
    }
  } finally {
    await browser.close();
  }

  console.log('Responsive screenshots captured ✓');
}

captureScreenshots().catch((error) => {
  console.error('Responsive screenshot capture failed:', error.message);
  process.exitCode = 1;
});
