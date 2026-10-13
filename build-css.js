/**
 * Rebuild the published CSS bundle after editing any source stylesheet.
 * Usage: node build-css.js
 *
 * GitHub Pages serves portfolio.css directly. The authored CSS files remain
 * in the repository as editable source files and are compiled in this order.
 * This build uses only built-in Node.js modules, with no dependencies.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const sources = [
  'styles.css',
  'enhancements.css',
  'bookshelf.css',
  'ux.css',
  'botanical.css',
  'ambient.css',
  'engineering.css',
  'case-studies.css',
  'project-pages.css'
];
const root = __dirname;
const output = '/* Compiled portfolio stylesheet. Source: build-css.js; CSS files concatenated in exact cascade order. */\n' +
  sources.map(file => {
    const content = fs.readFileSync(path.join(root, file), 'utf8').trimEnd();
    return '\n/* SOURCE: ' + file + ' */\n' + content + '\n';
  }).join('');
fs.writeFileSync(path.join(root, 'portfolio.css'), output, 'utf8');
// The homepage keeps hero/layout rules render-blocking and defers just the
// below-fold bookshelf and engineering dossier rules. Slice the same compiled
// source by stable markers to retain the exact original CSS cascade.
const boundary = file => {
  const index = output.indexOf('\n/* SOURCE: ' + file + ' */\n');
  if (index < 0) throw new Error('Missing CSS source marker: ' + file);
  return index;
};
const homepageChunks = [
  ['home-css-initial.css', output.slice(0, boundary('bookshelf.css'))],
  ['home-css-layout.css', output.slice(boundary('ux.css'), boundary('case-studies.css'))],
  ['home-css-project.css', output.slice(boundary('project-pages.css'))]
];
for (const [file, content] of homepageChunks)
  fs.writeFileSync(path.join(root, file), content, 'utf8');
console.log('Rebuilt full portfolio.css and three layout-stable homepage CSS chunks.');
