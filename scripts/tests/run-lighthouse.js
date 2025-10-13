#!/usr/bin/env node
import http from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { resolveChromeExecutable } from '../utils/browser.js';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const REPORT_DIR = path.join(ROOT_DIR, 'docs', 'evidence', 'lighthouse');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2'
};

async function ensureDistExists() {
  try {
    const stats = await stat(path.join(DIST_DIR, 'index.html'));
    if (!stats.isFile()) {
      throw new Error('dist/index.html not found.');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('dist/index.html not found. Run `npm run build` before Lighthouse tests.');
    }
    throw error;
  }
}

function createStaticServer(root) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, 'http://localhost');
      let filePath = path.join(root, decodeURIComponent(requestUrl.pathname));
      let fileStats;
      try {
        fileStats = await stat(filePath);
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        throw err;
      }

      if (fileStats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream';
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(body);
    } catch (error) {
      res.writeHead(500);
      res.end(error.message);
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        port,
        close: () =>
          new Promise((closeResolve) => {
            server.close(() => closeResolve());
          })
      });
    });
  });
}

async function runLighthouse() {
  await ensureDistExists();
  await mkdir(REPORT_DIR, { recursive: true });

  const server = await createStaticServer(DIST_DIR);
  const baseUrl = `http://127.0.0.1:${server.port}/`;

  const chromePath = await resolveChromeExecutable();
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless=new', '--disable-gpu']
  });

  try {
    const modes = [
      { name: 'mobile', preset: 'mobile' },
      { name: 'desktop', preset: 'desktop' }
    ];

    for (const mode of modes) {
      const runnerResult = await lighthouse(baseUrl, {
        port: chrome.port,
        output: 'json',
        logLevel: 'silent',
        preset: mode.preset
      });

      const { lhr, report } = runnerResult;
      const performance = Math.round((lhr.categories.performance.score ?? 0) * 100);
      const accessibility = Math.round((lhr.categories.accessibility?.score ?? 0) * 100);
      const bestPractices = Math.round((lhr.categories['best-practices']?.score ?? 0) * 100);
      const seo = Math.round((lhr.categories.seo?.score ?? 0) * 100);

      console.log(
        `[${mode.name}] Performance: ${performance}, Accessibility: ${accessibility}, Best Practices: ${bestPractices}, SEO: ${seo}`
      );

      const reportPath = path.join(REPORT_DIR, `lighthouse-${mode.name}.json`);
      await writeFile(reportPath, report, 'utf8');
      console.log(`  Saved report: ${path.relative(ROOT_DIR, reportPath)}`);
    }
  } finally {
    await chrome.kill();
    await server.close();
  }

  console.log('Lighthouse audits complete ✓');
}

runLighthouse().catch((error) => {
  console.error('Lighthouse audit failed:', error.message);
  process.exitCode = 1;
});
