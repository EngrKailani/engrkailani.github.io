/* Validate the currently published static portfolio, without obsolete template checks. */
'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const slugs=['alu','controls','dmx','fingerprint','hall','huemotion','iverify','leg',
  'motor','nasa','powershell','prodriver','thermal','ur3e','vhdl','vna'];
const pages=['index.html','404.html','research.html','academic-cv.html','resume.html',
  'workbench.html','robotics-experiment.html','projects/index.html',...slugs.map(name=>'projects/'+name+'.html')];
const domain='https://kailanialarcon.com';
const violations=[];
let assertions=0;
function check(ok,why){assertions++;if(!ok)violations.push(why)}
const files=new Map();
function read(name){
  if(!files.has(name))files.set(name,fs.readFileSync(path.join(root,name),'utf8'));
  return files.get(name);
}
function ids(name){return new Set([...read(name).matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]))}
// GitHub Pages assets may be cached. The URL fingerprint must match the file bytes.
function assetVersion(name){
  const bytes=fs.readFileSync(path.join(root,name));
  return crypto.createHash('sha1')
    .update('blob '+bytes.length+String.fromCharCode(0))
    .update(bytes).digest('hex').slice(0,10);
}
// Published project styles must remain reproducible and exclude unused homepage modules.
const projectCssSources=['styles.css','enhancements.css','engineering.css',
  'case-studies.css','project-pages.css'];
const projectCss='portfolio-projects.css';
const projectBundle='/* Compiled project-only styles. Source: build-css.js. This bundle omits homepage-only bookshelf, ambient, botanical and UX source styles. */\n'+
  projectCssSources.map(file=>'\n/* SOURCE: '+file+' */\n'+read(file).trimEnd()+'\n').join('');
check(read(projectCss)===projectBundle,
  'Project CSS: compiled bundle must match its five authored source files');
check(read(projectCss).length < read('portfolio.css').length/2,
  'Project CSS: dedicated bundle should be less than half the original full bundle');
check(projectCssSources.every(name=>read(projectCss).includes('/* SOURCE: '+name+' */')) &&
  ['bookshelf.css','ux.css','botanical.css','ambient.css'].every(name=>
    !read(projectCss).includes('/* SOURCE: '+name+' */')),
  'Project CSS: must retain project styles but exclude homepage-only modules');
// Keep machine-readable breadcrumbs and the 20-entry archive aligned with visible content.
check(require('./structured-data.js').check(),
  'Structured-data schema must agree with current titles, descriptions, and links');
const printJsVersion=assetVersion('print-document.js');
const summaryCssVersion=assetVersion('projects/case-study-summary.css');
// Source-informed visuals must be explicitly distinguishable from original data.
const illustratedCaseStudies=['alu','controls','fingerprint','motor','vhdl'];
for(const slug of illustratedCaseStudies){
  const file='projects/'+slug+'.html',html=read(file);
  const art='projects/method-visuals/'+slug+'-workflow.svg';
  check(html.includes('id="'+slug+'-visual-method"') &&
    html.includes('src="method-visuals/'+slug+'-workflow.svg"') &&
    html.includes('href="#'+slug+'-visual-method"') &&
    html.includes('Diagram provenance:') &&
    html.includes('href="evidence-enhancements.css?v='+assetVersion('projects/evidence-enhancements.css')+'"'),
    'Illustrated project: method figure and provenance missing in '+slug);
  const diagram=read(art);
  check(diagram.includes('METHOD SKETCH / CONCEPTUAL') &&
    diagram.includes('EVIDENCE LIMIT') &&
    diagram.includes('<desc id="desc">'),
    'Illustrated project: conceptual workflow boundary missing in '+slug);
}
for(const slug of ['leg','vna','ur3e','thermal']){
  const html=read('projects/'+slug+'.html');
  check(html.includes('id="'+slug+'-repro-title"') &&
    html.includes('What a reviewer can verify') &&
    html.includes('href="evidence-enhancements.css?v='+assetVersion('projects/evidence-enhancements.css')+'"') &&
    (html.match(/<li><strong>/g)||[]).length>=3,
    'Research dossier: verification checklist missing in '+slug);
}
check(read('research.html').includes('id="research-evidence-crosswalk"') &&
  read('research.html').includes('How existing work informs the next research question') &&
  read('research.html').includes('research.css?v='+assetVersion('research.css')) &&
  read('research.html').includes('not a reported experiment'),
  'Research: the evidence-to-question crosswalk must separate proposals from completed work');
check(read('scripts/visual-regression.js').includes('baseline') &&
  read('.github/workflows/visual-regression.yml').includes('pull_request') &&
  read('.github/workflows/visual-regression.yml').includes('visual-regression.js'),
  'Visual regression: base-branch screenshot checks must remain available');
// Interactive robotics work must remain synthetic, reproducible and discoverable.
const expPage=read('robotics-experiment.html');
const expModel=read('robotics-experiment-model.js');
const expViewer=read('robotics-experiment.js');
check((expPage.match(/class="exp-chart-wrap" role="region"[^>]*tabindex="0"/g)||[]).length===3 &&
  expPage.includes('class="exp-table-wrap" role="region"') &&
  read('robotics-experiment.css').includes('.exp-chart-wrap:focus-visible'),
  'Robotics: scrollable chart and table regions need keyboard focus');
check(expPage.includes('Reproducible Robotics Experiment') &&
  expPage.includes('id="exp-sensitivity-plot"') &&
  expPage.includes('id="exp-error-plot"') &&
  expPage.includes('id="exp-sensitivity-rows"') &&
  expPage.includes('id="exp-trials-csv"') &&
  expPage.includes('not a recovered result from my Honors leg project'),
  'Robotics: synthetic multi-seed evidence and provenance should be visible');
check(expModel.includes('runTrials') &&
  expModel.includes('runSensitivity') &&
  expModel.includes('estimates.sort') &&
  expViewer.includes('download') &&
  expViewer.includes('exp-batch-summary'),
  'Robotics: statistical computation, data export, and displayed metrics are required');
check(read('sitemap.xml').includes('<loc>'+domain+'/robotics-experiment.html</loc>') &&
  read('index.html').includes('href="robotics-experiment.html"') &&
  read('workbench.html').includes('href="robotics-experiment.html"'),
  'Robotics: model must be discoverable from homepage, workbench and sitemap');
check(read('scripts/browser-quality.js').includes("path:'/robotics-experiment.html'") &&
  read('scripts/robotics-experiment-smoke.js').includes("planar-robot-synthetic-trials.csv") &&
  read('.github/workflows/portfolio-audit.yml').includes('robotics:/robotics-experiment.html'),
  'Robotics: browser and Lighthouse coverage must be configured');

const sharedCssVersion=assetVersion('cosmic-theme.css');
const sharedThemeJsVersion=assetVersion('unified-theme.js');
for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full)){check(false,file+': missing page');continue}
  const html=read(file);
  const prefix=file.startsWith('projects/')?'../':'';
  check((html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length===1,file+': expected one h1');
  const pageIds=[...ids(file)];
  const allIds=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  check(pageIds.length===allIds.length,file+': duplicate element id');
  check(/<title>[^<]+<\/title>/i.test(html),file+': missing title');
  check(/<meta name="description" content="[^"]{20,}"/i.test(html),file+': missing description');
  check(html.includes(domain),file+': missing canonical domain');
  check(html.includes('class="cosmic-site-header"')&&html.includes('class="cosmic-mobile-menu"'),
    file+': missing shared navigation');
  check(html.includes('href="'+prefix+'cosmic-theme.css?v='+sharedCssVersion+'"'),
    file+': stale shared CSS version; use the first 10 characters of its Git blob SHA');
  check(html.includes('src="'+prefix+'unified-theme.js?v='+sharedThemeJsVersion+'"'),
    file+': stale shared theme JavaScript version; update the cache fingerprint');
  for(const link of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi))
    check(/\brel=["'][^"']*\bnoopener\b/.test(link[0]),
      file+': external link opening a new tab is missing rel=noopener');
  check(!html.includes('kalarcon775.github.io'),file+': obsolete domain');
  for(const img of html.matchAll(/<img\b[^>]*>/gi))
    check(/\balt=["'][^"']*["']/i.test(img[0]),file+': image missing alt');
  for(const item of html.matchAll(/\s(?:href|src|poster)=["']([^"']+)["']/gi)){
    const ref=item[1].trim();
    if(!ref||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref))continue;
    const [beforeFragment,rawFragment]=ref.split('#');
    const local=beforeFragment.split('?')[0];
    let relative;
    try{relative=decodeURIComponent(local)}catch{check(false,file+': bad encoded URL '+ref);continue}
    const resolved=local?path.resolve(root,path.dirname(file),relative):full;
    if(!(resolved===root||resolved.startsWith(root+path.sep))){
      check(false,file+': path escapes repository: '+ref);continue;
    }
    check(fs.existsSync(resolved),file+': broken reference '+ref);
    if(rawFragment&&fs.existsSync(resolved)&&resolved.endsWith('.html')){
      const target=path.relative(root,resolved);
      let frag=rawFragment;try{frag=decodeURIComponent(rawFragment)}catch{}
      check(ids(target).has(frag),file+': missing #'+frag+' in '+target);
    }
  }
}
const home=read('index.html'),research=read('research.html'),archive=read('projects/index.html');
check(research.includes('data-print-page hidden') &&
  research.includes('src="print-document.js?v='+printJsVersion+'"') &&
  research.includes('research-jumps'),
  'Research: provide a working, progressive print and save-as-PDF action');
check(read('print-document.js').includes("button.hidden=false") &&
  read('print-document.js').includes('window.print()'),
  'Print: only expose buttons after binding the browser print action');

check(archive.includes('href="../portfolio-projects.css?v='+assetVersion(projectCss)+'"') &&
  !archive.includes('href="../portfolio.css?v='),
  'Project directory: must load the lean CSS bundle');


const researchStartingPoints=['nasa.html','leg.html','vna.html','ur3e.html'];
const researchPath=archive.split('<nav class="directory-research-path"')[1]?.split('</nav>')[0]||'';
check(researchPath.includes('Research-focused starting points') &&
  researchStartingPoints.every(p=>researchPath.includes('href="'+p+'"')) &&
  (researchPath.match(/<a href=/g)||[]).length===4,
  'Project archive: a concise four-project research-first reading path must be present');
check(read('projects/directory-thumbnails.css').includes('.directory-research-path__links'),
  'Project archive: research-first links need responsive styling');
for(const [slug,methodId] of Object.entries({
  nasa:'nasa-decision-trace',leg:'leg-model-walkthrough',
  vna:'vna-interpretation',ur3e:'ur3e-rank-caveats'
})){
  const file='projects/'+slug+'.html',html=read(file);
  check(html.includes('id="'+methodId+'"') &&
    html.includes('href="technical-methods.css?v='+assetVersion('projects/technical-methods.css')+'"'),
    'Flagship case study: method reasoning or stylesheet missing in '+slug);
  check(html.includes('href="#'+methodId+'"'),
    'Flagship case study: method section not linked from reading navigation in '+slug);
}
check(read('projects/leg.html').includes('src="directory-thumbnails/leg.svg"') &&
  read('projects/leg.html').includes('Not a recovered Simulink screenshot'),
  'Honors leg simulation: illustrative schematic must retain its provenance');
for(const filename of [
  'home-css-initial.css','home-css-layout.css','home-css-project.css',
  'critical-home.css','projects-menu.css'
])check(!fs.existsSync(path.join(root,filename)),
  'Retired unreferenced CSS was restored: '+filename);

check(read('projects/case-print.css').includes('@media print') &&
  read('projects/case-print.css').includes('.nasa-evidence-map__table') &&
  read('projects/case-print.css').includes('.project-evidence-first__grid'),
  'Case-study print layout should preserve evidence summaries and make NASA tables printable');
check(read('research.css').includes('@media print') &&
  read('research.css').includes('.research-publications li'),
  'Research print layout should preserve documented publications and proposal boundaries');
check((home.match(/<article class="work-card(?:\s[^"]*)?"/g)||[]).length===6,
  'Home: six featured projects expected');
check(home.includes('src="projects/thermal/media/logger-interface-concept.svg"')&&
  home.includes('<a href="projects/thermal.html">Thermal controller and logger</a>'),
  'Home: sixth featured project should document thermal test automation');

const featureCards=[...home.matchAll(/<article class="work-card(?:\s[^"]*)?">([\s\S]*?)<\/article>/g)]
  .map(m=>m[1]);
check(featureCards.length===6 &&
  featureCards.every(card=>card.includes('<strong>My contribution:</strong>') &&
    card.includes('<strong>Methods and limits:</strong>')),
  'Home: every featured case study needs contribution and evidence-boundary summaries');
check(home.includes('My engineering work spans') &&
  home.includes('I plan to pursue doctoral research') &&
  home.includes('These directions are research goals, not completed experiments.'),
  'Home: must distinguish engineering contributions from research intentions');
check(home.includes('href="projects/index.html?area=research"'),
  'Home: faculty-mentored research should be directly discoverable');
check(!read('cosmic-theme.css').includes('.work-card .project-meta::before'),
  'Theme: decorative project rank numbering should not return');

const homeEvidenceLinks=[...home.matchAll(/<span class="evidence-links">([\s\S]*?)<\/span><\/li>/g)];
check(homeEvidenceLinks.length===6 &&
  homeEvidenceLinks.every(m=>(m[1].match(/<a href="/g)||[]).length>=2),
  'Home: research themes and technical skill groups should link to representative evidence');
const researchDirectionProof=[...research.matchAll(/<p class="research-theme-evidence">([\s\S]*?)<\/p>/g)];
check(researchDirectionProof.length===3 &&
  researchDirectionProof.every(m=>m[1].includes('Related engineering background')&&m[1].includes('<a href="')),
  'Research: proposed directions should link to related completed engineering work');
check(read('cosmic-theme.css').includes('.cosmic-home .evidence-links a') &&
  read('research.css').includes('.research-theme-evidence a'),
  'Theme: evidence links need dedicated legible styles');


for(const link of ['projects/nasa.html','projects/ur3e.html','projects/leg.html',
  'projects/vna.html','projects/thermal.html','research.html#regolith-analysis'])
  check(home.includes('href="'+link+'"'),'Home: missing priority project '+link);
for(const link of ['research.html','academic-cv.html','#selected-work'])
  check(home.includes('href="'+link+'"'),'Home: missing navigation '+link);
check(!/34 hierarchical requirements|3\.1\s*N[·.]?m|12-document/.test(home+research+read('projects/nasa.html')+archive),
  'Public NASA summaries should not include numeric project findings');

const nasaPublicText=[home,research,archive,read('projects/nasa.html'),
  read('docs/portfolio-history.md')].join('\n');
const privateNASAQuantities=[
  /\b34\s+(?:hierarchical\s+|system\s+)?requirements\b/i,
  /\b(?:six|6)\s+(?:planned\s+|operational\s+|operating\s+|proposed\s+)?scenarios\b/i,
  /\b3\.1\s*N(?:[·.]?m)?\b/i,
  /\b27\.23\s*lbf[- ]in\b/i,
  /\b(?:10\^-?7|1e-7)\s*torr\b/i,
  /\b12[- ]document\b/i,
];
for(const term of privateNASAQuantities)
  check(!term.test(nasaPublicText),'Public NASA narrative contains specific technical values: '+term);
const retired=[
  'projects/nasa-figures/shoulder-torque-comparison.svg',
  'projects/nasa-figures/requirements-verification.svg',
  'scripts/build-resume-pdf.py',
  'scripts/build-academic-cv-pdf.js',
  '.github/workflows/resume-pdf.yml',
  '.github/workflows/update-resume.yml',
  '.github/workflows/academic-cv-pdf.yml'
];
for(const name of retired)
  check(!fs.existsSync(path.join(root,name)),'Retired asset or generator must remain removed: '+name);

const previousPublicPDFs={
  'assets/Kailani_Alarcon_CV.pdf':'09ec82c69d7d023a92542cfc2df4a6dfc3b5b299',
  'assets/Kailani_Alarcon_Master_Resume.pdf':'13512bbf96504d192191d4f122de32df05788fcc'
};
for(const [name,oldBlob] of Object.entries(previousPublicPDFs)){
  const pathToPDF=path.join(root,name);
  if(!fs.existsSync(pathToPDF))continue;
  const bytes=fs.readFileSync(pathToPDF);
  const gitBlob=crypto.createHash('sha1')
    .update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  check(bytes.subarray(0,5).toString()==='%PDF-',
    name+': not a valid PDF header');
  check(gitBlob!==oldBlob,
    name+': an outdated NASA-numbered PDF was restored');
}

for(const slug of slugs){
  const page=read('projects/'+slug+'.html');
  check(page.includes('data-print-page hidden') &&
    page.includes('src="../print-document.js?v='+printJsVersion+'"') &&
    page.includes('href="case-study-summary.css?v='+summaryCssVersion+'"'),
    'Case study: printable action or styling missing in '+slug);

  check(page.includes('href="../portfolio-projects.css?v='+assetVersion(projectCss)+'"') &&
    !page.includes('href="../portfolio.css?v='),
    'Project CSS: case-study should use lean bundle in '+slug);

  check(archive.includes('href="'+slug+'.html"'),'Archive: missing '+slug);
  check(page.includes('class="project-evidence-first"'),'Case study: missing evidence section in '+slug);
  check(page.includes('href="case-print.css?v='+assetVersion('projects/case-print.css')+'" media="print"'),
    'Case study: missing print-only stylesheet or stale print asset version in '+slug);
  check((page.match(/<nav class="(?:project-reading-shortcuts|detail-jump)"/g)||[]).length===1,
    'Case study: expected exactly one reading navigation in '+slug);
  check(page.includes('Contribution, evidence, and limitations'),
    'Case study: summary heading should identify evidence limits in '+slug);
  const heading=(page.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/)||[])[1];
  check(Boolean(heading) && page.includes('<span aria-current="page">'+heading+'</span>'),
    'Case study: breadcrumb must identify the current project in '+slug);
  check(page.includes('class="case-breadcrumb" aria-label="Breadcrumb"') &&
    page.includes('<a href="index.html">All projects</a>'),
    'Case study: missing archive breadcrumb in '+slug);
  check(page.includes('class="case-archive-return" href="index.html"') &&
    page.includes('aria-label="Project navigation"'),
    'Case study: missing archive return link in '+slug);
  check(page.includes('../cosmic-theme.css?v='+sharedCssVersion),
    'Case study: missing current shared breadcrumb styling in '+slug);
}
// Editorial quality: public snippets should identify the engineering work,
// rather than reuse the same generic promotional summary on every project.
const caseDescriptions=slugs.map(slug=>{
  const html=read('projects/'+slug+'.html');
  const match=html.match(/<meta name="description" content="([^"]+)"/);
  return match?.[1]||'';
});
check(caseDescriptions.length===16 &&
  new Set(caseDescriptions).size===16 &&
  caseDescriptions.every(description=>
    description.length>=90 &&
    description.length<=170 &&
    !/Engineering project summary, methods, tools, and documented outcomes/i.test(description)),
  'Project metadata: require unique, evidence-led summaries without boilerplate');
check(!archive.includes('Making temperature measurements easier to trust') &&
  !archive.includes('A small system with meaningful communication challenges') &&
  !archive.includes('A browser interface connected to physical lights'),
  'Archive: prefer concrete technical descriptions over vague promotional copy');
check(research.includes('How does uncertain contact affect robotic tool handling?') &&
  research.includes('Manipulation with <em>incomplete feedback.</em>'),
  'Research: proposed contact and incomplete-feedback studies must remain distinct');
for(const [name,asset] of [
  ['academic-cv.html','assets/Kailani_Alarcon_CV.pdf'],
  ['resume.html','assets/Kailani_Alarcon_Master_Resume.pdf']
]){
  const html=read(name);
  check(html.includes('href="'+asset+'"')&&html.includes('src="'+asset+'#view=FitH"'),
    name+': PDF viewer and direct PDF link must match');
  check(fs.existsSync(path.join(root,asset)),name+': missing published PDF');
  check(html.includes('class="pdf-summary" id="pdf-summary"') &&
    html.includes('class="pdf-mobile-note"') &&
    html.includes('aria-describedby="pdf-summary"'),
    name+': missing readable document summary or mobile PDF guidance');
  check(html.includes('<meta property="og:image"') &&
    html.includes('<meta property="og:description"') &&
    html.includes('<meta name="twitter:card"'),
    name+': missing share preview metadata');
}
// Documented work precedes proposed faculty research directions.
check(research.indexOf('id="investigations"') < research.indexOf('id="directions"') &&
  research.includes('01 / DOCUMENTED ENGINEERING AND RESEARCH') &&
  research.includes('02 / PROPOSED RESEARCH DIRECTIONS'),
  'Research: completed work must be presented before proposed PhD directions');
const evidenceCases=['nasa','leg','vna','thermal'];
for(const slug of evidenceCases) {
  const html=read('projects/'+slug+'.html');
  check(html.includes('<a href="#project-evidence"') || html.includes('id="project-evidence"'),
    slug+': primary evidence section is missing');
  check(html.includes('Inspectable on this page:') || html.includes('Public source you can inspect:'),
    slug+': reviewers should be able to identify which supporting artifacts are public');
}
for(const slug of slugs) {
  const html=read('projects/'+slug+'.html');
  const start=html.indexOf('<section class="project-evidence-first"');
  const end=html.indexOf('</section>',start);
  const summary=html.slice(start,end);
  for(const heading of ['Problem','My contribution','Engineering tools','Validation method','Documented result','Limitations']) {
    check(summary.includes('<h3>'+heading+'</h3>'),
      slug+': evidence-first summary is missing standard '+heading+' facet');
  }
  check(summary.includes('ENGINEERING EVIDENCE / AT A GLANCE'),
    slug+': evidence-first summary lacks its shared visible heading');
}
check(read('projects/leg.html').includes('3link-sim/blob/main/MatLabCode') &&
  read('projects/thermal.html').includes('Thermal-Logger/blob/main/logger_core.py'),
  'Inspectable public source links missing from flagship research cases');
// Keep projects named in the uploaded academic CV and master résumé discoverable
// without inventing measurements or publishing internal NASA design numbers.
const resumeProjectBriefs={
  'regolith-analysis':'Lunar-regolith surface contamination',
  'propulsion-testing':'Wire-extraction force modeling',
  'instron-processing':'Instron wire-pull data processor',
  'arduino-pi-control':'DC motor'
};
check((archive.match(/class="directory-brief-card"/g)||[]).length===4,
  'CV/resume: expected four accessible additional project briefs');
const briefs=[...archive.matchAll(/<article class="directory-brief-card"[^>]*>([\s\S]*?)<\/article>/g)];
check(briefs.length===4 && briefs.every(match=>{
  const summary=match[1].match(/<h3>[^<]+<\/h3>\s*<p>([^<]+)<\/p>/)?.[1]||'';
  return summary.length>=105 && summary.length<=280 &&
    !/generic|placeholder|coming soon/i.test(summary);
}), 'Project briefs: maintain concise, specific contribution and method summaries');
check(archive.includes('Original NASA measurements are not public.') &&
  archive.includes('Internal test data are not public.') &&
  archive.includes('Original test files remain internal.') &&
  archive.includes('Separate from the STM32 PWM exercise.'),
  'Project briefs: retain public-data boundaries and separate the two motor exercises');
check((archive.match(/data-brief-category="[^"]+" data-brief-keywords="[^"]+"/g)||[]).length===4 &&
  archive.includes('id="directory-brief-count"'),
  'Project search: all four briefs need filter metadata and a visible result count');
check(read('project-directory.js').includes('briefs.forEach(brief=>') &&
  read('project-directory.js').includes('visible+visibleBriefs!==0') &&
  archive.includes('The archive includes 16 case studies and four'),
  'Project search: archive must include shorter CV and résumé briefs, not just full case studies');
check(archive.includes('id="additional-project-briefs"') &&
  archive.includes('href="../research.html#instron-processing"') &&
  archive.includes('href="motor.html#arduino-pi-control"') &&
  home.includes('href="projects/index.html#additional-project-briefs"'),
  'CV/resume: additional briefs need direct links from project archive and homepage');
for(const [anchor,label] of Object.entries(resumeProjectBriefs)){
  const file=anchor==='arduino-pi-control'?'projects/motor.html':'research.html';
  check(read(file).includes('id="'+anchor+'"'),
    'CV/resume: missing documented '+label+' summary section');
}
check(read('projects/alu.html').includes('id="fpga-digital-design"') &&
  read('projects/iverify.html').includes('five-subsystem') &&
  read('projects/huemotion.html').includes('two-hand recognition') &&
  read('projects/fingerprint.html').includes('UART sensor packet handling'),
  'CV/resume: missing source-supported FPGA, capstone, gesture or embedded project details');
const nasaPublicNarrative=[home,research,archive,read('projects/nasa.html')].join(' ');
check(!/34 hierarchical|3\.1\s*N|12-document technical specification set/.test(nasaPublicNarrative),
  'CV/resume: internal NASA project-specific quantitative claims should not be copied publicly');
check(research.includes('id="regolith-analysis"')&&research.includes('id="propulsion-testing"'),
  'Research: missing linked project anchors');

check(archive.includes('data-gallery-filter="research"') &&
  archive.includes('data-gallery-category="robotics research source" href="leg.html"') &&
  archive.includes('data-gallery-category="measurement research" href="vna.html"'),
  'Archive: faculty-mentored research filter must include both Honors projects');
for(const [file,mentor,anchorId] of [
  ['projects/leg.html','Dr. Sesh Commuri','leg-research'],
  ['projects/vna.html','Dr. Jihwan Yoon','vna-research']
]){
  check(read(file).includes('Honors Signature Experience')&&read(file).includes(mentor),
    file+': faculty-mentored Honors research is not correctly identified');
  check(read(file).includes('../research.html#'+anchorId)&&research.includes('id="'+anchorId+'"'),
    file+': missing linked research summary');
}
check(research.includes('projects/index.html?area=research'),
  'Research: missing link to filtered faculty-mentored archive');
check(read('projects/leg.html').includes('<title>Three-Link Human Leg Dynamics | Kailani Alarcon</title>') &&
  read('projects/leg.html').includes('Faculty-mentored UNR Honors Signature Experience'),
  'Leg research: search title and summary must identify current Honors work');
check(read('projects/vna.html').includes('Faculty-mentored UNR Honors Signature Experience') &&
  read('projects/vna.html').includes('Student-initiated Honors research in RF measurement analysis'),
  'VNA research: search and sharing descriptions must identify faculty-mentored work');

const expectedHomeOrder=['selected-work','research','experience','about','contact'];
check(expectedHomeOrder.every((id,i)=>home.indexOf('id="'+id+'"')>=0&&
  (i===0||home.indexOf('id="'+id+'"')>home.indexOf('id="'+expectedHomeOrder[i-1]+'"'))),
  'Home: research, experience and education sections should follow expected order');
const expectedResearchOrder=['investigations','directions','writing','questions','research-concept'];
check(expectedResearchOrder.every((id,i)=>research.indexOf('id="'+id+'"')>=0&&
  (i===0||research.indexOf('id="'+id+'"')>research.indexOf('id="'+expectedResearchOrder[i-1]+'"'))),
  'Research: evidence and publications should precede future proposals');
check(research.includes('Thermal-Validation-of-Commercial-LED-Luminaires-1.pdf')&&
  research.includes('Copy-of-Understanding-Optical-Lens-Performance-in-LED-Luminaires-1.pdf'),
  'Research: both industry white papers need direct publisher links');
check(research.includes('Space Robotics Research & Publications | Kailani Alarcon'),
  'Research: title should name space robotics and publications');
check(read('sitemap.xml').includes('<loc>'+domain+'/</loc>'),'Sitemap: missing home');
check(read('404.html').includes('<meta name="robots" content="noindex">') &&
  !read('sitemap.xml').includes('<loc>'+domain+'/404.html</loc>'),
  '404: not-found pages should not be indexed or listed in the sitemap');
for(const [slug,source] of Object.entries({
  leg:'3link-sim',thermal:'Thermal-Logger',prodriver:'ProDriver-Sim',
  huemotion:'HueMotion',dmx:'DMX-Controller'
})){
  const html=read('projects/'+slug+'.html');
  const expected='<a href="https://github.com/EngrKailani/'+source+
    '" target="_blank" rel="noopener noreferrer"';
  check(html.includes(expected) && html.includes('Public source code'),
    slug+': missing verified public source link with secure new-tab behavior');
}
const retiredRuntimeFiles=[
  'bookshelf.js','case-explorer.js','robot-3d.js','robot-chamber-model.js',
  'script.js','ambient.js','ux.js','enhancements.js',
  'design-refresh.js','homepage-refinement.js',
  'scripts/lazy-features.js','scripts/projects-menu.js',
  'case-explorer.css','repo-orbit.css','robot-control-dock.css',
  'portfolio-photos.css'
];
for(const file of retiredRuntimeFiles)
  check(!fs.existsSync(path.join(root,file)),
    'Retired interactive asset unexpectedly restored: '+file);
const homepageMedia=[...home.matchAll(/<figcaption class="work-media-note">([^<]+)<\/figcaption>/g)].map(m=>m[1]);
check(homepageMedia.length===6 &&
  homepageMedia.filter(x=>x==='Instrument photo').length===1 &&
  homepageMedia.includes('Generic schematic') &&
  homepageMedia.includes('Synthetic interface'),
  'Home: every selected project needs an accurate visible visual-provenance label');
check(read('cosmic-theme.css').includes('.cosmic-home .work-media-note'),
  'Theme: visual provenance needs visible, readable label styles');
for(const [slug,category] of [
  ['leg','robotics research'],['thermal','measurement'],['prodriver','software'],
  ['huemotion','software'],['dmx','software']
]) check(archive.includes('data-gallery-category="'+category+' source" href="'+slug+'.html"'),
  'Archive: missing public code filter category for '+slug);
check(archive.includes('data-gallery-filter="source"') &&
  home.includes('href="projects/index.html?area=source"'),
  'Home and archive should let visitors find projects with verifiable public code');
const archiveImages=[...archive.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
check(archiveImages.length===16 &&
  archiveImages.every((img,i)=>img.includes('loading="lazy"') &&
    img.includes('decoding="async"') &&
    (i<3?!img.includes('fetchpriority="low"'):img.includes('fetchpriority="low"'))),
  'Archive: reserve normal image priority for the first row and lower priority offscreen project illustrations');
check(!['.site-header {','.nav-links {','.brand {','.nav {']
  .some(rule=>read('professional-home.css').includes(rule)),
  'Home: unused legacy navigation styling should stay retired');
const keywordCards=[...archive.matchAll(/<a class="featured-project-card" data-gallery-category="[^"]+" href="[^"]+" data-gallery-keywords="([^"]+)"/g)];
check(keywordCards.length===16 &&
  keywordCards.every(x=>x[1].split(' ').length>=6),
  'Archive: all 16 projects should be searchable by grounded methods and tools');
for(const id of ['group-robotics','group-embedded','group-measurement',
  'group-software','additional-project-briefs']){
  check(archive.includes('data-directory-jump="'+id+'"') &&
    ids('projects/index.html').has(id),
    'Archive: section shortcut must target a real heading or briefs section: '+id);
}
check(archive.includes('id="directory-jump"') &&
  read('project-directory.js').includes('jumpLinks.forEach('),
  'Archive: in-page section navigation must respond to filtered results');
check(archive.includes('aria-describedby="directory-search-help"') &&
  archive.includes('id="directory-copy-link"') &&
  /id="directory-share-status"[^>]*role="status"/.test(archive),
  'Archive: query help and accessible shareable view feedback are missing');
check(read('project-directory.js').includes('terms.every(term=>index.includes(term))') &&
  read('project-directory.js').includes('const requestedUrl=location.href') &&
  read('project-directory.js').includes("navigator.clipboard.writeText(requestedUrl)"),
  'Archive: technical multiword search and shareable filtered links are not implemented');
for(const file of [
  'assets/Creo-1.jpg','assets/Creo-2.jpg','assets/Arm.jpg',
  'assets/Arm-home.webp','assets/Inventory.jpg','assets/ARM-Selfie.jpg'
]) check(!fs.existsSync(path.join(root,file)),
  'Unused NASA hardware or CAD photo should not be in the published branch: '+file);
check(archive.includes('src="../project-directory.js?v='+assetVersion('project-directory.js')+'"'),
  'Project directory: stale search/filter script version');
check(research.includes('datetime="2026-02-05"') &&
  research.includes('datetime="2026-03-10"'),
  'Research: cite the preparation dates printed on the two published white papers');
check(archive.includes('<meta property="og:type" content="website">'),
  'Project directory: collection needs website social metadata');
for(const doc of ['academic-cv.html','resume.html'])
  check(read(doc).includes('<meta name="twitter:image" content="'+domain+'/social/portfolio.png">'),
    doc+': missing social sharing image');
check(read('project-directory.js').includes("saveDirectoryToUrl('push')") &&
  read('project-directory.js').includes("history[method==='push'?'pushState':'replaceState']"),
  'Directory: filter selection should add navigable history entries');
check(read('unified-theme.js').includes("themeMeta.content = dark ? '#211a3b' : '#fffbfd'"),
  'Theme: browser chrome should follow the selected palette');
for(const message of violations)console.error('FAIL '+message);
console.log((assertions-violations.length)+'/'+assertions+' checks passed');
if(violations.length)process.exitCode=1;
