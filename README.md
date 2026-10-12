# Kailani Alarcon | Electrical Engineering Portfolio

A technical engineering portfolio featuring NASA robotic-arm work, detailed project case studies, a 16-project interactive bookshelf, source-code links, and personal media. It retains a muted blush/plum aesthetic, Mexican and Samoan floral motifs, and subtle space animation.

## Portfolio upgrade (October 2026)

The site remains framework-free HTML, CSS and JavaScript. `portfolio-upgrade.css` layers over the generated `portfolio.css` without changing `build-css.js`. `portfolio-upgrade.js` handles theme, menu behavior, and filtering for the project directory. `robot-3d.js` adds the interactive high-vacuum chamber illustration. The viewer is a browser-side kinematic approximation, not a hardware controller or collision-validated simulation.

Canonical public website: `https://engrkailani.github.io`. Hosting and deployment use GitHub Pages from the `main` branch only. After committing changes, check the GitHub Pages deployment workflow and verify the published website. Before publishing, verify engineering claims, contact information, and public-use permissions for photos. Run `node scripts/site-check.js` as a static content check.

## Files

- `index.html`, `script.js`, `bookshelf.js`, `enhancements.js`, `ux.js`, `ambient.js`
- `portfolio.css`, the compiled single-file stylesheet used by GitHub Pages
- Nine source stylesheets (see the build order in `build-css.js`)
- `favicon.svg`, `robots.txt`, `sitemap.xml`, and the `assets/` folder with existing personal media and resume

## CSS maintenance

- Edit the nine authored source stylesheets listed in `build-css.js`; then run `node build-css.js` to regenerate `portfolio.css`. Do not edit the generated bundle by hand.
- Shared light and dark color variables, including photograph accent colors, live in `portfolio-upgrade.css` under `:root` and the single `:root[data-theme="dark"]` token block. Component styles should reference these variables rather than restating colors.
- `portfolio-photos.css` owns the centered and responsive image accents. Keep one base rule per component and use media queries only for intentional breakpoint changes.
- Other optional stylesheets (`repo-orbit.css`, `robot-control-dock.css`, and `case-explorer.css`) remain isolated to their respective features. Project-specific styles stay in `projects/`.
- Run `node scripts/site-check.js` before publishing. It verifies the compiled bundle, centralized dark-mode tokens, and photo styling invariants.

## Preview locally

Use `python -m http.server 8000` in the repository root and preview at `http://localhost:8000`. After editing a source stylesheet, run `node build-css.js` before committing so that `portfolio.css` reflects the changes.

## Publish on GitHub Pages

1. Open your repository at `https://github.com/EngrKailani/engrkailani.github.io`.
2. Upload `index.html`, `styles.css`, `script.js`, and the files in `assets/` to the repository root and `assets/` respectively.
3. Commit the changes. GitHub Pages will republish from your `main` branch if configured for `/(root)`.
4. Visit `https://engrkailani.github.io` when deployment finishes.

The PDF resume is intended to be public once deployed and contains personal contact information. Review before publishing.

## Content and photographs

- NASA robotic-arm project descriptions are based on the supplied engineering resume.
- The NASA robotics lab image is a personal site photograph, **not** a claim that the pictured rover is the user's robotic-arm project.
- IVerify content remains conceptual: it is not an approved clinical product.
- The confidential IVerify report and the academic transcript are not included.
- The robot lab is an artistic simplified 2D kinematic visualization, not a real hardware controller or collision-safe simulation.
- Photos appear within their relevant sections. There is no gallery page.
- The GitHub projects are authored links to public repositories and can be searched/filtered without an API key.

## How to edit

- Change content in `index.html`.
- Adjust the refined palette at the top of `styles.css`.
- Replace photos or the resume PDF within `assets/` with the same filenames.
- Change robot poses in `script.js`.

## Image update

The earlier Earth-window silhouette photo has been removed and is no longer part of this website. The Interests section instead features the provided space helmet photograph.

## Upload your own media (JPEG and MP4 only)

The website code references these exact filenames inside the root-level `assets/` directory. **Do not rename the files arbitrarily**: GitHub Pages paths are case-sensitive.

- `sls-rocket-kailani.jpeg` - standing by NASA rocket (homepage)
- `graduation-flowers.jpeg` - graduation photo (About)
- `robotics-lab-rover.jpeg` - NASA robotics-lab photo (featured project)
- `nasa-mission-training-complex.jpeg` - NASA mission training photo (Experience)
- `cleanroom-suit.jpeg` - cleanroom photo (Education)
- `space-helmet.jpeg` - space helmet photo (Interests)
- `huemotion-demo.mp4` - HueMotion hand tracking demonstration (GitHub section)
- `lighting-demo.mp4` - illuminated light demonstration (GitHub section)

Do not upload the braid or Earth-window silhouette photo. Any older `.jpg` files remain unused by the updated HTML. Upload the actual JPEG bytes with the filename extension `.jpeg`, rather than merely relabeling files encoded in a different format. MP4 clips should be encoded in a browser-compatible format such as H.264. The video modules remain hidden until the MP4 metadata can be loaded.

The existing `assets/Kailani_Alarcon_Resume.pdf` is a resume document rather than a photo/video and remains unchanged.


## October 2026 interactive upgrade

The portfolio now includes:
- Motion-safe scroll reveal transitions and a subtle CSS space orbit
- Expandable engineering case studies in the featured project and project cards
- More informative GitHub repository cards and links to the existing MP4 demos
- Three illustrative joint-angle sliders and a reset control for the ceiling-mounted arm
- An expandable experience timeline
- A keyboard-navigable Jane Austen / Project Hail Mary reading shelf

### Media upload policy

No images, videos, or PDF documents are added by this code update. Media remains under your control. The existing HTML references the following exact filenames under \`assets/\`:

| Section | Asset |
|---|---|
| Homepage NASA rocket | \`sls-rocket-kailani.jpeg\` |
| About and graduation | \`graduation-flowers.jpeg\` |
| Featured NASA robotics project | \`robotics-lab-rover.jpeg\` |
| Experience | \`nasa-mission-training-complex.jpeg\` |
| Education | \`cleanroom-suit.jpeg\` |
| Interests | \`space-helmet.jpeg\` |
| HueMotion demonstration | \`huemotion-demo.mp4\` |
| Lighting demonstration | \`lighting-demo.mp4\` |

The existing resume link, \`assets/Kailani_Alarcon_Resume.pdf\`, remains unchanged. No new media is required for the interactive features. This site never references the braid photo. All robotic motions and angle ranges are illustrative, not verified hardware settings.


## Interactive engineering bookshelf

The Engineering Bookshelf is an interactive project library at `#bookshelf`.

- fourteen individual CSS-rendered book spines represent engineering projects: NASA Robotics, IVerify, Thermal Controller & Logger, Fingerprint Authentication, Virtual Network Analyzer, 3-Link Leg Simulation, ProDriver Sim, HueMotion, and DMX Controller.
- Selecting a book opens a two-page story in a native accessible dialog, with a CSS book-cover turning animation, an overview and concrete technical details.
- Dialog controls include Close, Previous book, Next book, Escape key to close, click outside to close, and keyboard arrow navigation among spines.
- CSS honors `prefers-reduced-motion`; narrow screens display readable pages stacked vertically.
- The existing project summaries, GitHub repositories, resume PDF, JPEG photos and MP4 videos remain in place. The former small reading tabs were replaced by the full project bookshelf. Literature interests remain in their existing prose section.

**No new assets are needed.** This feature uses `bookshelf.css`, `bookshelf.js` and an updated `index.html` only. Add or change book descriptions in `bookshelf.js`. The stories are based on the existing project and GitHub descriptions; links to private or confidential documents have not been added.


## Streamlined navigation and subtle space elements

The latest update retains the full interactive bookshelf, GitHub project filters, robot joint controls, experience timeline, JPEG photographs, MP4 demos, and resume. It adds:

- A three-option quick-navigation row below the hero (project bookshelf, robot lab, and GitHub code).
- A main homepage call-to-action that opens the project bookshelf directly.
- A collapsible group of four supplementary project cards, keeping their existing details while shortening the default page.
- A lightweight reading-progress line in the sticky header, updated with one throttled requestAnimationFrame per scroll frame.
- CSS-only star details, a restrained orbiting planet near the bookshelf, and a shooting-star accent beside the robot lab.
- Improved section spacing, tappable links, responsive layouts, keyboard-friendly native disclosure, and support for reduced-motion preferences.

All design elements in \`ux.css\` are implemented with CSS shapes and no media assets. \`ux.js\` handles only the progress indicator and the disclosure hint. No JPEGs, MP4s, or PDFs were uploaded or edited. Keep the existing JPEG and MP4 media filenames documented above.


## Book opening and page-turning interaction

Selecting any project spine now triggers a physical-book-inspired sequence:

1. The selected book pulls upward from the shelf.
2. A closed, matching-color hardback appears in the center of an accessible dialog.
3. The front cover rotates around its hinge, revealing an open two-page project story.
4. Previous and Next animate a paper page turning in the appropriate direction.

The content is still text, readable, and accessible. Native Escape, Close, and outside-dialog dismissal work. The animations use only CSS shapes and transforms, and are disabled for visitors who prefer reduced motion. The narrow-screen version provides a stacked reading layout with a smaller opening-book effect.

Only \`index.html\`, \`bookshelf.css\`, and \`bookshelf.js\` were changed for the interaction. No media assets are required or uploaded.


## Book pages, not tab panels

The project reader is now styled as an open physical hardcover. The story and technical information are printed directly on two facing paper pages with a book binding, paper-stack edges, page numbers, chapter headings, and a hinged cover. The reader no longer looks like a framed tab or card.

On smaller screens the book displays **one page at a time**: first the story, then the engineering details. Visitors turn that page using the control printed at the bottom of the sheet. The Previous / Next book navigation still moves among all fourteen projects, and the existing Close button, Escape key, and external project links remain.

The upgrade only modifies \`index.html\`, \`bookshelf.css\`, and \`bookshelf.js\`. All visuals are CSS shapes. No JPEG, MP4, PDF or other asset was uploaded, removed or changed.


## Additional engineering source content (October 2026)

Three new project books were added, based on privately supplied technical coursework:

- **UR3e Robot Kinematics (ME422, collaborative)**: Six-link Denavit–Hartenberg frame modeling, homogeneous transforms, Jacobian velocity analysis, and rank-5 singularity at the evaluated zero-angle configuration.
- **STM32 Motor Timing & PWM**: Embedded motor timing, PWM control and encoder capture from the CV, complemented by STM32 timer/channel-2 duty-cycle examples from the uploaded microprocessor lab materials.
- **VHDL Digital Logic (EE421)**: Pure combinational 4-bit binary-to-decimal display and two-operand 4-bit addition plus carry-in, producing a 0–31 result on seven-segment displays.

The existing Fingerprint Authentication book was expanded with team-based, library-free UART packet handling, guided enrollment, template indexing, and success/failure LED signaling. The Three-Link Simulation book now mentions the MATLAB S-function, Jacobian kinematics, and Newton–Euler dynamics.

Additional CV evidence is included selectively in the About and Skills sections: Honors Baccalaureate, two 2026 Outstanding Service awards, mentoring, VHDL, PWM, FFT/radar processing, and cleanroom photolithography. The original NASA work, links, photographs, MP4 demos, and resume PDF remain intact.

**Privacy and source handling:** The original academic reports and CV remain private; no PDF/DOCX files, source code dumps, or source images were uploaded. The site contains concise public-facing summaries only. New books do not invent public GitHub repository links that were not already available. Group work is explicitly described as collaborative.


## October 2026 additional coursework and research context

The user provided additional engineering coursework, a capstone report, and research statements. The public site **does not upload or link to any of the original documents**.

Changes incorporated selectively:
- **Pipelined VHDL ALU** is a new project book: 4-bit registered datapath, ripple-carry adder, pass-through, increment, addition, subtraction and XOR, with one-cycle output latency. This is distinct from the previously listed combinational VHDL seven-segment project.
- **Hall-effect wafer characterization** is a new lab book: M91 FastHall, Van der Pauw four-contact geometry, Hall measurements, and characterization of transport properties. The report showed large uncertainties and unexpected results, so no precise carrier properties are portrayed as validated.
- **IVerify** describes an external clip-on tubing-force sensing concept, an analog front end, threshold and microcontroller logic, and a simplified two-LED proof-of-concept prototype, separately from the intended three-state final design. It is not a clinically approved medical device.
- **Three-link biomechanics** remains a completed simulation. Aspirations to develop future prosthetic or assistive devices are explicitly future-focused, not claimed as completed hardware.
- **Research interests** mention reliable robotic sensing and assistive technologies without presenting grant proposal performance targets as achieved.

The EE291 power-line numerical-methods document is an assignment prompt, not evidence of a completed implementation, so no completed solver project was added. Sensitive personal details from the scholarship statements and proprietary engineering measurements are not published.

The shelf now has fourteen books in two rows of seven. The keyboard's up/down navigation moves between those rows. Existing interactive book animation, GitHub links, JPEG and MP4 paths, and resume links are unchanged. Only HTML, JavaScript, CSS, and project documentation are committed.


## Mobile reading and purposeful space motion (October 2026)

- Two seven-book shelves remain native horizontal scroll regions on mobile, with scroll snapping, larger touch targets, and visible swipe hints. Visitors can use the **Next collection** / **Previous collection** actions to move between shelf groups.
- The open-book dialog keeps the same two-page story on desktop and displays **only one readable page at a time** on mobile, with larger text, more room for content and explicit page-turn labels.
- **Return to Bookshelf** closes the dialog. The script restores the visitor's vertical scroll position, both shelf scroll offsets, and keyboard focus without an unwanted jump.
- Each book remembers its last-opened story/details page for the current browser session while that website page remains loaded. It does not store progress on the server or in browser storage.
- The homepage has one CSS-shape orbital accent near the introduction. Two faint constellation lines draw when scrolled into view. Tiny stars animate only when visitors click collection-navigation controls. Earlier scattered animated decorations were disabled to make the theme intentional.
- All new animations respect \`prefers-reduced-motion\`; content, navigation and the two-page reader work with animations disabled.
- No photographs, videos, resumes or uploaded academic files were published or modified. All existing media paths remain unchanged.

Only \`index.html\`, \`bookshelf.css\`, \`bookshelf.js\`, \`ux.css\`, \`ux.js\`, and this README changed.


## Two-shelf engineering library

The portfolio displays all **14 project books on two shelves with seven books each**. This intentionally returns to the simpler, more compact two-shelf presentation.

- **Volume I: Robotics & Digital Systems (seven books):** NASA Robotics, UR3e Analysis, 3-Link Leg Simulation (plum); STM32 Security, STM32 Motor, VHDL Logic, and Pipelined ALU (muted blue).
- **Volume II: Sensing & Engineering Tools (seven books):** IVerify, Thermal Logger, Virtual VNA, Hall Measurements, ProDriver, HueMotion, and DMX Controller (dusty rose).

The three color families remain, but the visible bookshelf uses only two labeled rows. The lighting controller is grouped with practical engineering tools.

Hovering over or keyboard-focusing any book displays its existing technical subtitle in a description beneath that shelf. Keyboard arrow navigation works within and between the equally sized seven-book rows; Previous/Next inside the reader follows the displayed shelf order.

Horizontal swiping, the book-opening animation, saved reading and scroll position, Return to Bookshelf, and the subtle star effect on the two shelf-navigation buttons remain intact. No JPEG, MP4, PDF, or other asset was uploaded or changed.


## Focused homepage and concise project summaries (October 2026)

The visitor journey now starts with a shorter hero that explicitly identifies Kailani as an electrical engineer, NASA Marshall OSTEM intern, and M.S. Electrical Engineering student. It presents exactly **two primary hero actions**: **Explore My Work** (scrolls to the engineering bookshelf) and **View Resume** (opens the existing resume PDF).

- The interactive **two-shelf bookshelf** is now the first substantial section after the hero. Its 14 book descriptions, animations, keyboard controls, mobile swipe and reading-position behavior remain unchanged.
- The redundant three-card navigation row is removed.
- The separate About section is more focused and continues to preserve education, honors, and mentoring context.
- Featured NASA work remains as a concise one-card highlight with 34 requirements, six scenarios, and the high-vacuum target. Four duplicate expanded project cards and their detail panels were removed from the homepage; the underlying projects and substantive technical descriptions remain available in the books.
- The five public GitHub code cards now have short summaries, technology tags, and source links. Longer duplicated card details were removed. Search and category filters remain available behind an optional **Filter or search repositories** control, and both MP4 demonstrations remain referenced as before.
- CSS reduces unnecessary hero height and card spacing, preserving responsive accessibility and the existing gentle space animation motifs.

The changes do **not** upload or alter any JPEG, MP4, PDF, or confidential source document. The existing image, video, resume, and GitHub repository links remain unchanged. The interactive arm, timeline, and remaining professional sections are preserved.


## Unique book colors and title fitting

All 14 books now have individual, coordinated cover colors rather than three repeated shelf-wide colors. The two shelves and seven-books-per-shelf arrangement stay unchanged. The palette uses blush, plum, blue, sage, copper, jade, ochre/gold, wine, and lavender; dark enough for legible ivory title lettering.

Every spine title keeps its full visible name. On desktop and mobile the default book jackets are slightly taller to give rotated lettering more space. \`bookshelf.js\` also measures each title against the available spine height using the browser canvas text metrics. If necessary it adjusts the font to fit, then extends the spine rather than cutting the title off. It repeats the measurement after the web font loads and on viewport resize/zoom changes. No project names are abbreviated, hidden or replaced by ellipses.

The selected book's opening cover still matches its spine color. Existing descriptions, hover and keyboard-focus previews, two-shelf navigation, mobile swiping, return-to-bookshelf and saved reading positions remain intact. Only \`index.html\`, \`bookshelf.css\`, and \`bookshelf.js\` and this documentation changed. All media assets remain untouched.


## New source-backed engineering work (October 2026, 16 books)

Seven additional course lab reports, the EE421 Hall project report, and UNR laboratory training history were reviewed. The portfolio now holds **16 interactive project books on two shelves of eight**, continuing the two-shelf preference and retaining individual spine colors, the title-fitting system, interactive pages, keyboard previews, mobile swipe and reading-position restoration.

- **Control & Measurement Labs (EE370L, 2025)** consolidates four collaborative labs into one engineering case study: strain-gauge/Wheatstone half-bridge calibration, response testing on a metal strip, RLC and DC-motor frequency response, MATLAB P-controller design, and op-amp PID controller implementation. The lab reports showed noisy measurements and significant divergence between model and bench results, including roughly 10x timing differences for P-controller measurements and some PID error exceeding 50%. These discrepancies are presented candidly as setup and validation lessons rather than successful calibration or verified system performance.
- **PowerShell Systems & Concurrency (CS646, 2026)** consolidates three coursework labs: system and software inventory inside a Linux container; CSV sorting with full-row integrity, SHA256 input verification and append-only logs (plus 300,000-row serial/parallel comparisons); and synchronized PowerShell concurrency across 102 requests with throttling at ten tasks, logging and race-condition testing. One reported workload took 8.69 seconds serially versus 1.68 seconds concurrently, and locking changed a corrupted counter result of 2 to the expected 100.
- **Hall-effect wafer characterization** is already represented by an existing book; the new EE421 report reinforces the treatment of large uncertainties and anomalous transport values, and no duplicate book was created.
- **UNR laboratory safety training** was documented as online plus hands-on training in September 2025, and is included in the About credentials without implying a professional certification.

The original submitted coursework files and training PDF are **not hosted, linked, or included as GitHub repository assets**. Only short public project summaries and one factual training credential appear on the site. Lab and team projects remain clearly identified as collaborative where applicable. No confidential personal identifiers from the training history are published. This update modifies only \`index.html\`, \`bookshelf.js\`, \`bookshelf.css\`, and this README.


## Understated Mexican and Samoan floral details

A few static botanical illustrations now complement the existing space-oriented design:

- A tiny pairing of **Mexican cempasúchil-inspired marigold** and **Samoan plumeria-inspired blossom** accents sits at the margin of the NASA introduction image.
- A faded marigold-like floral line drawing appears near the engineering bookshelf heading.
- A muted plumeria flower frames a corner of the About portrait.

The flowers use only the existing blush, dusty-rose, plum and lavender family, with low opacity; they do not obstruct page text, interactive controls or project book spines. Mobile styling reduces their size and opacity. These are original lightweight inline SVG vector shapes stored in the site HTML and styled with the new \`botanical.css\` file, not stock graphics, photography, or additional downloaded files.

The **planet orbit, constellation reveals, collection star trails, and book animations remain intact**. The botanical decorations do not animate and are marked \`aria-hidden\`, with pointer interaction disabled. The existing reduced-motion behavior of the space animations is unchanged. The previous two-shelf engineering library (16 books, eight on each shelf) and all projects remain.

No media assets, resume PDF, user-uploaded course reports, or training records were modified or uploaded. Changed paths are \`index.html\`, \`botanical.css\`, and this documentation.


## Soft ambient space visualizations (October 2026)

The website uses separate ambient.css and ambient.js files to introduce **understated background visuals** without replacing the existing content, the two-shelf library or the culturally inspired botanical drawings.

- **Hero:** A few widely spaced twinkling dots, a pale orbit line with a single slowly revolving dot, and faint blush/lavender glows. The pre-existing planet still moves independently.
- **Bookshelf:** A sparse backdrop of very small stars and a low-contrast gradient glow. Both shelves and the existing 16 clickable book spines remain unobstructed.
- **About and featured NASA work:** Stationary, low-opacity background glows. Mexican marigold and Samoan plumeria accents retain their original SVG artwork and gain only an almost imperceptible 3px vertical drift.
- **GitHub/code:** A faint CSS drafting grid sits behind the repository cards and their accessible controls.
- **Contact:** A few dim stars and a short, rare shooting-star stroke. A visibility observer pauses the comet's animation while the contact section is offscreen.
- **Scroll:** Selected headings and project/code cards appear with a small one-time fade-up when they enter the viewport. The elements remain fully readable if JavaScript is disabled or IntersectionObserver is unavailable.

Only decorative CSS gradients, borders and inline HTML spans are used. No external images, animation libraries, canvases or high-frequency scroll handlers were added. Existing constellation drawing transitions, collection navigation star trails, planet, and interactive book animation are preserved.

Accessibility: all decorative groups have aria-hidden=true and pointer-events:none. Reduced-motion users see a fully readable static layout; twinkling, orbit travel, floral drift, comet and scroll reveals are disabled. Mobile CSS scales back the visual density, and forced-colors/print views suppress purely decorative effects.

This release updates index.html, adds ambient.css and ambient.js, and updates README.md. User-owned JPEG, MP4, resume PDF, and uploaded course records are **not touched**.


## Consistent ambient visuals throughout every section

The user requested that background visualizations feel continuous across the *whole* portfolio, not only the introduction. Every one of the eleven main sections now contains a small, non-interactive CSS starfield. The same muted blush/plum/lavender glows, two existing constellations, and very slow orbital language connect the layout end-to-end.

- **Hero and bookshelf:** Retain the previously added starfields, orbital sketch, planet, project-library glows and quiet decorative flowers.
- **About, NASA feature and GitHub:** Gain unobtrusive twinkling points near section margins. The code section retains its faint engineering drafting grid.
- **Robot lab, experience and resume:** Gain three very faint ellipse/orbit sketches with tiny slowly moving dots, placed behind the existing content and controls.
- **Skills:** Gains the shared star-and-glow background.
- **Interests and contact:** Gain low-opacity plumeria and Mexican marigold SVG watermark motifs in background margins, reusing existing symbols. The contact comet remains rare and subtle.
- **Scrolling:** Existing headings and code cards continue to reveal gently; the About and Robot introduction, timeline entries, skills blocks, resume panels, and contact introduction now use the same one-time reveal.
- **Performance:** A single IntersectionObserver watches the site's ambient section fields, animating decorative stars/orbits only while their sections are visible. No scroll polling, downloaded imagery or external animation libraries.
- **Accessibility:** Decorative layers remain aria-hidden and pointer-events:none; users with reduced-motion preferences receive a static presentation. Content is readable without JavaScript, and mobile, high-contrast and print views reduce or suppress the effects.

No existing site media, PDFs, source documents, book titles, interactive controls, or images were added, uploaded, renamed or changed. This update modifies index.html, ambient.css, ambient.js and README.md only.


## Background-visibility correction and cache refresh

A follow-up review found that the previously published global starfields were technically present across all 11 sections but often almost invisible: some points were 2–3 CSS pixels, surrounding rings had extremely low opacity, and gradient glows were similarly faint. That made the newer layout appear unchanged at standard zoom.

This revision adds a **noticeable, but still restrained star-map illustration to the background edge of each of the 11 primary sections**, using the same muted floral/space palette. It also increases the legibility of the small stars, orbit outlines, and soft glows without placing animations over text, books, or interactive controls. The patterns gently drift by a few pixels only when their section is on screen, and all motion stops under reduced-motion settings.

HTML references the updated ambient stylesheet and script with a version query to reduce stale browser-cache issues. The project bookshelf still holds 16 books on two shelves; original marigold/plumeria symbols, planet, page-turn effects, robot lab, images, videos and resume PDF remain unchanged. No new media or third-party resources were added.

The code is validated in GitHub, but its final appearance should be checked on a deployed desktop and mobile browser. If an old version remains visible, hard-refresh the page.


## Nonoverlapping Mexican and Samoan floral redesign

After visual feedback that the previous effects were overlapping, the eleven repeated background constellation maps and the flower illustrations pinned to photo corners and headings were removed from the HTML. Their positions were competing with headings, photos, and other decorative space elements at some viewport widths.

Four small **botanical dividers in normal document flow** now separate sections. Each divider pairs a culturally grounded Mexican floral motif with a Samoan floral motif: Mexican **cempasúchil marigold** or **dahlia** alongside Samoan **teuila (ginger)** or **plumeria (frangipani)**. They are muted blush/plum/lavender line-art SVGs and are not external image files. The Teuila illustration is an upright spray of pointed red-ginger-inspired bracts, rather than another generic five-petal blossom. The dahlia illustration has two rings of elongated petals.

Unlike earlier absolutely positioned flowers, the dividers occupy their own horizontal strip and do not overlap text, book spines, images or navigation. On phones their sizes and spacing shrink. The previously added two constellation separators are given positive margins, and the extra background orbital sketches are hidden on mobile to avoid collisions.

The small background stars, existing planet animation, two constellation separators, section glows, gentle reveals, and 16 books on two shelves are preserved. The original photos, videos, resume PDF, and other user assets remain unmodified. The ambient and botanical stylesheets receive a cache-busting version to make the revised layout visible after GitHub Pages deploys.

Changed files: index.html, botanical.css, ambient.css, README.md. No binary media files were added or changed.


## Floating background flowers and continuous section spacing

The floral divider rows previously inserted between the site sections caused visually inconsistent gaps. They have been removed completely; section heights and spacing are now determined by the original layout instead of extra separator elements.

The same four cultural flower motifs (Mexican cempasúchil marigold and dahlia; Samoan teuila and plumeria) appear as eight low-opacity inline SVG drawings **inside existing, non-interactive background layers**, alternating at section margins. They have absolute positioning only within those background layers; no flowers sit between sections, and no new external images are loaded. The page copy, photos, books, buttons and cards remain above the backgrounds.

The two older constellation illustrations are preserved but moved into section backgrounds so they do not create inter-section space; they are hidden on small screens. Stars throughout all eleven sections now have a slow, small vertical floating movement in addition to soft twinkling. Existing visibility-aware animation pausing and reduced-motion support remain intact.

The two-shelf layout, all 16 books, space planet, orbital details, and original media assets remain unchanged. This release edits only index.html, botanical.css, ambient.css, and README.md. Stylesheet references are versioned to limit stale cached CSS.


## Portfolio refinement: spacing, reading-room polish and code hygiene (October 2026)

The engineering portfolio was refined without changing its two-shelf, sixteen-project structure or any user-owned media:

- **One spacing system:** Section padding, heading spacing, and narrow-screen rhythm are now driven by shared layout tokens. Bookshelf and NASA featured work keep slightly more generous spacing without adding separate content-free rows.
- **Cultural floral details:** Mexican marigold/dahlia and Samoan teuila/plumeria SVG motifs remain lightly drawn behind existing content. They have controlled, intentionally varied sizes and positions and become smaller/fainter on mobile.
- **Space visual hierarchy:** The original intro planet, ambient stars and the robot-lab orbit remain the visual anchors. The ambient stylesheet no longer contains three competing definitions of the star-twinkle animation, and it no longer contains the obsolete repeated star-map component.
- **Bookshelf interaction:** The previously opened book has a clearer but gentle outline. Focus indication and per-shelf preview feedback are stronger; phones have a more explicit eight-book swipe hint, a visible horizontal scroll track, and snap-to-spine browsing. Title fitting and remembered reading/scroll position remain.
- **Project narratives:** Page labels prioritize design methods and results. NASA's outcome now clearly describes a requirements-driven *assessment*, not a deployed robotic system. The featured NASA card opens its corresponding book directly, with a normal bookshelf-link fallback when JavaScript is off.
- **Functional correction:** The PowerShell Systems & Concurrency book record was mistakenly embedded as a second argument to the opening animation timer in a previous release. It now resides inside the book-data array as the sixteenth record, and the proper opening animation timer argument is restored.
- **Accessibility and performance:** CSS focus-visible treatment, reduced-motion behavior, responsive spacing, the native book dialog, visibility-paused decorative animations, and safe fallback content remain.

Only website HTML/CSS/JS files and README documentation changed; no JPEGs, videos, PDFs, course reports, or other binary user media were modified or uploaded. CSS/JS asset references are versioned to reduce stale-browser-cache issues.


## Engineering-first portfolio presentation (October 2026)

This pass makes the page immediately identifiable as an electrical-engineering, robotics, and systems-validation portfolio while retaining the previously established muted palette, space motifs, Mexican and Samoan flowers, and interactive two-shelf library.

**Content and information hierarchy**
- The hero now leads with the engineer's full name, robotics and systems-validation focus, NASA Marshall OSTEM assessment work, and the University of Nevada, Reno electrical-engineering M.S.
- A small three-column technical focus legend highlights real project categories: robotics/kinematics, STM32/VHDL embedded hardware/firmware, and instrumentation/requirements-driven verification. This is within the hero, not a spacer between sections.
- The bookshelf is introduced as 16 engineering case studies rather than decorative stories; the existing book pages still contain challenge, methods, tools, outcomes, and sourced project details.
- The featured NASA case study now explicitly states that it was an **evaluation of a legacy arm**, not deployed hardware. An assessment-path panel shows geometry, actuator limits, and verification. The previously sourced values of 34 requirements, six scenarios, and a 10^-7 torr target are retained.
- Technical headings across the code, robot lab, toolkit, and resume sections emphasize engineering purpose, while the interests and personal sections retain warmth. The About paragraph identifies the actual technical domains and the approach of testing assumptions rather than claiming unverified performance.

**Visual engineering language**
- A new `engineering.css` file, loaded after the existing styles, applies graphite/navy technical typography and instrument-label monospace to small labels, results, and project metadata. Serif headings and the rose/plum identity remain.
- Lightweight drafting-grid textures sit behind the software, NASA, robot, and tools sections, never over interactive controls or project books. The NASA path uses semantic HTML in a compact, labeled sequence rather than a made-up data plot.
- The 8 Mexican/Samoan background flower assets, 36 soft floating stars, 16 multicolored book spines, 2 shelves, animations, reduced-motion support, and media are unchanged.
- Mobile-specific styling keeps the engineering-focus labels and assessment path readable without inserting any between-section spacers. No external visual libraries, third-party assets, photographs, videos, or documents are added.

Only `index.html`, `engineering.css`, and this README are changed. Existing GitHub Pages media assets and user-owned files remain untouched.


## ROS2 and Thermal Desktop skills update

The engineering-focus legend and technical-toolkit section now explicitly name **ROS2** under Robotics & Controls and **Thermal Desktop** under Design & Validation. These additions identify the tools without implying a particular proficiency level, project result, or certification. The existing two shelves, 16 project books, space and floral effects, page layout, and user-owned media are unchanged. This update touches only `index.html` and this README.


## Source-grounded engineering case studies (October 2026)

Three expanded technical case studies are now placed **within the existing NASA/Engineering Work section** (not as empty separators). Their anchor IDs are case-nasa, case-iverify, and case-controls.

- **NASA robotic-arm assessment:** Illustrates the decision chain from requirements and kinematic reach to actuator constraints and verification planning. Retains the already-documented 34 system requirements, six proposed scenarios, and 1e-7 torr vacuum target. Describes the assessment as an evaluation, not a vacuum-qualified robot or completed qualification tests. The diagram is a conceptual summary of engineering workflow, not a real workspace plot.
- **IVerify senior capstone:** Based on the student's Spring 2026 IVerify Final Report. Explains the force-sensing architecture (clamp/preload -> sensor -> analog conditioning/threshold -> MCU -> LEDs), the student's role in systems integration, and limited bench prototype findings. The report states roughly 5.0 N average preload within about ±10% of the target; two-LED state indications and observed analog threshold changes. It does not report comprehensive sensitivity/false-alarm distributions, demonstrate the complete three-color indicator, or support medical approval. The report and images remain private and were **not uploaded**.
- **Strain-gauge instrumentation:** Based on the submitted March 2025 EE370L Lab 7 report. Explains amplifier/bridge calibration and the experimental signal chain, with the selected cleaner strummed trace: reported 49.256 Hz, 610 mV peak voltage, and 6.335 ms time constant. These are reported values from a selected trace, not averaged performance data. No fabricated waveform plot or undocumented calibration is added.

Each dossier has a compact semantic flow diagram, explanatory text, clearly labeled evidence, and limitations. The bookshelf's existing project entries for these three projects now link to their corresponding case-study anchors, and the page links can open the matching books. A new case-studies.css file provides desktop/mobile styling, accessibility, and reduced-motion support.

A separate approved/safe-to-share project diagram or raw result is needed before adding actual plots, NASA internal figures, ROS2 node graphs, Thermal Desktop results, or IV medical-device performance metrics. Those were not invented.

Existing media (photos, MP4, resume PDF), 16 book spines on two shelves, 8 background floral accents, 36 stars, planetary motion and chapter interactions are unchanged.


## NASA integrated tool usage clarification (October 2026)

User-confirmed scope: ROS2 and Thermal Desktop were both used on **the same NASA Marshall robotic-arm project** for high-vacuum lunar-dust testing.

- **ROS2:** Used for **controlling and calibrating the robotic arm**. No unsupported claims are made about particular nodes, topics, controllers, calibration tolerances, or test accuracy.
- **Thermal Desktop:** Used for **thermal modeling of the robotic arm in high vacuum**. The site does not invent temperatures, thermal margins, simulation validation status, or assumed boundary conditions.
- Updated the portfolio hero, the NASA feature summary, the existing NASA experience timeline, the featured NASA engineering case study, and the corresponding project book to make the tools' specific roles and common NASA project clear.
- Added two compact tool-use panels *inside* the NASA case study without changing the page's section flow or adding decorative spacers.
- Preserved the previously grounded 34 system requirements, six planned scenarios, and 10^-7 torr target. These remain scope/constraints, not measured performance or completed qualification outcomes.
- Preserved all 16 book records/two shelves, three technical case studies, all user photos and media, and the background star and flower illustrations.


## NASA Thermal Desktop analysis modes (October 2026)

The user clarified that Thermal Desktop was used for **both steady-state and transient thermal analysis** of the NASA robotic arm in the high-vacuum lunar-dust testing project. The site now states both analysis types in the NASA feature, technical case study, tool-use panel, experience section, and NASA project book. ROS2 remains documented as the tool for **arm control and calibration** in that same project.

This clarification adds no estimated temperatures, heat loads, material properties, solver settings, validated margins, or completed qualification claims. Book/asset counts and existing media remain unchanged.


## Engineering portfolio navigation and verification release (October 2026)

The home page is now organized for rapid technical assessment:

1. Hero with direct navigation to engineering case studies and the resume.
2. NASA Marshall work (featured project).
3. Independent **Engineering Case Studies** section: NASA robotics, IVerify capstone, and instrumentation labs.
4. Interactive two-shelf library (exactly 16 project books; eight per shelf).
5. Public code, interactive robot lab, experience, skills, about, interests, resume, and contact.

The main navigation links directly to NASA Work, Case Studies, Bookshelf, Code, Robot Lab, Experience, and Resume. The academic case studies are no longer visually or semantically nested inside the NASA experience section. Existing section anchor IDs, crosslinks and the full book dialog are preserved.

### Engineering-content changes

- Reduced repetition across the NASA hero, feature, and detailed case study; each now serves a different scanning/depth purpose.
- Replaced the generic NASA case-study workflow figure with a **conceptual parallel-workstreams systems architecture**: design constraints feed ROS2 arm control/calibration and Thermal Desktop steady-state/transient high-vacuum modeling, with the work interpreted in requirements and verification planning. The diagram **does not claim direct ROS2/Thermal Desktop software integration**.
- Added a dedicated technical status matrix to all three case studies: activities/requirements, methods, and documented result or verification status.
- NASA status uses the reported 34 requirements and six *planned* test scenarios, without inventing calibration precision, thermal margins, vacuum qualification or completed testing.
- IVerify status preserves the senior capstone's preliminary bench findings and distinguishes the two-LED prototype from clinical/three-color requirements.
- The instrumentation case references the selected EE370L lab waveform and avoids fabricated averaged results.
- Source reports, NASA internal images, raw data and user-owned media **were not published or modified**.

### CSS, accessibility and search metadata

- The deployed HTML now loads **one local `portfolio.css` bundle** rather than eight separate CSS files. All original CSS source stylesheets remain in the repository. The zero-dependency `build-css.js` script concatenates the eight sources in the **original cascade order**, intentionally preserving visuals and styling behavior rather than deleting rules without browser regression testing. Run `node build-css.js` after changing CSS source.
- The new case-studies CSS includes readable layouts at mobile widths, keyboard-scrollable verification tables, accessible table headings and captions, visible focus styling, high-contrast fallbacks, and reduced-motion support.
- Added a vector `favicon.svg`, canonical link, absolute Open Graph image URL, social-sharing metadata, `robots.txt`, and `sitemap.xml`.
- Existing 16 book spines/two shelves, space/flowers, project links, robot lab, photos, two videos and resume PDF remain in place.

Static validation confirms HTML structure, unique IDs, internal anchors, book-data alignment, source-asset references, syntax, CSS order and bundle contents. Live visual/browser and Lighthouse performance tests should still be run on the deployed site; no unmeasured performance score is claimed.


## Animated celestial background (October 2026)

- Retained the site's original sparse stars (36) and added three in the new standalone case-study background, bringing the total to 39 real star elements.
- Stars now softly **fade/blip in and out while drifting a few pixels** over 18–25-second cycles with varied phases. Each background layer includes two additional tiny pseudo-element stars, with similarly slow pulses. No sharp flashes or fast jumps.
- Added **six small rotating pastel planets** as decorative children of the existing background layers in NASA Work, Engineering Case Studies, Bookshelf, Robot Lab, Experience, and Interests. Each consists of a CSS-shaded sphere with a slowly rotating texture, an independently rotating translucent ring and a gentle hover. These are behind the real content and never clickable.
- The existing hero intro planet remains in place; its shaded core also rotates slowly.
- Colors are muted rose/lavender/sage and keep the Mexican and Samoan flower shapes visible. No photos, video, resume, project files, SVG flower symbols, or book data were changed.
- Motion is paused while its section is offscreen by the site's existing `ambient-active` observer, and fully disabled for `prefers-reduced-motion: reduce`. The planet graphics and extra stars are hidden in forced-colors and print modes. Mobile sizes are smaller and lower opacity.
- This update modifies `index.html`, `ambient.css`, the exact rebuilt `portfolio.css` bundle, and these documentation notes. To regenerate: `node build-css.js`.


## Engineering graph paper, featured projects, and 16 project pages (October 2026)

A recruiter-oriented follow-on improves discoverability and evidence clarity while preserving the celestial and floral theme.

### New layout and design
- Replaced the earlier decorative graph-grid treatment with **engineering drafting paper**: very light blue-grey 20 px minor grid subdivisions and darker 100 px major grid lines (five subdivisions per major cell) behind sections. Text, cards, books and controls remain on an opaque or near-opaque surface. The graph is decorative only, not a data axis, and is omitted in print or forced-color mode.
- Added a compact **Featured Engineering Work** row directly after the hero, with direct links to NASA Robotics, IVerify, Controls & Instrumentation, and the 16-project directory. The interactive bookshelf remains unchanged and immediately follows the detailed cases.
- Clarified the bookshelf title as **The engineering library** rather than a duplicate case-study heading, and linked the all-project directory.
- Added a concise **My contribution** panel to each of the three featured case studies, distinguishing first-person NASA tools work, IVerify lead/integration responsibility, and partner-based instrumentation work.
- Added a direct route from each major case study to its static project detail page.

### Individual project pages
- Created **`projects/index.html`**, a simple, no-script directory of 16 projects, and **16 static project URLs** such as `projects/nasa.html`, `projects/iverify.html` and `projects/motor.html`.
- Each detail page uses the existing bookshelf project facts for the problem, approach, tools, documented outcome, and evidence limitations. Where a team role is explicitly documented, it is included, without inventing individual contributions.
- Existing public GitHub repositories are linked directly where present; the site's published HueMotion and lighting demonstration videos appear in their relevant project pages. The existing NASA laboratory photograph is labeled as context, *not* as a photo of the evaluated robotic arm.
- Every bookshelf book now links to its own direct, shareable static page. The static detail pages link back to the corresponding case study where applicable, as well as to the original bookshelf and directory.
- The sitemap now lists the homepage, project directory, and all 16 project pages.

### Build and verification
- Added `project-pages.css` after `case-studies.css` in `build-css.js`; `portfolio.css` remains the single served local stylesheet, built by concatenating **nine** source CSS files in cascade order with `node build-css.js`.
- No new raw charts, ROS2 screenshots, NASA internal documentation, invented thermal margins, IVerify clinical claims, or unapproved third-party media were published. Actual experimental figures need approved/shareable source artifacts.
- Updated styles include responsive featured cards, project-detail layout, obvious keyboard focus, high-contrast/print behavior and reduced-motion support. Real-browser screenshot, screen-reader and Lighthouse audits remain worthwhile follow-ups and are *not claimed completed*.
- Kept the original 16 interactive books (8 per shelf), decorative flowers, stars, orbiting planets, photos, videos, resume, and project-dossier evidence intact.
