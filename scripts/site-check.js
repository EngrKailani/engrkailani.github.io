/* Static content, link and evidence checks for the professional portfolio. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const domain = 'https://kailanialarcon.com';
const projectSlugs = [
  'alu','controls','dmx','fingerprint','hall','huemotion','iverify','leg',
  'motor','nasa','powershell','prodriver','thermal','ur3e','vhdl','vna'
];
const pages = [
  'index.html','projects/index.html','research.html','academic-cv.html',
  'resume.html','workbench.html', ...projectSlugs.map(slug=> 'projects/'+slug+'.html')
];
let checks = 0, failures = 0;
function check(condition, message) {
  checks++;
  if (!condition) { failures++; console.error('FAIL '+message); }
}
const content = new Map();
function get(file) {
  if (!content.has(file)) content.set(file, fs.readFileSync(path.join(root,file),'utf8'));
  return content.get(file);
}
const ids = new Map();
function idsFor(file) {
  if (!ids.has(file)) ids.set(file, new Set([...get(file).matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1])));
  return ids.get(file);
}

for (const file of pages) {
  check(fs.existsSync(path.join(root,file)),file+' must exist');
  if (!fs.existsSync(path.join(root,file))) continue;
  const html = get(file);
  const pageIds = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  check(pageIds.length===new Set(pageIds).size,file+': duplicated element ID');
  check(/<title>[^<]+<\/title>/i.test(html),file+': missing document title');
  check(/<meta name="description" content="[^"]{20,}"/i.test(html),file+': missing descriptive meta text');
  check((html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length===1,file+': expected one h1');
  check(html.includes(domain),file+': wrong canonical host');
  check(!html.includes('https://kalarcon775.github.io'),file+': obsolete portfolio address');
  check(!html.includes('https://github.com/kalarcon775'),file+': obsolete GitHub profile');
  check(/<meta property="og:image"/i.test(html),file+': missing social preview');
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    check(/\balt=["'][^"']*["']/i.test(image[0]), file+': image missing alt attribute');
  }
  for(const link of html.matchAll(/\s(?:href|src|poster)=["']([^"']+)["']/gi)){
    const href=link[1].trim();
    if(!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href))continue;
    const [withoutFragment,frag] = href.split('#');
    const local = withoutFragment.split('?')[0];
    const target = local ? path.resolve(root,path.dirname(file),decodeURIComponent(local)) : path.resolve(root,file);
    check(target===root || target.startsWith(root+path.sep),file+': reference escapes repository: '+href);
    if (!(target===root || target.startsWith(root+path.sep)))continue;
    check(fs.existsSync(target),file+': missing local link / asset: '+href);
    if(frag && fs.existsSync(target) && target.endsWith('.html')){
      const targetFile=path.relative(root,target);
      let id; try { id=decodeURIComponent(frag); } catch { id=frag; }
      check(idsFor(targetFile).has(id),file+': target #'+id+' missing in '+targetFile);
    }
  }
}

const home=get('index.html');
const archive=get('projects/index.html');
const research=get('research.html');
const cv=get('academic-cv.html');
const resume=get('resume.html');
const nasa=get('projects/nasa.html');
const sitemap=get('sitemap.xml');

check(home.includes('href="professional-home.css?v=20261123"'),'Homepage should load professional stylesheet');
check(home.includes('class="cosmic-home"') && home.includes('class="hero-highlight"'),
  'Homepage needs the professional pink-space identity');
for(const file of pages) {
  const themePath = file.startsWith('projects/') ? '../cosmic-theme.css' : 'cosmic-theme.css';
  check(get(file).includes('href="'+themePath+'?v=20261123-pinkspace1"'),
    file+': shared cosmic design stylesheet missing');
}
check(!home.includes('portfolio-upgrade.js') && !home.includes('bookshelf.js') &&
  !home.includes('ambient.js') && !home.includes('repo-orbit.js'),
  'Homepage should avoid expensive legacy scripts');
check(home.includes('id="main"') && home.includes('href="#main"'), 'Homepage needs accessible skip navigation');
check(home.includes('aria-label="Main navigation"'),'Homepage needs labeled navigation');
check((home.match(/class="work-card"/g)||[]).length===5,'Homepage should curate five representative projects');
check(['nasa','leg','thermal','vna','iverify'].every(slug=>home.includes('href="projects/'+slug+'.html"')),
  'Featured projects need dedicated case study links');
check(['#selected-work','projects/index.html','research.html','academic-cv.html','resume.html','#contact']
  .every(href=>home.includes('href="'+href+'"')),'Homepage must support key professional pathways');
check(!home.includes('id="bookshelf"') && !home.includes('id="repo-orbit-shell"') &&
  !home.includes('id="robot-lab"') && !home.includes('id="portfolio-photo-gallery"') &&
  !home.includes('id="case-explorer"'),'Homepage should not duplicate project galleries or interactive demos');
check(home.includes('id="experience"') && home.includes('id="research"') &&
  home.includes('id="about"') && home.includes('id="contact"'),
  'Homepage needs experience, research, skills and contact');
check(home.includes('NASA Marshall Space Flight Center') &&
  home.includes('LUX Dynamics') && home.includes('University of Nevada, Reno'),
  'Homepage should identify verified professional experience');
check(home.includes('Registered Spring 2027 courses (upcoming)') &&
  home.includes('Computer Vision') && home.includes('Digital Control Engineering'),
  'Registered future coursework must not be represented as completed');
check(home.includes('NASA case studies describe personal internship contributions') &&
  home.includes('not official NASA'), 'Homepage must preserve NASA scope and independence statements');
check(home.includes('34 hierarchical system requirements') &&
  home.includes('236 frequency points') &&
  home.includes('eight thermocouple channels'),
  'Featured outcomes should show supported, concrete results');
check(home.includes('role')===false || home.includes('scope of my contribution'), 'Homepage must distinguish personal roles');

check(projectSlugs.every(slug=>archive.includes('href="'+slug+'.html"')),
  'Full project archive must still expose all 16 cases');
check(!archive.includes('#bookshelf') && !archive.includes('#case-studies'),
  'Project archive should not link to removed homepage features');
for(const slug of projectSlugs){
  const caseHtml=get('projects/'+slug+'.html');
  check(!caseHtml.includes('href="../index.html#bookshelf"'),
    slug+': removed bookshelf link should not be shown');
  check(!caseHtml.includes('href="../index.html#case-studies"'),
    slug+': removed case-study anchor should be corrected');
  check(caseHtml.includes('case-study-summary.css') &&
    caseHtml.includes('class="project-evidence-first"'),
    slug+': retain evidence-first project summary');
}
check(nasa.includes('34 hierarchical requirements') &&
  nasa.includes('No completed vacuum qualification') &&
  nasa.includes('no new NASA project specifications or test results'),
  'NASA public case study should preserve scope and verification boundaries');
check(research.includes('not a completed experiment, NASA task') &&
  research.includes('independent future research') &&
  research.includes('No peer-reviewed journal or conference articles are claimed'),
  'Research page must separate proposals from completed engineering evidence');
check(cv.includes('Spring 2027 registered coursework (upcoming)') &&
  cv.includes('foundational hands-on exposure to ROS 2 and MuJoCo'),
  'Academic CV should clearly distinguish future coursework and tool exposure');
check(resume.includes('Spring 2027 registered coursework (upcoming)') &&
  resume.includes('two industry white papers') && resume.includes('Lunar Regolith Surface Contamination Image Analysis') && resume.includes('Space Nuclear Propulsion'),
  'Resume should preserve upcoming coursework and publication type');
check(sitemap.includes('<loc>'+domain+'/</loc>') &&
  sitemap.includes('<loc>'+domain+'/projects/</loc>') &&
  sitemap.includes('<loc>'+domain+'/research.html</loc>'),
  'Sitemap should retain key public entry points');

console.log((checks-failures)+'/'+checks+' static checks passed.');
if(failures)process.exitCode=1;
