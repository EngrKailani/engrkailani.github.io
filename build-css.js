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
// The site now uses professional-home.css on the homepage and a shared
// cosmic-theme.css. The old homepage CSS slices are no longer loaded, so
// rebuilding them would only reintroduce unreferenced generated assets.
console.log('Rebuilt portfolio.css from required source stylesheets.');
