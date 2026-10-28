/* Static portfolio checks. Run with: node scripts/site-check.js */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const domain='https://engrkailani.github.io';
const projectDir=path.join(root,'projects');
const htmlFiles=['index.html','resume.html',
  ...fs.readdirSync(projectDir).filter(name=>name.endsWith('.html')).map(name=>'projects/'+name)];
let checks=0,failed=0;
function check(condition,message){
  checks++;
  if(!condition){failed++;console.error('FAIL '+message)}
}
for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  // Avoid dead in-page navigation and duplicate target IDs.
  const pageIds=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]);
  const pageIdSet=new Set(pageIds);
  check(pageIds.length===pageIdSet.size,file+': duplicated HTML id');
  for(const match of html.matchAll(/\bhref=["']#([^"']+)["']/g)){
    let targetId=match[1];
    try{targetId=decodeURIComponent(targetId)}catch{}
    check(pageIdSet.has(targetId),
      file+': broken in-page anchor #'+targetId);
  }

  check(/<title>[\s\S]+?<\/title>/.test(html),file+' needs a document title');
  check(html.includes('portfolio-upgrade.css'),file+' missing responsive stylesheet');
  check(html.includes('portfolio-upgrade.js'),file+' missing behavior script');
  check(html.includes('<meta property="og:image"'),file+' missing preview image');
  check(html.includes(domain),file+' missing canonical domain');
  check(!html.includes('https://kalarcon775.github.io'),file+' references former portfolio host');
  // Uploaded October 2026 résumé names this account; keep its text faithful.
  check(file==='resume.html' || !html.includes('https://github.com/kalarcon775'),file+' references former GitHub username');
  for(const match of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)){
    const url=match[1].trim();
    if(!url || /^(?:#|[a-z]+:|\/\/)/i.test(url))continue;
    const local=url.split(/[?#]/)[0];
    if(!local)continue;
    const target=path.resolve(root,path.dirname(file),local);
    check(target.startsWith(root+path.sep)||target===root,file+': path escapes repository: '+local);
    check(fs.existsSync(target),file+': missing asset or page '+local);
  }
  const seen=new Set();
  for(const match of html.matchAll(/\sid=["']([^"']+)["']/g)){
    check(!seen.has(match[1]),file+': duplicate id '+match[1]);
    seen.add(match[1]);
  }
}
// Large technical diagrams scroll horizontally on mobile; keyboard users need focus.
for(const file of htmlFiles.filter(name=>name.startsWith('projects/'))){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const unfocusable=[...source.matchAll(/<figure class="(?:project-visual-gallery__figure|iverify-concept-figure)"(?![^>]*tabindex="0")[^>]*>\\s*<img\\b/g)];
  check(unfocusable.length===0,file+': scrollable technical diagrams must be keyboard-focusable');
}
const thermalHtml=fs.readFileSync(path.join(root,'projects/thermal.html'),'utf8');
check((thermalHtml.match(/<figure tabindex="0">/g)||[]).length===3,
  'Thermal controller mobile diagrams need keyboard-scrolling focus');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const htmlResume=fs.readFileSync(path.join(root,'resume.html'),'utf8');
check(htmlResume.includes('aria-label="Open one-page résumé PDF for printing"') &&
      !htmlResume.includes('onclick="window.print()"'),
      'Résumé print action must open the verified one-page PDF');

check(htmlResume.includes('href="https://github.com/EngrKailani"') &&
      htmlResume.includes('href="mailto:kailanip.alarcon@gmail.com"') &&
      htmlResume.includes('linkedin.com/in/kailani-alarcon'),
      'HTML résumé must include working GitHub, email and LinkedIn links');
check(!htmlResume.includes('https://github.com/kalarcon775'),
      'HTML résumé should link to the verified connected GitHub account');
check(fs.existsSync(path.join(root,'assets','Kailani_Alarcon_Resume_Full_Detail.pdf')),
      'Legacy alternate résumé path must still serve an updated PDF');
check(htmlResume.includes('Aug. 2026 - Dec. 2026') &&
      htmlResume.includes('Performed load analysis using Creo mass properties') &&
      !htmlResume.includes('27.23 lbf-in'),
      'HTML résumé must match the uploaded NASA dates and load-analysis description');
const resumeGenerator=fs.readFileSync(path.join(root,'scripts/build-resume-pdf.py'),'utf8');
check(resumeGenerator.includes('Aug. 2026 - Dec. 2026') &&
      resumeGenerator.includes('Performed load analysis using Creo mass properties'),
      'PDF generator must match the uploaded NASA dates and accomplishment');
check(htmlResume.includes('<h1>Kailani Alarcon</h1>') &&
      !htmlResume.includes('<p class="resume-professional-headline">'),
      'HTML résumé should match the uploaded header');

const currentResume=path.join(root,'assets','Kailani_Alarcon_Resume.pdf');
check(fs.existsSync(currentResume) && fs.statSync(currentResume).size>30000,
  'A complete October 2026 resume PDF must be deployed at the canonical asset path');
for(const phrase of ['Performed load analysis using Creo mass properties','34 hierarchical system requirements',
  '12+ LED products','236 points','57,600 and 115,200 baud']){
  check(htmlResume.includes(phrase),
    'The HTML resume must reflect uploaded resume evidence: '+phrase);
}
check(htmlResume.includes('Kailani_Alarcon_Resume.pdf?v=20261014-resume'),
  'HTML resume PDF download must use the newest cached version');

// All 15 cases explain ownership, methods, results and evidentiary limits.
const caseTitles=['iverify','controls','ur3e','thermal','alu','dmx','fingerprint',
  'hall','huemotion','leg','motor','powershell','prodriver','vhdl','vna'];
const evidenceHeadings=['Problem','My contribution','Engineering tools',
  'Validation method','Documented result','Limitations'];
for(const slug of caseTitles){
  const source=fs.readFileSync(path.join(root,'projects',slug+'.html'),'utf8');
  check(source.includes('class="project-evidence-first"') &&
    source.includes('case-study-summary.css') &&
    evidenceHeadings.every(title=>source.includes('<h3>'+title+'</h3>')),
    slug+': evidence-first summary must cover all six questions');
}

/* Contact and résumé should be reachable without scrolling to the footer. */
check(home.includes('class="nav-cta" href="assets/Kailani_Alarcon_Resume.pdf?v=20261014-resume"') &&
  home.includes('aria-label="View résumé PDF in a new tab"'),
  'Main navigation must link directly to the résumé PDF');
check(home.includes('class="featured-next-step"') &&
  home.includes('href="mailto:kailanip.alarcon@gmail.com?subject=Engineering%20Opportunity"') &&
  home.includes('class="featured-next-step-links"'),
  'Featured projects need clear contact and résumé follow-up links');
check(fs.readFileSync(path.join(root,'portfolio-upgrade.css'),'utf8')
  .includes('.featured-next-step-links .btn'),
  'Featured project actions need mobile-responsive styles');


/* Subtle background star density without obscuring portfolio content. */
const ambientFields=[...home.matchAll(/<div class="ambient-field(?: ambient-field-[^"]+)*" aria-hidden="true">/g)];
const addedStars=[...home.matchAll(/<span class="ambient-star ambient-star--extra(?: ambient-star--mobile)?" style="[^"]+"><\/span>/g)];
check(ambientFields.length===11&&addedStars.length===44&&
  (home.match(/<span class="ambient-star"><\/span>/g)||[]).length===36 &&
  addedStars.filter(m=>m[0].includes('ambient-star--mobile')).length===22,
  'Decorative fields should have 44 new moving stars (two mobile stars per scene) while preserving all originals');
const moreStarsCss=fs.readFileSync(path.join(root,'homepage-refinement.css'),'utf8');
check(home.includes('homepage-refinement.css?v=20261013-plum-backdrop1') &&
  moreStarsCss.includes('.ambient-field .ambient-star--extra') &&
  moreStarsCss.includes('.ambient-star--extra:not(.ambient-star--mobile)') &&
  moreStarsCss.includes('@media(prefers-reduced-motion:reduce)') &&
  moreStarsCss.includes('animation:none!important'),
  'New stars should retain responsive and reduced-motion-safe styles');
const directory=fs.readFileSync(path.join(projectDir,'index.html'),'utf8');

const paperDirectoryPreviews=[...directory.matchAll(/class="directory-card-visual directory-card-visual--paper"/g)];
const directoryThumbStyles=fs.readFileSync(path.join(projectDir,'directory-thumbnails.css'),'utf8');
check(paperDirectoryPreviews.length===2 &&
  ['gesture_scene_map.svg','lab_workflows.svg'].every(name=>directory.includes(name)) &&
  directoryThumbStyles.includes('.directory-card-visual--paper::after') &&
  directoryThumbStyles.includes('mix-blend-mode:multiply') &&
  directoryThumbStyles.includes('background:linear-gradient(145deg,#d7c0d7'),
  'Directory thumbnail surfaces must use plum rather than white, including three originally light SVG previews');


const wayfindingPaths=[
  ['robotics',2],['embedded',4],['measurement',5],['software',4]
];
const pathwaySection=home.match(/<nav class="work-pathways"[\s\S]*?<\/nav>/)?.[0]||'';
check(wayfindingPaths.every(([area,n])=>
  pathwaySection.includes('href="projects/index.html?area='+area+'"') &&
  (directory.match(new RegExp('data-gallery-category="'+area+'"','g'))||[]).length===n) &&
  home.includes('href="projects/index.html">View all 15 projects') &&
  home.includes('href="#explore">Interactive</a>'),
  'Engineering wayfinding should expose all fifteen projects and accurate discipline counts');
check(directory.includes('class="directory-breadcrumb"') &&
  directory.includes('id="directory-clear"') &&
  directory.includes('../site-ux.css?v=20261013-wayfinding1') &&
  home.includes('site-ux.css?v=20261027-workbench1') &&
  fs.existsSync(path.join(root,'site-ux.css')),
  'The project directory needs breadcrumbs, clear filters and responsive wayfinding styles');
const upgradedDirectoryJS=fs.readFileSync(path.join(root,'portfolio-upgrade.js'),'utf8');
check(upgradedDirectoryJS.includes('restoreDirectoryFromUrl()') &&
  upgradedDirectoryJS.includes("url.searchParams.set('area',category)") &&
  upgradedDirectoryJS.includes("url.searchParams.set('q',query)") &&
  upgradedDirectoryJS.includes("history.replaceState("),
  'Project searches and discipline filters must be shareable by URL');

const menuMarkup=home.match(/<details class="nav-projects" id="projects-nav-menu">([\s\S]*?)<\/details>/)?.[1]||'';
const menuItems=[...menuMarkup.matchAll(/href="projects\/([^"]+\.html)"/g)].map(m=>m[1]).filter(name=>name!=='index.html');
const directoryItems=[...directory.matchAll(/<a class="featured-project-card" data-gallery-category="[^"]+" href="([^"]+\.html)"/g)].map(m=>m[1]);
check(menuItems.length===15&&new Set(menuItems).size===15&&
  directoryItems.length===15&&directoryItems.every(name=>menuItems.includes(name)),
  'Homepage Projects menu must link directly to all 15 project pages, exactly once');
check(menuMarkup.includes('href="projects/index.html"') &&
  home.includes('projects-menu.css?v=20261012-projectsnav1') &&
  home.includes('scripts/projects-menu.js?v=20261012-projectsnav1') &&
  fs.existsSync(path.join(root,'projects-menu.css')) &&
  fs.existsSync(path.join(root,'scripts/projects-menu.js')),
  'Projects dropdown, directory link, accessible styling and behavior must be installed');

const thumbs=[...directory.matchAll(/<span class="directory-card-visual(?: directory-card-visual--paper)?"><img src="([^"]+)" alt="([^"]+)"[^>]*loading="lazy"[^>]*>/g)];
check(thumbs.length===15,'Project directory needs all fifteen image thumbnails');
check((directory.match(/class="directory-card-badge"/g)||[]).length===15,
  'Each project thumbnail must have a labeled evidence type');
check(directory.includes('directory-thumbnails.css'),'Directory must link scoped thumbnail CSS');
for(const [,source,alt] of thumbs){
  check(alt.length>24,'Project thumbnail requires meaningful alternative text');
  check(fs.existsSync(path.resolve(projectDir,source.split('?')[0])),
    'Project thumbnail image not found: '+source);
}
check((directory.match(/data-gallery-category=/g)||[]).length===15 &&
  directory.includes('id="directory-search"') &&
  directory.includes('data-gallery-filter="robotics"'),
  'Searchable categorized project directory must remain intact');


// Five repository planets remain visible, separated, and independently selectable.
const orbitCss=fs.readFileSync(path.join(root,'repo-orbit.css'),'utf8');
const repoJs=fs.readFileSync(path.join(root,'script.js'),'utf8');
check((home.match(/class="repo-planet"/g)||[]).length===5,
  'Five distinct repository planet buttons required');
check((home.match(/class="repo-card"/g)||[]).length===5,
  'All five original source cards must remain as a no-JS fallback');
check(home.includes('id="repo-featured"') && home.includes('id="repo-featured-link"'),
  'The featured project detail panel and its link must be present');
check(home.includes('id="repo-orbit-prev"')&&home.includes('id="repo-orbit-next"'),
  'Previous and next orbital controls required');
check(home.includes('id="repo-planetarium"')&&home.includes('repo-orbit.css'),
  'Solar-system stage and stylesheet required');
check(home.includes('<details class="repo-demos"'),
  'Video demos should remain collapsible');

const demoFigures=[...home.matchAll(/<figure class="video-demo"[^>]*>/g)].map(match=>match[0]);
check(demoFigures.length===2 && demoFigures.every(tag=>!/\shidden\b/.test(tag)),
  'Available demo video cards must not depend on metadata events to become visible');
check(['assets/huemotion-demo.mp4','assets/lighting-demo.mp4'].every(filename=>
  fs.existsSync(path.join(root,filename))),
  'Both displayed demonstration videos must exist');
check(!repoJs.includes("addEventListener('loadedmetadata'"),
  'Repository videos must remain visible before metadata loading');

check(repoJs.includes('function renderRepoOrbit()')&&repoJs.includes('function rotateRepo(direction)') &&
  repoJs.includes('function planetSlotStyle('),
  'Carousel must have stable positioning and navigation logic');
check(repoJs.includes('repoPlanetarium')===false && repoJs.includes("const repoOrbitStage"),
  'Ensure carousel uses the same stage reference throughout');
check(repoJs.includes("repoPlanets.forEach(planet=>planet.addEventListener('click'") &&
  repoJs.includes("function filterRepos()"),
  'Planet selection and search filtering must remain functional');
check(repoJs.includes("repoOrbitStage.addEventListener('keydown'") &&
  repoJs.includes("repoOrbitStage.addEventListener('touchend'"),
  'Carousel must support keyboard and touch input');
check(orbitCss.includes('prefers-reduced-motion:reduce') &&
  orbitCss.includes('.repo-planet{') &&
  orbitCss.includes('.repo-featured{'),
  'Planets must move with accessible, reduced-motion-aware styles');

check(orbitCss.includes('transition:none;') &&
  orbitCss.includes('.repo-orbit-shell.is-orbit-animated .repo-planet') &&
  repoJs.includes("repoOrbitShell.classList.add('is-orbit-animated')"),
  'Planets must not animate from a shared center during initial load');

let repositoryScriptParses=true;
try{new (require('node:vm').Script)(repoJs,{filename:'script.js'})}
catch(error){repositoryScriptParses=false;console.error(error.message)}
check(repositoryScriptParses,'Repository JavaScript must parse');
// Validate the visible planet positions against actual stage dimensions.
// Do not merely check bounding boxes: earlier planets overlapped each other/the sun.
for(const width of [280,284,320,375,390,550,700,701,820,980]){
  const mobile=width<=700;
  const stageHeight=mobile?368:430;
  const xSide=Math.min(335,width*(mobile?0.295:0.345));
  const xRear=Math.min(205,width*(mobile?0.235:0.215));
  const sizes=mobile?{
    front:Math.min(142,Math.max(108,width*.38)),
    right:Math.min(86,Math.max(66,width*.23)),
    left:Math.min(86,Math.max(66,width*.23)),
    'back-right':Math.min(70,Math.max(56,width*.18)),
    'back-left':Math.min(70,Math.max(56,width*.18))
  }:{front:154,right:108,left:108,'back-right':92,'back-left':92};
  const planets=[
    {slot:'front',x:0,y:mobile?80:106},
    {slot:'right',x:xSide,y:mobile?28:55},
    {slot:'back-right',x:xRear,y:mobile?-88:-96},
    {slot:'back-left',x:-xRear,y:mobile?-88:-96},
    {slot:'left',x:-xSide,y:mobile?28:55}
  ].map(p=>({...p,r:sizes[p.slot]/2}));
  const sun={x:0,y:mobile?65+32-stageHeight/2:52+52-stageHeight/2,r:mobile?32:52};
  planets.forEach((p,i)=>{
    check(Math.abs(p.x)+p.r<=width/2&&Math.abs(p.y)+p.r<=stageHeight/2,
      p.slot+' clipped at width '+width);
    check(p.slot!=='front'||p.y+p.r+24 <= stageHeight/2,
      'Featured planet label clipped at width '+width);
    check(Math.hypot(p.x-sun.x,p.y-sun.y)>=p.r+sun.r+5,
      p.slot+' overlaps sun at width '+width);
    planets.slice(i+1).forEach(q=>check(Math.hypot(p.x-q.x,p.y-q.y)>=p.r+q.r+5,
      p.slot+' overlaps '+q.slot+' at width '+width));
  });
}

/* Contextual photographs appear only where they help explain the project. */
const vnaPage=fs.readFileSync(path.join(root,'projects/vna.html'),'utf8');
check(home.includes('<figure class="feature-visual">\n            <img src="assets/Arm-home.webp"') &&
  !home.includes('class="featured-project-photo"') &&
  !home.includes('class="engineering-snapshots"'),
  'Robotic-arm context photo should remain outside featured project cards');
check(!home.includes('src="assets/Testing.jpg"') &&
  !home.includes('src="assets/VNA.jpg"'),
  'Homepage must not imply generic photos document unrelated project results');
check(vnaPage.includes('src="../assets/VNA.jpg"'),
  'VNA photo must be placed beside the relevant technical methods');
check(fs.readFileSync(path.join(root,'projects/project-photo-context.css'),'utf8')
  .includes('.context-photo-accent img'),
  'Project-specific photos must have compact centered styling');

/* Curated NASA and awards photographs are real assets and work without JavaScript. */
const selectedPhotos=[
  'assets/nasa-sls-team-home.webp',
  'assets/nasa-astronaut-suit-home.webp',
  'assets/nasa-mission-patches-home.webp',
  'assets/engineering-awards-home.webp'
];
check(home.includes('portfolio-photos.css') && !home.includes('portfolio-photos.js'),
  'Curated photos must load CSS without the old JavaScript preloader');
check(selectedPhotos.every(filename=>fs.existsSync(path.join(root,filename)) &&
  home.includes('src="'+filename+'"')),
  'Selected portfolio photos must exist and be referenced by native image elements');
check((home.match(/class="portfolio-photo-card(?: portfolio-photo-card--team)?"/g)||[]).length===3,
  'Curated NASA photo section should show three compact complementary images');
check(home.includes('id="portfolio-photo-gallery"') &&
  home.includes('id="portfolio-photo-gallery-title"') &&
  home.includes('class="portfolio-awards-photo"'),
  'NASA gallery and engineering recognition image should be present');
check(!home.includes('data-portfolio-photo-src=') &&
  !/<section class="portfolio-photo-gallery"[^>]* hidden/.test(home),
  'Present photographs must not be hidden behind JavaScript');
const photosCss=fs.readFileSync(path.join(root,'portfolio-photos.css'),'utf8');
check(photosCss.includes('@media(max-width:620px)') &&
  photosCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))') &&
  photosCss.includes('grid-column:1/-1'),
  'Responsive photo accents should show a full-width team image above two small portraits');
check(!photosCss.includes('Engineering evidence photos: thumbnail-size accents') &&
  !photosCss.includes('background:linear-gradient(transparent,rgba(22,17,28,.84))'),
  'Outdated photo layouts and overlay captions must not return');
check(photosCss.includes('var(--photo-gallery-heading)') &&
  photosCss.includes('var(--photo-awards-background)') &&
  photosCss.includes('object-fit:contain'),
  'Photo accents must use shared theme colors and natural image proportions');

const upgradeCss=fs.readFileSync(path.join(root,'portfolio-upgrade.css'),'utf8');
check((upgradeCss.match(/:root\[data-theme="dark"\]\s*\{/g)||[]).length===1,
  'Dark-mode design tokens must be declared in one canonical block');
for(const token of [
  '--bg:#191923;',
  '--dark-text:#f8f5fc;',
  '--berry:#982e62;',
  '--photo-gallery-heading:#fff2fa;',
  '--photo-awards-background:#34273c;'
]){
  check(upgradeCss.includes(token),'Missing dark-mode token: '+token);
}
for(const token of [
  '--photo-gallery-heading:#493649;',
  '--photo-awards-background:rgba(255,251,254,.7);'
]){
  check(upgradeCss.includes(token),'Missing light-mode photo token: '+token);
}
/* Keep the published bundle byte-for-byte in sync with its authored sources. */
const bundleSources=['styles.css','enhancements.css','bookshelf.css','ux.css',
  'botanical.css','ambient.css','engineering.css','case-studies.css','project-pages.css'];
const expectedBundle='/* Compiled portfolio stylesheet. Source: build-css.js; CSS files concatenated in exact cascade order. */\n' +
  bundleSources.map(file=>'\n/* SOURCE: '+file+' */\n' +
    fs.readFileSync(path.join(root,file),'utf8').trimEnd()+'\n').join('');
check(fs.readFileSync(path.join(root,'portfolio.css'),'utf8')===expectedBundle,
  'Compiled portfolio.css must match source CSS. Run node build-css.js');
// CSS chunks are byte-for-byte slices of the same ordered stylesheet so that
// deferred book and dossier rules do not change the final visual cascade.
const cssBoundary=file=>{
  const marker='\n/* SOURCE: '+file+' */\n';
  const pos=expectedBundle.indexOf(marker);
  if(pos<0)throw new Error('Missing CSS source marker '+file);
  return pos;
};
const expectedHomepageChunks=[
  ['home-css-initial.css',expectedBundle.slice(0,cssBoundary('bookshelf.css'))],
  ['home-css-layout.css',expectedBundle.slice(cssBoundary('ux.css'),cssBoundary('case-studies.css'))],
  ['home-css-project.css',expectedBundle.slice(cssBoundary('project-pages.css'))]
];
for(const [file,content] of expectedHomepageChunks)
  check(fs.readFileSync(path.join(root,file),'utf8')===content,
    'Optimized CSS '+file+' is outdated; run node build-css.js');
check(expectedHomepageChunks.every(([file])=>home.includes('href="'+file+'?v=20261012-split1"')) &&
  home.includes('href="bookshelf.css?v=20261012-split1" media="print"') &&
  home.includes('href="case-studies.css?v=20261012-split1" media="print"'),
  'Homepage must load full layout first and defer only offscreen book and dossier styles');

/* Interactive engineering-case-study explorer: linked to the existing dossiers. */
const caseExplorerJS=fs.readFileSync(path.join(root,'case-explorer.js'),'utf8');
const caseExplorerCSS=fs.readFileSync(path.join(root,'case-explorer.css'),'utf8');
const lazyFeatureJS=fs.readFileSync(path.join(root,'scripts/lazy-features.js'),'utf8');
check(home.includes('id="case-explorer"') &&
  home.includes('case-explorer.css') &&
  lazyFeatureJS.includes('case-explorer.js'),
  'Engineering case studies need their interactive explorer and assets');
check(home.includes('scripts/lazy-features.js') &&
  ['robot-3d.js','case-explorer.js'].every(file=>
    lazyFeatureJS.includes(file) && !home.includes('<script src="'+file)) &&
  home.includes('<script src="bookshelf.js?v=20261012-bookswitch1" defer></script>') &&
  !lazyFeatureJS.includes("{id:'bookshelf'"),
  'Keep the robot and case explorer lazy-loaded while initializing the bookshelf reader once');
check((home.match(/data-case-select="/g)||[]).length===2,
  'Case explorer must offer IVerify and instrumentation views');
check((home.match(/data-case-step="/g)||[]).length===4,
  'Each interactive case workflow needs four selectable stages');
check(['case-iverify','case-controls'].every(id=>home.includes('id="'+id+'"')),
  'Legacy case-study deep links must remain accessible');
check(home.indexOf('id="case-explorer"') < home.indexOf('id="case-iverify"'),
  'Legacy case-study anchors should follow the interactive explorer heading');
check((home.match(/class="technical-dossier(?: nasa-dossier)?"/g)||[]).length===0,
  'Do not repeat two full technical dossiers beneath the interactive explorer');
check(!home.includes('The full case studies are preserved below.'),
  'Interactive explorer should link to full project pages, not duplicate content below');
check(['iverify','controls'].every(project=>
  caseExplorerJS.includes("projects/"+project+".html#project-evidence")),
  'Interactive evidence links must point to both project pages');
check(!home.includes('id="case-explorer" aria-labelledby="case-explorer-heading" hidden'),
  'Case-study overview must remain visible without JavaScript');
check(caseExplorerJS.includes("const caseData = {") &&
  ['iverify','controls'].every(key=>caseExplorerJS.includes(key+': {')),
  'Interactive case explorer source-derived case content missing');
check(caseExplorerJS.includes("setAttribute('aria-selected'") &&
  caseExplorerJS.includes("setAttribute('aria-pressed'"),
  'Interactive case controls must expose their selected state');
check(caseExplorerCSS.includes('prefers-reduced-motion:reduce'),
  'Case explorer must respect reduced-motion settings');
let explorerSyntaxValid=true;
try{new (require('node:vm').Script)(caseExplorerJS,{filename:'case-explorer.js'})}
catch(error){explorerSyntaxValid=false;console.error(error.message)}
check(explorerSyntaxValid,'Case explorer JavaScript must parse');

check(home.includes('id="robot-3d-canvas"'),'3D viewer missing');
check(home.includes('id="theme-toggle"'),'Theme toggle missing');
check(home.includes('data-robot-view="3d"'),'Robot view picker missing');
check((directory.match(/data-gallery-category=/g)||[]).length===15,'15 categorized gallery cards required');
check(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes(domain),'robots.txt wrong host');
check(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes(domain),'sitemap.xml wrong host');

/* Additional accessibility and fragment-link checks. */
const cachedIds=new Map();
function getIds(absolutePath){
  if(!cachedIds.has(absolutePath)){
    const html=fs.readFileSync(absolutePath,'utf8');
    cachedIds.set(absolutePath,new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m=>m[1])));
  }
  return cachedIds.get(absolutePath);
}
for(const file of htmlFiles){
  const absolute=path.join(root,file);
  const markup=fs.readFileSync(absolute,'utf8');
  if(file.startsWith('projects/')){
    check(!/<style\b[^>]*>/i.test(markup),file+' has duplicated inline project styles');
  }
  for(const match of markup.matchAll(/<img\b[^>]*>/g)){
    check(/\balt\s*=/.test(match[0]),file+' image missing alternative text');
  }
  for(const match of markup.matchAll(/\bhref=["']([^"']+)["']/g)){
    const url=match[1];
    if(!url.includes('#')||/^(https?:|\/\/|mailto:|tel:)/i.test(url))continue;
    const [targetRef,rawFragment]=url.split('#');
    if(!rawFragment)continue;
    const target=targetRef?path.resolve(root,path.dirname(file),targetRef.split('?')[0]):absolute;
    if(!target.startsWith(root+path.sep)||!target.endsWith('.html')||!fs.existsSync(target))continue;
    let fragment=rawFragment;
    try{fragment=decodeURIComponent(rawFragment)}catch{/* Test the unmodified anchor name. */}
    check(getIds(target).has(fragment),file+' references missing section '+url);
  }
}
check(home.includes('id="robot-2d-controls" aria-label="2D motion controls" hidden'),
  '2D panel should start hidden while 3D view is selected');

/* The 2D/3D robot simulator shares one dock beneath one viewer. */
const robotDockCss=fs.readFileSync(path.join(root,'robot-control-dock.css'),'utf8');
const robotViewJs=fs.readFileSync(path.join(root,'portfolio-upgrade.js'),'utf8');
const robot3dJs=fs.readFileSync(path.join(root,'robot-3d.js'),'utf8');
const robotSection=home.slice(home.indexOf('<section class="section robot-section"'),
  home.indexOf('<section class="section skills-section"'));
const dock=robotSection.indexOf('class="robot-controls-dock"');
check(home.includes('robot-control-dock.css'),
  'Robot mode design should load the shared controls stylesheet');
check(dock>robotSection.indexOf('class="robot-viewport"')&&
  robotSection.indexOf('id="robot-2d-controls" aria-label="2D motion controls" hidden')>dock&&
  robotSection.indexOf('id="robot-3d-controls" aria-label="3D chamber controls"')>dock,
  'Both robot control panels must be inside the same dock, below the viewer');
check((robotSection.match(/data-joint-control/g)||[]).length===3 &&
  (robotSection.match(/class="robot-3d-control"/g)||[]).length===6,
  'Retain three planar and six chamber joint controls');
check((robotSection.match(/class="robot-control-heading robot-control-heading--joints"/g)||[]).length===2 &&
  robotSection.includes('class="robot-action-row robot-control-presets"') &&
  robotSection.includes('class="robot-3d-tools robot-control-presets"'),
  'Both modes need matching preset and manual adjustment headings');
check(robotViewJs.includes("controls3d.hidden=chosen!=='3d'")&&
  robotViewJs.includes("controls.hidden=chosen!=='2d'")&&
  robotViewJs.includes("robot:view-change"),
  'Robot mode switching must update both panels and the active viewer');
check(robot3dJs.includes("robot:view-change")&&robot3dJs.includes("fit()"),
  '3D canvas must resize correctly when reactivated');
check(robotDockCss.includes('robot-control-sliders')&&
  robotDockCss.includes('robot-control-presets'),
  'Both panels need shared styling');

check(robotSection.includes('id="bone-1" stroke="#e9a9c8"') &&
  robotSection.includes('id="bone-2" stroke="#b6dbe4"') &&
  robotSection.includes('id="bone-3" stroke="#eecf8f"') &&
  !robotSection.includes('stroke="url(#armGradient)"'),
  'All three 2D links must have explicit solid strokes; vertical SVG line gradients can render invisible');
check(home.includes('data-robot-mode="3d"'),'3D view should start as the selected robot mode');
/* The radial SVG and perspective canvas must share exactly one kinematic model. */
const sharedRobotJS=fs.readFileSync(path.join(root,'robot-chamber-model.js'),'utf8');
const robot2dJS=fs.readFileSync(path.join(root,'script.js'),'utf8');
check(home.includes('robot-chamber-model.js?v=20261012-shared1') &&
  home.indexOf('robot-chamber-model.js?v=20261012-shared1')<home.indexOf('script.js?v=20261012-shared1'),
  'Shared chamber model must load before 2D script');
check(sharedRobotJS.includes('link1=18.5, link2=18.5, tool=8.5') &&
  sharedRobotJS.includes('chamber=36, mount=3') &&
  robot3dJs.includes('model.joints(pose)') &&
  robot2dJS.includes('robotModel.joints(pose)'),
  'Both robot views must derive joint locations from the same physical lengths');
check(['home','floor','inspect','park'].every(name=>
  robotSection.includes('data-pose="'+name+'"')&&
  robotSection.includes('data-3d-pose="'+name+'"')) &&
  robotSection.includes('id="side-tip-readout"') &&
  robotSection.includes('id="side-projection-status"'),
  '2D and 3D must expose matching presets and chamber clearance feedback');
check(robot2dJS.includes("source:'2d'") &&
  robot3dJs.includes("source:'3d'") &&
  robot2dJS.includes("event.detail?.source!=='3d'") &&
  robot3dJs.includes("event.detail?.source!=='2d'"),
  'Robot mode changes must synchronize angles in both directions without an echo loop');
check(fs.readFileSync(path.join(root,'scripts/lazy-features.js'),'utf8').includes('robot-3d.js?v=20261012-shared1'),
  'Lazy 3D loader should fetch the synchronized renderer');


/* Content hierarchy and visual-first case-study invariants. */
const caseStudyFiles=htmlFiles.filter(file=>file.startsWith('projects/')&&file!=='projects/index.html');
for(const file of caseStudyFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const overview=html.indexOf('id="project-overview"');
  const method=html.indexOf('id="project-method"');
  const findings=html.indexOf('id="project-results"');
  const evidence=html.indexOf('id="project-evidence"');
  check(overview>=0&&method>overview&&findings>method&&evidence>findings,
    file+' needs overview → methods → findings → evidence ordering');
  const featuredCase=/projects\/(iverify|thermal)\.html$/.test(file);
  const visualIds=['dmx-visuals','hall-visuals','huemotion-visuals',
    'iverify-reconstruction','prodriver-visuals','thermal-visuals','vna-visuals'];
  for(const id of visualIds){
    const visual=html.indexOf('id="'+id+'"');
    if(visual>=0){
      check(featuredCase ? visual>findings&&visual<evidence : visual>overview&&visual<method,
        file+' should put visual evidence in the intended case-study reading order');
    }
  }
  check(!/<h2>Evidence and limitations<\/h2>/.test(html),
    file+' includes repeated evidence-limitations card');
  for(const title of (featuredCase ? [] : ['Challenge','Approach','Tools'])){
    check(html.includes('<h3>'+title+'</h3>'),
      file+' missing readable '+title+' subsection heading');
  }
  if(featuredCase){
    check(html.includes('Engineering decisions')&&html.includes('Testing and results')&&
      html.includes('Next verification step')&&html.includes('class="case-contact"'),
      file+' needs decision rationale, results, next verification, and contact actions');
  }
  check((html.match(/<h1\b/g)||[]).length===1,
    file+' must contain exactly one page heading');

}
for(const group of ['robotics','embedded','measurement','software']){
  check(directory.includes('data-gallery-group="'+group+'"'),
    'Project directory missing discipline '+group);
}

check(home.includes('<dialog id="project-book-dialog"') &&
  home.includes('id="book-open-stage"') &&
  home.includes('id="book-modal-title"') &&
  home.includes('id="book-project-link"') &&
  home.includes('id="book-next-page"') &&
  home.includes('id="book-prev-page"') &&
  home.includes('id="close-project-book"') &&
  home.includes('id="book-next"') && home.includes('id="book-previous"') &&
  home.includes('<select id="book-switch-select"') &&
  home.includes('class="bookshelf-index-link"') &&
  home.includes('class="book-switcher__directory"'),
  'Book reader, direct 15-project chooser, and controls must all exist');
check(fs.readFileSync(path.join(root,'bookshelf.js'),'utf8').includes("bookSwitchSelect?.addEventListener('change'") &&
  fs.readFileSync(path.join(root,'homepage-refinement.css'),'utf8').includes('.book-switcher__heading'),
  'Direct chooser must be interactive and visibly styled');
check(home.includes('src="bookshelf.js?v=20261012-bookswitch1" defer') &&
  !fs.readFileSync(path.join(root,'scripts/lazy-features.js'),'utf8').includes("{id:'bookshelf'"),
  'Reader should initialize exactly once on initial load, not only on scroll');

/* Keep the overview concise and restore permanently visible books and planets. */
const expectedFeaturedPreviews=[
  'projects/iverify/media/exploded-concept.svg',
  'projects/thermal/media/logger-interface-concept.svg'
];
const featuredPreviews=home.slice(home.indexOf('id="featured-projects"'),home.indexOf('id="experience"'));
check((featuredPreviews.match(/class="selected-project-preview(?: selected-project-preview--paper)?"/g)||[]).length===2 &&
  expectedFeaturedPreviews.every(src=>featuredPreviews.includes(src)) &&
  (featuredPreviews.match(/<img[^>]+alt="[^"]+"/g)||[]).length>=2,
  'Featured engineering work must include two source-labeled visual previews');

const featuredSection=home.slice(home.indexOf('id="featured-projects"'),home.indexOf('id="experience"'));
check((featuredSection.match(/class="featured-project-card"/g)||[]).length===2,
  'Homepage must feature exactly two focused project cards');
check(['iverify','thermal'].every(slug=>featuredSection.includes('projects/'+slug+'.html')),
  'IVerify and Thermal Logger must be the featured work');
check(home.indexOf('id="experience"')<home.indexOf('id="explore"') &&
  home.includes('<section class="portfolio-extras" id="explore"') &&
  home.includes('id="bookshelf"') && home.includes('id="repo-planetarium"') &&
  !home.includes('<details class="portfolio-extras"'),
  'Books and planets must remain visible on the homepage');
check(home.includes('homepage-refinement.js')&&
  fs.readFileSync(path.join(root,'homepage-refinement.js'),'utf8').includes("parent.open=true"),
  'Deep links must reveal nested interactive sections');
console.log((failed?'FAIL':'PASS')+': '+(checks-failed)+'/'+checks+' static checks');
if(failed)process.exitCode=1;