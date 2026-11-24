/* Keep every local HTML CSS/JS reference in sync with its Git blob content hash.
   Usage: node scripts/sync-asset-versions.js --write
          node scripts/sync-asset-versions.js --check
   The published ?v= value is the first ten characters of the file's Git blob SHA.
   No dependencies, network requests, or downloaded assets are required. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const mode = process.argv[2] || '--check';
if (!['--check', '--write'].includes(mode)) {
  console.error('Usage: node scripts/sync-asset-versions.js [--check|--write]');
  process.exit(2);
}

const excluded = new Set(['.git', 'node_modules', 'quality-artifacts']);
function htmlPages(dir = root) {
  const pages = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory() && !excluded.has(entry.name)) {
      pages.push(...htmlPages(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      pages.push(path.join(dir, entry.name));
    }
  }
  return pages;
}

const versions = new Map();
function blobVersion(file) {
  if (versions.has(file)) return versions.get(file);
  const bytes = fs.readFileSync(file);
  const sha = crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes).digest('hex').slice(0, 10);
  versions.set(file, sha);
  return sha;
}

let refs = 0;
let changedPages = 0;
const stale = [];
const attribute = /(\b(?:src|href)\s*=\s*)(["'])([^"'<>]+)\2/gi;
for (const fullPage of htmlPages()) {
  const relativePage = path.relative(root, fullPage);
  const original = fs.readFileSync(fullPage, 'utf8');
  const revised = original.replace(attribute, (match, prefix, quote, raw) => {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(raw)) return match;
    const pieces = raw.match(/^([^?#]+)(?:\?([^#]*))?(#.*)?$/);
    if (!pieces || !/\.(?:css|js)$/i.test(pieces[1])) return match;
    let assetPath;
    try { assetPath = decodeURIComponent(pieces[1]); }
    catch { return match; }
    const target = path.resolve(path.dirname(fullPage), assetPath);
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target) ||
        !fs.statSync(target).isFile()) return match;
    const params = new URLSearchParams(pieces[2] || '');
    params.set('v', blobVersion(target));
    const current = pieces[1] + '?' + params.toString() + (pieces[3] || '');
    refs++;
    if (current !== raw) stale.push(relativePage + ': ' + raw + ' => ' + current);
    return prefix + quote + current + quote;
  });
  if (revised !== original) {
    changedPages++;
    if (mode === '--write') fs.writeFileSync(fullPage, revised, 'utf8');
  }
}
if (mode === '--check' && stale.length) {
  stale.forEach(line => console.error('STALE ' + line));
  console.error(stale.length + ' outdated asset link(s) across ' +
    changedPages + ' page(s). Run npm run sync:assets.');
  process.exitCode = 1;
} else {
  console.log('Verified ' + refs + ' CSS/JS references in ' + htmlPages().length +
    ' pages; ' + (mode === '--write' ? 'updated' : 'outdated') +
    ' page count: ' + changedPages + '.');
}
