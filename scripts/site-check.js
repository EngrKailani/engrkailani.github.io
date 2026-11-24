/* Validate the currently published static portfolio, without obsolete template checks. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const slugs=['alu','controls','dmx','fingerprint','hall','huemotion','iverify','leg',
  'motor','nasa','powershell','prodriver','thermal','ur3e','vhdl','vna'];
const pages=['index.html','research.html','academic-cv.html','resume.html',
  'workbench.html','projects/index.html',...slugs.map(name=>'projects/'+name+'.html')];
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
  check(html.includes('href="'+prefix+'cosmic-theme.css?'),file+': missing shared theme');
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
check((home.match(/<article class="work-card(?:\s[^"]*)?"/g)||[]).length===5,
  'Home: five featured projects expected');

const featureCards=[...home.matchAll(/<article class="work-card(?:\s[^"]*)?">([\s\S]*?)<\/article>/g)]
  .map(m=>m[1]);
check(featureCards.length===5 &&
  featureCards.every(card=>card.includes('<strong>My contribution:</strong>') &&
    card.includes('<strong>Methods and limits:</strong>')),
  'Home: every featured case study needs contribution and evidence-boundary summaries');
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
  'projects/vna.html','research.html#regolith-analysis'])
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
const crypto=require('node:crypto');
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
  check(archive.includes('href="'+slug+'.html"'),'Archive: missing '+slug);
  check(page.includes('class="project-evidence-first"'),'Case study: missing evidence section in '+slug);
}
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
check(research.includes('id="regolith-analysis"')&&research.includes('id="propulsion-testing"'),
  'Research: missing linked project anchors');

check(archive.includes('data-gallery-filter="research"') &&
  archive.includes('data-gallery-category="robotics research" href="leg.html"') &&
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

const expectedHomeOrder=['selected-work','research','experience','about','contact'];
check(expectedHomeOrder.every((id,i)=>home.indexOf('id="'+id+'"')>=0&&
  (i===0||home.indexOf('id="'+id+'"')>home.indexOf('id="'+expectedHomeOrder[i-1]+'"'))),
  'Home: research, experience and education sections should follow expected order');
const expectedResearchOrder=['directions','investigations','writing','questions','research-concept'];
check(expectedResearchOrder.every((id,i)=>research.indexOf('id="'+id+'"')>=0&&
  (i===0||research.indexOf('id="'+id+'"')>research.indexOf('id="'+expectedResearchOrder[i-1]+'"'))),
  'Research: evidence and publications should precede future proposals');
check(research.includes('Thermal-Validation-of-Commercial-LED-Luminaires-1.pdf')&&
  research.includes('Copy-of-Understanding-Optical-Lens-Performance-in-LED-Luminaires-1.pdf'),
  'Research: both industry white papers need direct publisher links');
check(research.includes('Space Robotics Research & Publications | Kailani Alarcon'),
  'Research: title should name space robotics and publications');
check(read('sitemap.xml').includes('<loc>'+domain+'/</loc>'),'Sitemap: missing home');
for(const message of violations)console.error('FAIL '+message);
console.log((assertions-violations.length)+'/'+assertions+' checks passed');
if(violations.length)process.exitCode=1;
