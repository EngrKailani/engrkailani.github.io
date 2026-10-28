# Portfolio quality audit

This document describes repeatable accessibility, mobile, and performance checks.
**Audit metrics are not claimed until a successful browser run produces artifacts.**

## Scope

- Homepage: `/`, including the optional engineering archive.
- Research and technical writing: `/research.html`.
- Engineering project directory: `/projects/`.
- Engineering Workbench: `/workbench.html`.
- All sixteen individual case studies and the HTML résumé are included in the existing Chromium/axe test suite.

## Automated checks

The [Portfolio accessibility and performance audit](.github/workflows/portfolio-audit.yml)
workflow runs on changes to the relevant pages or through **Actions → Portfolio accessibility and performance audit → Run workflow**.

1. **Static quality:** `node scripts/site-check.js` validates local assets, links, semantics, research/publication status and navigation. `node scripts/css-quality.js` parses stylesheets. `node scripts/workbench-models-test.js` tests synthetic signals and planar inverse kinematics.
2. **Chromium/axe:** `node scripts/browser-quality.js` covers desktop and mobile layouts, keyboard interactions, light/dark themes, content, console errors, image loading and automated WCAG 2.0/2.1 A/AA checks. `scripts/mobile-layout.js` checks narrow-screen overflow and card containment.
3. **Lighthouse:** Four entry points are tested in mobile and desktop presets: **eight real lab runs**. `node scripts/lighthouse-phase4-report.js` creates a Markdown scorecard and JSON measurement table; raw reports are uploaded. The summary lists performance, accessibility, best practices, SEO, largest contentful paint, cumulative layout shift, and total blocking time.

The workflow uploads:
- `browser-accessibility-results`: screenshots, Chromium tests and axe findings.
- `lighthouse-performance-results`: eight Lighthouse JSON reports, a Markdown scorecard and review-target warnings.

The review targets—**mobile performance ≥65**, **desktop performance ≥80**, **accessibility ≥95**, **SEO ≥90**—are prompts for inspection, not promises or invented results. Lighthouse scores vary across runners and do not replace real-user monitoring. Every confirmed axe violation is reported by the browser tests.

To repeat the static checks locally:

```sh
npm install
npm run check:static
```

To run browser checks with Chromium installed:

```sh
npx playwright install chromium
python3 -m http.server 4173
# in another terminal
npm run check:browser
```

For the focused Workbench smoke test:

```sh
npm run check:workbench-browser
```

## Manual accessibility checklist

Automated tools cannot prove WCAG conformance. Before treating the audit as complete, check these manually:

- Use only **Tab**, **Shift+Tab**, **Enter**, **Space**, and arrow keys to reach menus, the archive disclosure, Workbench controls, project directory filters, and the research anchor links.
- At **320 px**, **200% zoom**, and in both themes, check readable text, focus visibility, no clipped buttons or horizontal document scrolling, and content reflow.
- Use a screen reader such as NVDA or VoiceOver to verify landmark order, headings, link purposes, disclosure state, field labels, dynamic status feedback, and meaningful readings from the simulated instruments.
- Check that motion obeys **prefers-reduced-motion** and that the Workbench does not claim real hardware data.
- Check screenshots and Lighthouse issues before changing fonts, animations, or loaded imagery.
- Do not present private company reports as public downloadable publications without authorization.

## Source-level changes made in Phase 4

- Added a research/technical-writing page distinguishing **future research interests**, **documented engineering projects**, and **two internal technical white papers**.
- Added direct research navigation to the homepage, project directory, Workbench, and résumé; added the research URL to the sitemap.
- Added verified intrinsic dimensions to five lazy-loaded homepage WebP images to reduce layout-shift risk.
- Added research page, keyboard, dark-theme, mobile and axe checks, and the Lighthouse scorecard workflow.

## Deployment note

The canonical site is [engrkailani.github.io](https://engrkailani.github.io/),
served by GitHub Pages from `main`. Review pull-request checks before merging,
then verify the Pages deployment and the published routes. Successful source
checks do not by themselves prove that the newest revision is live.
