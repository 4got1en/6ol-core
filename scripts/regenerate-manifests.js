#!/usr/bin/env node
/**
 * Scans each content folder and writes a manifest.json listing
 * all `.html` files in sorted order, extracting <h1> as title
 * and <small> summary if present.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { JSDOM } from 'jsdom';

const folders = [
  'scrolls',
  'rituals',
  'journals',
  'onthecomeup',
  'finance',
  'legal',
  'navarre'
];

for (const folder of folders) {
  const dir = join(process.cwd(), folder);
  let files;
  try {
    files = readdirSync(dir).filter(f => extname(f) === '.html');
  } catch {
    console.warn(`⚠️  Folder "${folder}" not found, skipping.`);
    continue;
  }

  const manifest = files.sort().map(filename => {
    const full = join(dir, filename);
    const html = readFileSync(full, 'utf-8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const h1 = doc.querySelector('h1')?.textContent?.trim() || filename.replace('.html','');
    const small = doc.querySelector('small')?.textContent?.trim() || '';
    // for journals, use date instead of title
    return folder === 'journals'
      ? { filename, date: h1, summary: small }
      : { filename, title: h1, summary: small };
  });

  const outPath = join(dir, 'manifest.json');
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated ${folder}/manifest.json with ${manifest.length} entries`);
}