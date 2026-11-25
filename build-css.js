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
// Project-facing pages only use these five authored CSS source files.
// Preserve their original cascade order when publishing the lean bundle.
const projectSources = [
  'styles.css',
  'enhancements.css',
  'engineering.css',
  'case-studies.css',
  'project-pages.css'
];
const projectOutput = '/* Compiled project-only styles. Source: build-css.js. This bundle omits homepage-only bookshelf, ambient, botanical and UX source styles. */\n' +
  projectSources.map(file => {
    const content = fs.readFileSync(path.join(root, file), 'utf8').trimEnd();
    return '\n/* SOURCE: ' + file + ' */\n' + content + '\n';
  }).join('');
fs.writeFileSync(path.join(root, 'portfolio-projects.css'), projectOutput, 'utf8');
// The homepage retains the existing, independently authored stylesheets.
console.log('Rebuilt full and project-only CSS bundles.');
