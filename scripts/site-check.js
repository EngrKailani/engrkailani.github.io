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
function ids(name){return new Set([...read(name).matchAll(/\\bid=["']([^"']+)["']/g)].map(m=>m[1]))}
for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full)){check(false,file+': missing page');continue}
  const html=read(file);
  const prefix=file.startsWith('projects/')?'../':'';
  check((html.match(/<h1(?:\\s[^>]*)?>/gi)||[]).length===1,file+': expected one h1');
  const pageIds=[...ids(file)];
  const allIds=[...html.matchAll(/\\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  check(pageIds.length===allIds.length,file+': duplicate element id');
  check(/<title>[^<]+<\\/title>/i.test(html),file+': missing title');
  check(/<meta name="description" content="[^"]{20,}"/i.test(html),file+': missing description');
  check(html.includes(domain),file+': missing canonical domain');
  check(html.includes('class="cosmic-site-header"')&&html.includes('class="cosmic-mobile-menu"'),
    file+': missing shared navigation');
  check(html.includes('href="'+prefix+'cosmic-theme.css?'),file+': missing shared theme');
  check(!html.includes('kalarcon775.github.io'),file+': obsolete domain');
  for(const img of html.matchAll(/<img\\b[^>]*>/gi))
    check(/\\balt=["'][^"']*["']/i.test(img[0]),file+': image missing alt');
  for(const item of html.matchAll(/\\s(?:href|src|poster)=["']([^"']+)["']/gi)){
    const ref=item[1].trim();
    if(!ref||/^(?:[a-z][a-z0-9+.-]*:|\\/\\/)/i.test(ref))continue;
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
check((home.match(/<article class="work-card(?:\\s[^"]*)?"/g)||[]).length===5,
  'Home: five featured projects expected');
for(const link of ['projects/nasa.html','projects/ur3e.html','projects/leg.html',
  'research.html#regolith-analysis','research.html#propulsion-testing'])
  check(home.includes('href="'+link+'"'),'Home: missing priority project '+link);
for(const link of ['research.html','academic-cv.html','#selected-work'])
  check(home.includes('href="'+link+'"'),'Home: missing navigation '+link);
check(!/34 hierarchical requirements|3\\.1\\s*N[·.]?m|12-document/.test(home+research+read('projects/nasa.html')+archive),
  'Public NASA summaries should not include numeric project findings');
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
  check(fs.existsSync(path.join(root,asset)),name+': missing original PDF');
}
check(research.includes('id="regolith-analysis"')&&research.includes('id="propulsion-testing"'),
  'Research: missing linked project anchors');
check(read('sitemap.xml').includes('<loc>'+domain+'/</loc>'),'Sitemap: missing home');
for(const message of violations)console.error('FAIL '+message);
console.log((assertions-violations.length)+'/'+assertions+' checks passed');
if(violations.length)process.exitCode=1;
