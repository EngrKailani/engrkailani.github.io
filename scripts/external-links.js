/* Public outbound-link inventory and optional health audit.
 * --inventory: local HTML scan only, safe in ordinary CI.
 * --check: check external endpoints, write a report, fail on confirmed 404/410.
 * Transient blocking/timeouts are marked unverified, never asserted broken. */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const excluded = new Set(['.git', 'node_modules', 'quality-artifacts']);
const ownHosts = new Set(['kailanialarcon.com', 'www.kailanialarcon.com']);

function htmlFiles(dir = root) {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory() && !excluded.has(entry.name)) {
      files.push(...htmlFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files.sort();
}
function extractUrls(html) {
  const links = [];
  // Only navigational anchors; fonts, canonical URLs and API metadata are not review links.
  for (const anchor of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const value = anchor[2].replace(/&amp;/g, '&').trim();
    if (!/^https?:\/\//i.test(value)) continue;
    try {
      const parsed = new URL(value);
      if (ownHosts.has(parsed.hostname.toLowerCase())) continue;
      parsed.hash = '';
      links.push(parsed.toString());
    } catch { /* Broken or unsafe URLs should be addressed by the static site check. */ }
  }
  return links;
}
function collectLinks(files = htmlFiles()) {
  const found = new Map();
  for (const file of files) {
    const name = path.relative(root, file).replaceAll(path.sep, '/');
    for (const url of extractUrls(fs.readFileSync(file, 'utf8'))) {
      if (!found.has(url)) found.set(url, new Set());
      found.get(url).add(name);
    }
  }
  return [...found].map(([url, pages]) => ({url, pages: [...pages].sort()}))
    .sort((a, b) => a.url.localeCompare(b.url));
}
function classify(headStatus, getStatus) {
  if (headStatus >= 200 && headStatus < 400) return 'ok';
  if (getStatus >= 200 && getStatus < 400) return 'ok';
  if (getStatus === 404 || getStatus === 410) return 'broken';
  return 'unverified';
}
async function request(url, method) {
  const headers = {
    'User-Agent': 'PortfolioLinkAudit/1.0 (+https://kailanialarcon.com)',
    'Accept': '*/*'
  };
  if (method === 'GET') headers.Range = 'bytes=0-0';
  try {
    const response = await fetch(url, {
      method, headers, redirect: 'follow',
      signal: AbortSignal.timeout(12000)
    });
    if (response.body) await response.body.cancel().catch(() => {});
    return {status: response.status, finalUrl: response.url};
  } catch (error) {
    return {status: null, detail: error.cause?.code || error.name || 'network error'};
  }
}
async function inspectLink(link) {
  const head = await request(link.url, 'HEAD');
  let get = {status: null};
  // HEAD is often blocked on downloads or by anti-bot protections.
  if (!(head.status >= 200 && head.status < 400)) get = await request(link.url, 'GET');
  const status = classify(head.status, get.status);
  return {...link, status, headStatus: head.status, getStatus: get.status,
    detail: head.detail || get.detail || null, finalUrl: get.finalUrl || head.finalUrl || link.url};
}
function makeMarkdown(rows, mode) {
  const totals = {ok: 0, broken: 0, unverified: 0};
  for (const row of rows) if (row.status in totals) totals[row.status]++;
  const lines = [
    '# External link health report',
    '',
    mode === '--inventory' ? 'Inventory only. No network destinations were checked.' :
      'Scheduled network check. HTTP 404/410 after a GET request indicates a broken link; transient blocks and outages are unverified.',
    '',
    'Unique outbound destinations: ' + rows.length,
    mode === '--check' ? 'Available: ' + totals.ok + ' | Broken: ' +
      totals.broken + ' | Unverified: ' + totals.unverified : '',
    '',
    '| Status | Destination | Source pages |',
    '| --- | --- | --- |'
  ];
  for (const row of rows) {
    const status = row.status === 'broken' ? 'BROKEN' :
      row.status === 'ok' ? 'OK' : row.status === 'unverified' ? 'Review' : 'Inventory';
    lines.push('| ' + status + ' | ' + row.url.replaceAll('|','%7C') +
      ' | ' + row.pages.join(', ').replaceAll('|','\\|') + ' |');
  }
  return lines.join('\n') + '\n';
}
async function main(args = process.argv.slice(2)) {
  const mode = args[0] || '--inventory';
  if (args.length > 1 || !['--check', '--inventory'].includes(mode)) {
    console.error('Usage: node scripts/external-links.js [--inventory|--check]');
    process.exitCode = 2;
    return;
  }
  const links = collectLinks();
  const rows = mode === '--inventory' ? links.map(x=>({...x, status:'inventory'})) :
    await Promise.all(links.map(inspectLink));
  const output = path.join(root, 'quality-artifacts');
  fs.mkdirSync(output, {recursive: true});
  const markdown = makeMarkdown(rows, mode);
  fs.writeFileSync(path.join(output, 'external-links.md'), markdown);
  fs.writeFileSync(path.join(output, 'external-links.json'),
    JSON.stringify({mode, checkedAt: new Date().toISOString(), links:rows}, null, 2) + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  console.log(markdown);
  if (rows.some(x=>x.status==='broken')) process.exitCode = 1;
}
if (require.main === module) main().catch(error => {console.error(error);process.exitCode=1;});
module.exports = {htmlFiles, extractUrls, collectLinks, classify, inspectLink, makeMarkdown};
