# Kailani Alarcon | Space Robotics and Electrical Engineering

**Live portfolio:** https://kailanialarcon.com

A public engineering portfolio documenting NASA internship work, faculty-mentored research, embedded systems, measurement, and verification. It uses a professionally restrained pink-and-space visual identity.

## Site map

| Public page | Source |
| --- | --- |
| Homepage with curated projects, research focus, experience, education, skills, and contact | `index.html` |
| Searchable archive of 16 project case studies | `projects/index.html`, `projects/*.html` |
| Research focus, documented investigations, industry papers, and proposed studies | `research.html` |
| Academic CV and downloadable PDF | `academic-cv.html`, `assets/Kailani_Alarcon_CV.pdf` |
| Current résumé and downloadable PDF | `resume.html`, `assets/Kailani_Alarcon_Master_Resume.pdf` |
| Optional browser-only interactive models | `workbench.html`, `workbench.js` |
| Custom not-found page | `404.html` |

Styles are intentionally modular. `professional-home.css` provides the homepage foundations; `cosmic-theme.css` supplies the shared space/pink design and accessible mobile navigation; research, workbench, PDF-only document pages, and project case studies load only their currently needed stylesheets. The site is hosted on GitHub Pages from `main`, with `CNAME` configured for `kailanialarcon.com`.

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

The repository's GitHub Actions workflows test internal links, images, browser layout, accessibility, JavaScript, CSS, and performance. See [QUALITY_AUDIT.md](QUALITY_AUDIT.md). Automated checks do not establish full WCAG conformance or guarantee field performance.

## Editorial standards

- Document verified personal contributions, not uncompleted tests or future plans as finished research.
- Distinguish preliminary NASA engineering assessments from qualification results; keep NASA affiliation and image disclaimers.
- Keep student projects and synthetic workbench models clearly distinguished from flight or clinically validated hardware.
- Publish only materials and photos authorized for public release. Do not commit private NASA or employer information, transcripts, or internal reports.
- Project media need a visible provenance label. Use original project images only with publication clearance; describe illustrative or synthetic figures as such. The six featured project images are labeled accordingly.
- Avoid committing unapproved employer CAD, lab hardware photos, and screenshots showing internal file paths. Previously published technical photos were removed from the current branch; Git history and caches may still retain older copies. Git history cleanup requires a separate coordinated review.
- Link directly to a project repository only when it is already public and verified to match the project. A source link establishes code availability, not hardware validation or authorization to reuse third-party materials.
- Maintain six curated homepage projects in a balanced two-column desktop grid, representing NASA, faculty-mentored research, robotics coursework, and test automation. Keep detailed methods and qualifications in the individual case studies.
- Organize the Research page around completed work and publications before proposed PhD research. Keep the NASA case study concise and avoid public numerical NASA project specifics.
- Keep the manually maintained academic CV and résumé PDFs current, review future uploads for NASA project numbers, and ensure the public links point to the existing website filenames.
- Never restore retired résumé/CV generators or diagrams containing project-specific NASA figures. The static checker rejects those legacy assets and the previously published PDF binaries.
- For changes, use a branch, inspect the diff, run checks, merge a pull request, and confirm the GitHub Pages deployment.

Legacy bookshelf, robotics-lab, and case-explorer runtime files were retired in November 2026 after confirming that no published page loads them. Source CSS required by `build-css.js` is retained because it still generates the case-study CSS bundle. Check the generated stylesheet dependencies before removing any other historic CSS files.

The current site uses shared navigation, a small theme-switch script, and page-scoped assets. Historical experiments are documented in `docs/portfolio-history.md`; unused legacy script and CV/résumé stylesheets have been retired. Keep project-specific CSS only where referenced.
