# Portfolio quality audit

This document describes repeatable accessibility, mobile, and performance checks.
**Audit metrics are not claimed until a successful browser run produces artifacts.**

## Scope

- Homepage: `/`, including its featured engineering projects and research links.
- Research and technical writing: `/research.html`.
- Engineering project directory: `/projects/`.
- Engineering Workbench: `/workbench.html`.
- Reproducible educational robotics experiment: `/robotics-experiment.html`.
- All sixteen case studies, the PDF-based CV and résumé viewers, the custom 404 page, and responsive navigation are included in the Chromium/axe test suite.

## Automated checks

The [Portfolio accessibility and performance audit](.github/workflows/portfolio-audit.yml)
workflow runs on changes to the relevant pages or through **Actions → Portfolio accessibility and performance audit → Run workflow**.

1. **Static quality:** `node scripts/site-check.js` validates local assets, links, semantics, research/publication status and navigation. `node scripts/navigation-quality.js` checks all 16 previous/next project links, same-page anchors, and sitemap coverage. `node scripts/css-quality.js` parses stylesheets. `node scripts/workbench-models-test.js` tests synthetic signals and planar inverse kinematics. `node scripts/robotics-experiment-test.js` checks seeded paired trials, bootstrap bounds, and smoothing sensitivity.
2. **Chromium/axe:** `node scripts/browser-quality.js` covers desktop and mobile layouts, keyboard interactions, light/dark themes, content, console errors, image loading and automated WCAG 2.0/2.1 A/AA checks. The browser suite also checks narrow-screen overflow and content containment.
3. **Lighthouse:** Five entry points, including the robotics experiment, are tested in mobile and desktop presets: **ten real lab runs**. `node scripts/lighthouse-phase4-report.js` creates a Markdown scorecard and JSON measurement table; raw reports are uploaded. The summary lists performance, accessibility, best practices, SEO, largest contentful paint, cumulative layout shift, and total blocking time.

The Ubuntu 24.04 CI jobs install the pinned Playwright Chromium browser without re-running apt's font-package dependency installer. The previous apt step could fail when package sources were unavailable even though the responsive tests passed. Browser startup and Lighthouse still fail the jobs if dependencies or measurements are missing.

The browser workflow also tests robotics experiment interactions, CSV export, sample plots, theme switching and 320/390/1280 px layout.

The workflow uploads:
- `browser-accessibility-results`: screenshots, Chromium tests and axe findings.
- `lighthouse-performance-results`: eight Lighthouse JSON reports, a Markdown scorecard and review-target warnings.

The separately scheduled [External link health](.github/workflows/external-links.yml) workflow reviews links to public source repositories, publications, and professional profiles once a week or on manual dispatch. Its inventory step runs without network access as part of static checks. The network audit tries HEAD followed by a lightweight GET if required; HTTP 404/410 responses are marked broken, whereas timeouts, rate limits, authentication blocks, and server errors are **unverified** and need human review. The workflow uploads a Markdown and JSON link report. Third-party availability does not block normal deployment checks.

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
npm run check:robotics-browser
```

## Visual regression comparison

The separate [visual layout regression](.github/workflows/visual-regression.yml) workflow launches the real pull-request base and proposed versions side by side, compares selected unchanged page screenshots at fixed viewport sizes, and uploads paired PNGs plus a JSON change fraction. A 7% significantly changed-pixel fraction is a review threshold. Intentional page-content changes are excluded from baseline comparisons, while the full Chromium/axe suite checks those pages independently. Screenshots can still vary with browser rendering and font delivery, so investigate failures rather than treating the percentage as a universal accessibility or performance measure.

## Manual accessibility checklist

Automated tools cannot prove WCAG conformance. Before treating the audit as complete, check these manually:

- Use only **Tab**, **Shift+Tab**, **Enter**, **Space**, and arrow keys to open the responsive site navigation and reach menus, the archive disclosure, Workbench controls, project directory filters, and the research anchor links.
- At **320 px**, **200% zoom**, and in both themes, check readable text, focus visibility, no clipped buttons or horizontal document scrolling, and content reflow.
- Use a screen reader such as NVDA or VoiceOver to verify landmark order, headings, link purposes, disclosure state, field labels, dynamic status feedback, and meaningful readings from the simulated instruments.
- Check that motion obeys **prefers-reduced-motion** and that the Workbench does not claim real hardware data.
- Print the Research page and a NASA and a university case study, including from dark mode. Check that menus are hidden, evidence and affiliation boundaries remain legible, tables fit on paper, and figures and source citations are retained. The browser audit also generates sample A4 PDFs for a basic print-layout regression check.
- Check screenshots and Lighthouse issues before changing fonts, animations, or loaded imagery.
- Do not present private company reports as public downloadable publications without authorization.

## Current site organization and disclosure safeguards

- The Research page distinguishes documented engineering research, proposed PhD work, student posters, and two publicly available industry white papers.
- The homepage links directly to research, publications, the selected project portfolio, and the academic CV.
- Five case studies link to matching verified public project repositories; code availability is not presented as instrument calibration or hardware validation. Featured research case studies point to inspectable public source files or distinguish conceptual figures from measurement evidence. All 16 case studies use the same six-facet evidence overview.
- The 404 page is explicitly noindexed and offers links back to the homepage, project archive, and research. The project directory remains the archive for other work.
- The NASA case study uses generic, non-measured illustrations. Unused numerical NASA diagrams and obsolete résumé/CV generators have been retired.
- Static checks block the former NASA-specific numerical claims and the previous public PDF binaries, and cover internal links, page structure, and publications.

## Published CV and résumé policy

The two public PDF assets are maintained by manually reviewing and uploading revised source PDFs. Obsolete generators that could publish older technical figures have been removed. The static checks reject the known earlier, NASA-numbered PDF binaries but cannot prove that arbitrary future PDF uploads contain no sensitive details. Review any replacement PDF before publishing.

Removing a file from the current GitHub branch does not remove previous revisions from Git history.

## Deployment note

The canonical site is [kailanialarcon.com](https://kailanialarcon.com/),
served by GitHub Pages from `main`. Review pull-request checks before merging,
then verify the Pages deployment and the published routes. Successful source
checks do not by themselves prove that the newest revision is live.
