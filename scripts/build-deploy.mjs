#!/usr/bin/env node
// Arma la versión lista para publicar:
//   dist/assets/     -> se sube a Cloudflare Pages (imágenes, video, cursor)
//   dist/bigcartel/  -> templates + CSS para pegar en Big Cartel (Shop designer > Code)
//
// Big Cartel no aloja archivos propios, así que cada {{ 'archivo' | theme_image_url }}
// se reemplaza por la URL de Cloudflare, con ?v=hash para que el caché se renueve
// solo cuando el archivo cambia.
//
// Uso: node scripts/build-deploy.mjs [https://tu-proyecto.pages.dev]

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'source');
const dist = join(root, 'dist');
const base = (process.argv[2] || process.env.ASSETS_BASE || 'https://liminal-bloom-assets.pages.dev').replace(/\/$/, '');

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'assets'), { recursive: true });
mkdirSync(join(dist, 'bigcartel'), { recursive: true });

const pattern = /\{\{\s*'([^']+)'\s*\|\s*theme_image_url\s*\}\}/g;
const used = new Map(); // archivo -> hash

function urlFor(file) {
  if (!used.has(file)) {
    const data = readFileSync(join(src, 'images', file)); // falla si falta el archivo
    used.set(file, createHash('md5').update(data).digest('hex').slice(0, 8));
    copyFileSync(join(src, 'images', file), join(dist, 'assets', file));
  }
  return `${base}/${file}?v=${used.get(file)}`;
}

const templates = readdirSync(src).filter((f) => f.endsWith('.html') || f.endsWith('.css'));
for (const name of templates) {
  const out = readFileSync(join(src, name), 'utf8').replace(pattern, (_, file) => urlFor(file));
  if (pattern.test(out)) throw new Error(`Quedó un theme_image_url sin reemplazar en ${name}`);
  writeFileSync(join(dist, 'bigcartel', name), out);
}

// CORS: el video se descarga con fetch() desde la tienda (otro dominio).
// Caché larga: las URLs llevan ?v=hash, así que un archivo nuevo es una URL nueva.
writeFileSync(join(dist, 'assets', '_headers'), `/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
`);
writeFileSync(join(dist, 'assets', 'index.html'), '<!doctype html><title>Liminal Bloom assets</title>\n');

console.log(`Assets base: ${base}`);
console.log(`dist/assets/     ${used.size} archivos: ${[...used.keys()].join(', ')}`);
console.log(`dist/bigcartel/  ${templates.join(', ')}`);
