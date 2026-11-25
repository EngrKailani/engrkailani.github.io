/* Validate continuous case-study navigation, local anchors, and sitemap coverage.
 * This script uses only local files and makes no network requests. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const domain = 'https://kailanialarcon.com';
const errors = [];
let assertions = 0;
function check(valid, description) {
  assertions++;
  if (!valid) errors.push(description);
}
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const archive = read('projects/index.html');
const slugs = [...archive.matchAll(/<a\s+class="featured-project-card"[^>]*\bhref="([a-z0-9-]+)\.html"/gi)]
  .map(match => match[1]);
check(slugs.length === 16 && new Set(slugs).size === 16,
  'Project directory must feature 16 unique case studies');
const pages = [
  'index.html', 'research.html', 'academic-cv.html', 'resume.html',
  'workbench.html', 'robotics-experiment.html', 'projects/index.html',
  ...slugs.map(slug => 'projects/' + slug + '.html')
];
for (let index = 0; index < slugs.length; index++) {
  const slug = slugs[index];
  const filename = 'projects/' + slug + '.html';
  const html = read(filename);
  const footer = html.match(/<nav class="detail-footer" aria-label="Project navigation">([\s\S]*?)<\/nav>/i);
  check(!!footer, filename + ': missing project navigation footer');
  if (!footer) continue;
  check(/class="case-archive-return"\s+href="index\.html"/.test(footer[1]),
    filename + ': missing project directory return link');
  const neighbors = [...footer[1].matchAll(/class="detail-home-link"\s+href="([a-z0-9-]+)\.html"/gi)]
    .map(match => match[1]);
  const previous = slugs[(index - 1 + slugs.length) % slugs.length];
  const next = slugs[(index + 1) % slugs.length];
  check(neighbors.length === 2,
    filename + ': expected exactly two neighboring case-study links');
  check(neighbors[0] === previous,
    filename + ': previous link should lead to ' + previous + '.html');
  check(neighbors[1] === next,
    filename + ': next link should lead to ' + next + '.html');
}
const expectedUrls = new Set(pages.map(file => file === 'index.html' ?
  domain + '/' : file === 'projects/index.html' ? domain + '/projects/' :
  domain + '/' + file));
const xml = read('sitemap.xml');
const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)];
const actualUrls = entries.map(match => match[1]);
check(entries.length === expectedUrls.size, 'Sitemap should contain all and only indexable portfolio pages');
check(new Set(actualUrls).size === entries.length, 'Sitemap contains duplicate URLs');
for (const url of expectedUrls) {
  check(actualUrls.includes(url), 'Sitemap is missing ' + url);
}
for (const entry of entries) {
  const [, url, date] = entry;
  check(expectedUrls.has(url), 'Sitemap contains unexpected URL ' + url);
  check(/^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)),
    'Sitemap has malformed lastmod date for ' + url);
}
for (const file of pages) {
  const html = read(file);
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
  for (const anchor of html.matchAll(/<a\b[^>]*\bhref=(["'])(#[^"']*)\1/gi)) {
    if (anchor[2] === '#') continue;
    let fragment = anchor[2].slice(1);
    try { fragment = decodeURIComponent(fragment); }
    catch { check(false, file + ': malformed fragment ' + fragment); continue; }
    check(ids.has(fragment), file + ': same-page anchor #' + fragment + ' does not exist');
  }
}
for (const error of errors) console.error('FAIL ' + error);
console.log((assertions - errors.length) + '/' + assertions + ' navigation, anchor, and sitemap checks passed');
if (errors.length) process.exitCode = 1;
