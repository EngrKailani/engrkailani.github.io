# Kailani Alarcon | Engineering Portfolio

[Visit the portfolio](https://engrkailani.github.io/) · [Browse projects](https://engrkailani.github.io/projects/) · [Quality checks](QUALITY_AUDIT.md)

A framework-free HTML, CSS, and JavaScript portfolio covering robotics, embedded systems, instrumentation, and engineering verification. It includes 16 project pages, an interactive two-shelf project library, an engineering workbench, research interests, and an academic CV. The visual identity uses a muted rose/plum palette, space illustrations, and Mexican and Samoan floral motifs.

## Start locally

Use Node.js 22 and Python 3. No build step is required to preview the checked-in website.

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173>. To install validation tooling:

```sh
npm install
npx playwright install chromium
npm run check:static
```

With the local server running in a separate terminal:

```sh
npm run check:browser
npm run check:workbench-browser
```

Browser checks write reports and screenshots to the ignored `quality-artifacts/` directory. See [QUALITY_AUDIT.md](QUALITY_AUDIT.md) for coverage, Lighthouse workflows, and manual accessibility checks. Passing automated checks is not a claim of complete WCAG conformance or a guaranteed performance score.

## Where to make changes

| Content or feature | Source |
| --- | --- |
| Homepage, selected work, experience, contact | `index.html` |
| Project directory and technical case studies | `projects/index.html`, `projects/*.html`, and project subfolders |
| Interactive project books | `bookshelf.js`, book spines in `index.html`, `bookshelf.css` |
| Workbench demonstrations | `workbench.html`, `workbench.js`, `workbench-models.js`, `workbench.css` |
| Research and technical writing | `research.html`, `research.css` |
| HTML academic CV | `academic-cv.html`, `academic-cv.css` |
| Official downloadable academic CV | `assets/Kailani_Alarcon_CV.pdf` |
| Theme and project search/filtering | `portfolio-upgrade.js`, `portfolio-upgrade.css` |
| Homepage layout and archive deep links | `homepage-refinement.css`, `homepage-refinement.js` |
| Navigation disclosure | `scripts/projects-menu.js`, `projects-menu.css` |
| Photo presentation | `portfolio-photos.css` |
| Validation | `scripts/site-check.js`, `scripts/browser-quality.js`, `scripts/mobile-layout.js` |

When a project changes, keep its directory card, standalone page, bookshelf entry, and related homepage summary consistent. Update the sitemap when adding or removing a public page. Keep visible project counts, accessibility labels, and search/social descriptions aligned with the actual project set.

## CSS maintenance

`build-css.js` combines nine authored stylesheets in a fixed cascade order. Edit the source files listed there, then run:

```sh
node build-css.js
npm run check:static
```

Commit the regenerated `portfolio.css` and `home-css-initial.css`, `home-css-layout.css`, and `home-css-project.css` with the source changes. Do not edit generated CSS directly.

The homepage loads those three chunks plus deferred bookshelf and case-study styles in the original order. Other pages use the full bundle. Feature-specific styles, including `portfolio-upgrade.css`, `homepage-refinement.css`, and project styles, remain separate. Shared light/dark palette variables live in `portfolio-upgrade.css`; photo components belong in `portfolio-photos.css`. Update versioned asset URLs when changing a referenced script or stylesheet.

## Content and media

- Preserve the distinction between completed work, preliminary observations, proposed research, and unverified outcomes.
- NASA project material describes legacy-arm assessment, ROS2 arm control/calibration, and Thermal Desktop steady-state and transient high-vacuum modeling. Requirements and planned scenarios are not completed qualification results.
- IVerify is a student prototype with limited bench evidence. Its case study does not establish clinical performance or medical approval.
- Workbench signals and robot motion are educational simulations, not measured hardware data or validated motion plans.
- Keep confidential reports, transcripts, and internal technical material out of public assets. Use only approved public evidence and media.
- Asset paths are case-sensitive. Preserve referenced filenames or update every reference when replacing media. Optimized homepage WebP files are derived from the original photographs by `scripts/optimize-home-images.py`.
- The official CV is the user-supplied `assets/Kailani_Alarcon_CV.pdf`. The HTML CV and optional generated PDF are adaptations. The manual academic-CV workflow creates a preview artifact and does not overwrite the official CV.
- Separate résumé PDFs are maintained by `scripts/build-resume-pdf.py`; editing that generator can trigger workflows that commit regenerated résumé files.

## Review and deployment

The canonical website is **https://engrkailani.github.io/**, hosted on GitHub Pages from `main`.

1. Make changes on a branch and run the appropriate static and browser checks.
2. Open a pull request and inspect its diff, screenshots, and Actions results.
3. Merge the reviewed changes to `main` when ready to publish.
4. Check the GitHub Pages deployment and verify the affected public routes, links, and media.

See [archived development notes](docs/portfolio-history.md) for earlier design decisions and implementation history. Those notes are historical and may describe superseded behavior.
