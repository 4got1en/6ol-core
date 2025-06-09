#!/usr/bin/env node
/**
 * Pure-Node manifest generator: scans each content folder for .html,
 * pulls out <h1> and <small> (if present) via regex, and writes
 * manifest.json in each folder. No external deps required.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const folders = [
  'scrolls',
  'rituals',
  'journals',
  'onthecomeup',
  'finance',
  'legal',
  'navarre'
];

function extract(tag, html) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

for (const folder of folders) {
  const dir = join(process.cwd(), folder);
  let files;
  try {
    files = readdirSync(dir).filter(f => extname(f) === '.html');
  } catch {
    console.warn(`⚠️  Folder "${folder}" not found — skipping.`);
    continue;
  }

  const manifest = files.sort().map(filename => {
    const html = readFileSync(join(dir, filename), 'utf-8');
    const h1    = extract('h1', html) || filename.replace('.html','');
    const small = extract('small', html);
    return folder === 'journals'
      ? { filename, date: h1, summary: small }
      : { filename, title: h1, summary: small };
  });

  writeFileSync(
    join(dir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  console.log(`✅ ${folder}/manifest.json (${manifest.length} items)`);
}