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
- Maintain five curated homepage projects, with both NASA and faculty-mentored engineering work represented. Keep detailed methods and qualifications in the individual case studies.\n- Organize the Research page around completed work and publications before proposed PhD research. Keep the NASA case study concise and avoid public numerical NASA project specifics.
- Keep the academic CV and résumé PDF downloads current and ensure their contact links point to `kailanialarcon.com`.
- For changes, use a branch, inspect the diff, run checks, merge a pull request, and confirm the GitHub Pages deployment.

The current site uses shared navigation, a small theme-switch script, and page-scoped assets. Historical experiments are documented in `docs/portfolio-history.md`; unused legacy script and CV/résumé stylesheets have been retired. Keep project-specific CSS only where referenced.
