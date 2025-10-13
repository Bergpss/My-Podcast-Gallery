#!/usr/bin/env node
import { build } from 'esbuild';
import {
  mkdir,
  rm,
  readFile,
  writeFile,
  readdir,
  copyFile,
  stat
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const ENV_VARS = {
  NEODB_API_BASE: process.env.NEODB_API_BASE ?? '',
  NEODB_API_TOKEN: process.env.NEODB_API_TOKEN ?? '',
  PODCAST_UUIDS: process.env.PODCAST_UUIDS ?? ''
};

async function emptyDist() {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });
}

async function copyDirectory(source, destination) {
  try {
    const sourceStat = await stat(source);
    if (!sourceStat.isDirectory()) {
      return;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function writeHtml(entryMap) {
  const sourceHtmlPath = path.join(SRC_DIR, 'index.html');
  const distHtmlPath = path.join(DIST_DIR, 'index.html');
  let html = await readFile(sourceHtmlPath, 'utf8');

  const replacements = [
    {
      original: './styles/theme.css',
      entry: path.join(SRC_DIR, 'styles', 'theme.css')
    },
    {
      original: './styles/gallery.css',
      entry: path.join(SRC_DIR, 'styles', 'gallery.css')
    },
    {
      original: './scripts/gallery.js',
      entry: path.join(SRC_DIR, 'scripts', 'gallery.js')
    }
  ];

  for (const { original, entry } of replacements) {
    const hashed = entryMap.get(path.resolve(entry));
    if (!hashed) {
      continue;
    }
    html = html.replace(new RegExp(original, 'g'), hashed);
  }

  await writeFile(distHtmlPath, html, 'utf8');
}

async function runBuild() {
  await emptyDist();

  const assetsOutDir = path.join(DIST_DIR, 'assets');

  const buildResult = await build({
    entryPoints: [
      path.join(SRC_DIR, 'scripts', 'gallery.js'),
      path.join(SRC_DIR, 'styles', 'theme.css'),
      path.join(SRC_DIR, 'styles', 'gallery.css')
    ],
    outdir: assetsOutDir,
    bundle: true,
    metafile: true,
    format: 'esm',
    splitting: true,
    sourcemap: true,
    minify: true,
    target: ['es2020'],
    entryNames: '[dir]/[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'static/[name]-[hash]',
    define: {
      'process.env.NEODB_API_BASE': JSON.stringify(ENV_VARS.NEODB_API_BASE),
      'process.env.NEODB_API_TOKEN': JSON.stringify(ENV_VARS.NEODB_API_TOKEN),
      'process.env.PODCAST_UUIDS': JSON.stringify(ENV_VARS.PODCAST_UUIDS)
    },
    loader: {
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.webp': 'file',
      '.avif': 'file'
    },
    logLevel: 'info'
  });

  const entryMap = new Map();
  for (const [outputPath, info] of Object.entries(buildResult.metafile.outputs)) {
    if (!info.entryPoint) {
      continue;
    }
    const absoluteEntry = path.resolve(info.entryPoint);
    const absoluteOutput = path.resolve(ROOT_DIR, outputPath);
    const relativeToDist = path.relative(DIST_DIR, absoluteOutput);
    entryMap.set(absoluteEntry, `./${toPosix(relativeToDist)}`);
  }

  await writeHtml(entryMap);

  await copyDirectory(path.join(SRC_DIR, 'assets'), path.join(assetsOutDir, 'media'));
  await copyDirectory(path.join(SRC_DIR, 'data'), path.join(DIST_DIR, 'data'));

  console.log('Build complete ✓');
}

runBuild().catch((error) => {
  console.error('Build failed', error);
  process.exitCode = 1;
});
