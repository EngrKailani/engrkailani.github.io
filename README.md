# Kailani Alarcon | Space Robotics and Electrical Engineering

**Live portfolio:** https://kailanialarcon.com

A public engineering portfolio documenting NASA internship work, faculty-mentored research, embedded systems, measurement, and verification. It uses a professionally restrained pink-and-space visual identity.

## Site map

| Public page | Source |
| --- | --- |
| Homepage with curated projects, research focus, experience, education, skills, and contact | `index.html` |
| Searchable archive of 16 project case studies plus four additional CV/résumé project briefs | `projects/index.html`, `projects/*.html` |
| Research focus, documented investigations, industry papers, and proposed studies | `research.html` |
| Academic CV and downloadable PDF | `academic-cv.html`, `assets/Kailani_Alarcon_CV.pdf` |
| Current résumé and downloadable PDF | `resume.html`, `assets/Kailani_Alarcon_Master_Resume.pdf` |
| Optional browser-only interactive models | `workbench.html`, `workbench.js` |
| Reproducible synthetic sensing and robotics trial experiment | `robotics-experiment.html`, `robotics-experiment-model.js`, `robotics-experiment.js` |
| Custom not-found page | `404.html` |

Styles are intentionally modular. Unused pre-space-theme navigation selectors were retired from `professional-home.css`; `professional-home.css` provides the homepage foundations; `cosmic-theme.css` supplies the shared space/pink design and accessible mobile navigation; research, workbench, PDF-only document pages, and project case studies load only their currently needed stylesheets. The site is hosted on GitHub Pages from `main`, with `CNAME` configured for `kailanialarcon.com`.

Image previews in the 20-entry archive stay lazy-loaded, and the 13 illustrations below the initial robotics group explicitly use low network priority; this reduces competition for critical text and stylesheet requests without changing any scientific figure or evidence label. Lighthouse scores must be verified against a completed lab run, not inferred from image attributes.

## Research-first reading path

The project directory provides four direct starting points for technical reviewers: NASA robotic-arm feasibility, student-initiated three-link leg research, faculty-mentored RF measurement work, and group UR3e kinematics. These links do not replace search, filtering, or the 16 case studies and four briefs.

Four flagship case studies include short technical-method explanations. A reused leg schematic is explicitly labeled illustrative, RF analysis differentiates S-parameter interpretation from unavailable instrument calibration, UR3e commentary distinguishes Jacobian rank from conditioning, and the NASA assessment links qualitative feasibility decisions to still-open verification questions. No new measurements or project-specific NASA data are asserted.

## Evidence-first visuals and experimental boundaries

Five formerly text-only case studies (ALU, Control & Measurement Labs, Fingerprint Authentication, STM32 PWM, and combinational VHDL) now include compact SVG **method sketches**. These diagrams summarize documented functional workflows. They are explicitly labeled conceptual and are not recovered schematics, oscilloscope traces, circuit wiring, sensor results, or evidence of hardware testing. The five vector illustrations are original source-controlled site assets.

The four research-forward case studies (leg dynamics, VNA, UR3e, and thermal logging) now include a reviewer-oriented verification checklist distinguishing what can be inspected from what would be needed for independent replication. No unmeasured instrument, robot, or NASA performance results have been added.

The research page links selected past work to specific future technical questions and **proposed**, rather than completed, evaluation methods. The aim is to make the distinction between prior evidence and the intended doctoral research more visible.

## Visual regression checks

Pull requests trigger `.github/workflows/visual-regression.yml`, which checks out the real base commit alongside the proposed branch and captures controlled Playwright viewport screenshots of representative **unchanged** pages in light/dark and desktop/mobile configurations. It compares pixel differences with a stated 7% threshold and uploads before-and-after images and a JSON report. Deliberately edited HTML routes are skipped in this comparison and remain covered by the full responsive/axe browser suite. The screenshot comparison is a regression guard, not a substitute for manual review or a promise of pixel-identical rendering across browsers.

Run `npm run check:visual` only when two preview servers are available at `SITE_URL` and `BASELINE_URL`; ordinary local checks need only `npm run check:static` and the browser suite.

## CSS build and retained sources

Published homepage styles use `professional-home.css` and `cosmic-theme.css`. The old generated `home-css-*.css` slices were not loaded by any published page and are no longer produced by `build-css.js`. The unreferenced `critical-home.css` and `projects-menu.css` assets were also retired. This removes unused repository assets, **not a measured reduction in visitors' transfer size**.

The nine authored source stylesheets in `build-css.js` still rebuild the legacy `portfolio.css` bundle. The project archive and 16 case studies now load **`portfolio-projects.css`**, built from only five of those sources (`styles.css`, `enhancements.css`, `engineering.css`, `case-studies.css`, and `project-pages.css`) in their original cascade order. The dedicated project bundle excludes bookshelf, ambient, botanical, and homepage UX styles. The unchanged homepage continues to load its smaller standalone stylesheets. Do not remove source files needed to reproduce either bundle. Flagship technical notes retain their page-scoped stylesheet. CSS and JS asset URLs use Git blob SHA cache fingerprints, enforced by CI.

**Performance scope:** The project CSS source shrinks from roughly 127.7 KB to 53.3 KB of uncompressed bytes before transfer compression, a reduction of about 58% for that single stylesheet. These are file sizes, not Lighthouse or real-user speed claims; the full CSS bundle remains in the repository for reproducibility. Browser and Lighthouse audits cover layout, dark-mode readability, and measured performance.\n\n## Shareable research and project metadata

The research page and all sixteen engineering case studies now include reproducible schema.org **WebPage** and **BreadcrumbList** JSON-LD. The archive uses a **CollectionPage** with an **ItemList** of the 16 case studies and four linked briefs. These records describe the published portfolio pages and their navigation, not refereed publications, NASA-endorsed engineering results, or independent authorship of group projects.

Regenerate structured data after editing project titles, summaries or archive links with `npm run sync:structured`; verify it with `npm run check:structured`. The static checks compare every embedded record to visible titles, canonical URLs, descriptions and directory links to prevent stale, misleading metadata. Search-engine presentation is not guaranteed.

## Printing research and case studies

The research page and all sixteen case studies provide a visible **Print / save PDF** control that invokes the browser's print dialog. It is progressively enhanced, so without JavaScript the existing browser Print / Save as PDF command remains available. The button does not generate or replace uploaded résumé/CV files. The site also supports the browser's **Print / Save as PDF** command. The case studies use one small shared print-only `projects/case-print.css` stylesheet loaded after the screen theme. Their print-specific styles remove the site menu and navigation controls, convert the dark theme to a readable white-paper layout, and keep engineering evidence, limitations, source links and NASA affiliation disclaimers. Large technical tables are sized for printable pages. This is a browser feature, not a server-generated publication, and it does not alter the uploaded academic CV or résumé PDFs.

The Chromium browser audit checks print styles with saved dark-mode preferences and renders representative NASA, Honors research, and research-page PDFs to catch regressions.

## Development and checks

The published site is static HTML, CSS and JavaScript. To preview it locally:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

To run the automated tests, use Node.js 22:

```sh
npm install
npx playwright install chromium
npm run check:static
npm run check:browser
```

The repository's GitHub Actions workflows test internal links, project-to-project navigation, same-page anchors, sitemap coverage, images, browser layout, accessibility, JavaScript, CSS, and performance. The weekly **External link health** workflow also audits public outbound project repositories, industry papers, and professional links; it produces an artifact and job summary. You can run `npm run check:external:inventory` to list them without network access or `npm run check:external` to test destinations manually. An inaccessible site is reported for review rather than automatically treated as broken; only a confirmed HTTP 404 or 410 fails the scheduled audit. See [QUALITY_AUDIT.md](QUALITY_AUDIT.md). Automated checks do not establish full WCAG conformance or guarantee field performance.

## Editorial standards

- Keep project titles and contributions in the uploaded academic CV and master résumé aligned with the site. Search and category filters cover both the 16 full case studies and four additional project briefs, which link to detailed research sections or the separate Arduino PI-control exercise. Do not merge that Arduino project into the STM32 PWM coursework.
- Document verified personal contributions, not uncompleted tests or future plans as finished research.
- Use concise, specific descriptions of methods, outcomes, and evidence limitations. Avoid generic project taglines or repeating the six evidence facets verbatim in introductory paragraphs.
- In longer case studies, keep numerical results in the evidence/results section and use figure introductions to interpret their meaning rather than repeat the full results. Preserve source references and critical validation limits.
- Keep the four shorter project briefs focused on contributions, methods, and public evidence boundaries. Do not imply they contain independent experimental records or complete case-study documentation.
- Give each case study a unique search/social description grounded in that project. Describe proposed doctoral questions separately from documented work, and state group attribution and validation limits where applicable.
- Distinguish preliminary NASA engineering assessments from qualification results; keep NASA affiliation and image disclaimers.
- Keep student projects and synthetic workbench models clearly distinguished from flight or clinically validated hardware.
- Publish only materials and photos authorized for public release. Do not commit private NASA or employer information, transcripts, or internal reports.
- Project media need a visible provenance label. Use original project images only with publication clearance; describe illustrative or synthetic figures as such. The six featured project images are labeled accordingly.
- Avoid committing unapproved employer CAD, lab hardware photos, and screenshots showing internal file paths. Previously published technical photos were removed from the current branch; Git history and caches may still retain older copies. Git history cleanup requires a separate coordinated review.
- Keep archive keyword metadata grounded in the documented case-study technologies. Search matches multiple terms in any order; category counts reflect the search across all 20 entries, independent of the selected category. The archive's section shortcuts show only sections with visible results, while leaving the selected filter and URL query unchanged. Use the **Copy view link** control to share an active search and category.
- Link directly to a project repository only when it is already public and verified to match the project. A source link establishes code availability, not hardware validation or authorization to reuse third-party materials.
- Keep the 16 case studies connected through previous and next links following the project archive order, with the last project linking back to the first. Run `npm run check:navigation` after changing archive order or project links.
- Maintain six curated homepage projects in a balanced two-column desktop grid, representing NASA, faculty-mentored research, robotics coursework, and test automation. Align the media, contribution and action rows; distinguish documented work from proposed doctoral research. Keep detailed methods and qualifications in the individual case studies.
- Lead the Research page with documented engineering experience before proposed doctoral directions. Keep completed evidence, publications, and future study questions distinct.
- Use the same six evidence-summary facets on all 16 project case studies: Problem, My contribution, Engineering tools, Validation method, Documented result, and Limitations. Use one reading-navigation bar, and make results and evidence limitations visually distinct. On flagship cases, link to inspectable source files or labeled conceptual figures without implying hardware validation.
- Keep the NASA case study concise and avoid public numerical NASA project specifics.
- Keep the manually maintained academic CV and résumé PDFs current, review future uploads for NASA project numbers, and ensure the public links point to the existing website filenames.
- Never restore retired résumé/CV generators or diagrams containing project-specific NASA figures. The static checker rejects those legacy assets and the previously published PDF binaries.
- For changes, use a branch, inspect the diff, run checks, merge a pull request, and confirm the GitHub Pages deployment.

Legacy bookshelf, robotics-lab, and case-explorer runtime files were retired in November 2026 after confirming that no published page loads them. Source CSS required by `build-css.js` is retained because it still generates the case-study CSS bundle. Check the generated stylesheet dependencies before removing any other historic CSS files.

Every local CSS and JavaScript file linked by an HTML page uses a ten-character Git blob SHA as the `?v=` cache version. After changing local CSS or JavaScript, run `npm run sync:assets` to automatically refresh all referencing HTML pages. Run `npm run check:assets` to verify that no page has a stale version. GitHub Actions enforces these versions, preventing visitors from receiving outdated cached assets after a deployment.

The current site uses shared navigation, a small theme-switch script, and page-scoped assets. Historical experiments are documented in `docs/portfolio-history.md`; unused legacy script and CV/résumé stylesheets have been retired. Keep project-specific CSS only where referenced.


## Reproducible robotics teaching experiment (November 2026)

The standalone [planar 3R sensing experiment](robotics-experiment.html) extends the existing [educational kinematics model](workbench-models.js). It compares raw noisy position observations with exponentially smoothed observations on the same deterministic reference path. Twenty paired synthetic trials are used by default to show mean RMSE and a seeded 95% percentile bootstrap interval. It also charts sample-level errors and smoothing-weight sensitivity, and exports both sample-level and trial-level CSV data.

- Model and seeded experiment: [robotics-experiment-model.js](robotics-experiment-model.js).
- Interactive browser plot and controls: [robotics-experiment.js](robotics-experiment.js).
- Browser interaction and CSV checks: [scripts/robotics-experiment-smoke.js](scripts/robotics-experiment-smoke.js), run with `npm run check:robotics-browser` after installing Playwright Chromium.
- Repeatability, bootstrap, sensitivity and limiting-case tests: [scripts/robotics-experiment-test.js](scripts/robotics-experiment-test.js), run with `node scripts/robotics-experiment-test.js` or `npm run check:models`.
- Identical seed, noise, smoothing weight, and sample count produce the same generated observations and computed statistics.
- This is a new explanatory simulation, **not** recovered Honors research data, a validated UR3e robot model, NASA work, or hardware sensor measurements. Findings apply to the specified idealized model only.

The homepage keeps six featured projects. The experimental page is linked separately to avoid representing the educational demo as additional completed faculty-mentored research.
