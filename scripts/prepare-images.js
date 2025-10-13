#!/usr/bin/env node
import { mkdir, rm, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const SRC_ASSETS_DIR = path.join(ROOT_DIR, 'src', 'assets');
const RAW_DIR = path.join(SRC_ASSETS_DIR, 'raw');
const OUTPUT_DIR = path.join(SRC_ASSETS_DIR, 'optimized');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const SUPPORTED_INPUTS = new Set(['.jpg', '.jpeg', '.png']);
const OUTPUT_SIZES = [320, 640, 960];
const FORMATS = ['webp', 'avif'];

async function directoryExists(dir) {
  try {
    const stats = await stat(dir);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImages(fullPath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_INPUTS.has(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function deriveOutputInfo(filePath) {
  const relative = path.relative(RAW_DIR, filePath);
  const ext = path.extname(relative);
  const name = relative.slice(0, -ext.length);
  return { relative, name };
}

async function optimizeOriginal(buffer, ext, destinationPath) {
  const plugins = [];
  if (ext === '.jpg' || ext === '.jpeg') {
    plugins.push(imageminMozjpeg({ quality: 82 }));
  } else if (ext === '.png') {
    plugins.push(imageminPngquant({ quality: [0.7, 0.85] }));
  }
  if (plugins.length === 0) {
    await writeFile(destinationPath, buffer);
    return buffer.length;
  }
  const [optimized] = await imagemin.buffer(buffer, { plugins });
  await writeFile(destinationPath, optimized);
  return optimized.length;
}

async function ensureDirForFile(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function processImage(filePath) {
  const { relative, name } = deriveOutputInfo(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const originalBuffer = await readFile(filePath);
  const manifestEntry = {
    source: path.join('raw', relative).split(path.sep).join('/'),
    variants: []
  };

  const originalOut = path.join(OUTPUT_DIR, `${name}${ext}`);
  await ensureDirForFile(originalOut);
  const bytes = await optimizeOriginal(originalBuffer, ext, originalOut);
  manifestEntry.variants.push({
    format: ext.replace('.', ''),
    path: path.relative(OUTPUT_DIR, originalOut).split(path.sep).join('/'),
    width: 'original',
    bytes
  });

  for (const size of OUTPUT_SIZES) {
    for (const format of FORMATS) {
      const outPath = path.join(OUTPUT_DIR, `${name}-${size}.${format}`);
      await ensureDirForFile(outPath);
      const pipeline = sharp(originalBuffer)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .toFormat(format, {
          quality: format === 'webp' ? 80 : 60,
          effort: format === 'avif' ? 4 : undefined,
          chromaSubsampling: '4:4:4'
        });
      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      await writeFile(outPath, data);
      manifestEntry.variants.push({
        format,
        path: path.relative(OUTPUT_DIR, outPath).split(path.sep).join('/'),
        width: info.width,
        bytes: data.length
      });
    }
  }

  return manifestEntry;
}

async function prepareImages() {
  const hasRaw = await directoryExists(RAW_DIR);
  if (!hasRaw) {
    console.log('No raw assets found in src/assets/raw — nothing to optimize.');
    return;
  }

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await collectImages(RAW_DIR);
  if (files.length === 0) {
    console.log('No supported image files found in src/assets/raw. Supported: JPG, PNG.');
    return;
  }

  console.log(`Optimizing ${files.length} image${files.length > 1 ? 's' : ''}…`);
  const manifest = [];
  for (const file of files) {
    const result = await processImage(file);
    manifest.push(result);
    console.log(`  ✔ ${result.source}`);
  }

  await writeFile(MANIFEST_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), images: manifest }, null, 2));
  console.log(`Image optimization complete. Outputs written to ${path.relative(ROOT_DIR, OUTPUT_DIR)}.`);
}

prepareImages().catch((error) => {
  console.error('Image preparation failed', error);
  process.exitCode = 1;
});
