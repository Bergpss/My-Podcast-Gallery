#!/usr/bin/env node
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DIST_HTML = path.join(ROOT_DIR, 'dist', 'index.html');
const AXE_SCRIPT = path.resolve(fileURLToPath(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url)));

async function ensureBuildExists() {
  try {
    await access(DIST_HTML);
  } catch {
    throw new Error('dist/index.html not found. Run `npm run build` before running accessibility tests.');
  }
}

async function runAxe() {
  await ensureBuildExists();
  const html = await readFile(DIST_HTML, 'utf8');
  const dom = new JSDOM(html, { pretendToBeVisual: true, runScripts: 'outside-only' });

  const { window } = dom;
  globalThis.window = window;
  globalThis.Node = window.Node;
  globalThis.NodeList = window.NodeList;
  globalThis.Document = window.Document;
  globalThis.document = window.document;
  globalThis.Element = window.Element;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.SVGElement = window.SVGElement;
  globalThis.HTMLSelectElement = window.HTMLSelectElement;
  globalThis.HTMLInputElement = window.HTMLInputElement;
  if (window.HTMLCanvasElement) {
    window.HTMLCanvasElement.prototype.getContext = () => null;
  }

  const axeSource = await readFile(AXE_SCRIPT, 'utf8');
  window.eval(axeSource);

  if (!window.axe) {
    throw new Error('Failed to initialize axe-core in the testing DOM environment.');
  }

  const results = await window.axe.run(window.document);
  if (results.violations.length === 0) {
    console.log('Accessibility audit passed ✓ (no violations found).');
    return;
  }

  console.error(`Accessibility audit found ${results.violations.length} violation(s):`);
  for (const violation of results.violations) {
    console.error(`- ${violation.id}: ${violation.help}`);
    for (const node of violation.nodes) {
      console.error(`    • Target: ${node.target.join(', ')}`);
      if (node.failureSummary) {
        console.error(`      ${node.failureSummary}`);
      }
    }
  }
  process.exitCode = 1;
}

runAxe().catch((error) => {
  console.error('Axe accessibility audit failed:', error.message);
  process.exitCode = 1;
});
