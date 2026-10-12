/* Static portfolio checks. Run with: node scripts/site-check.js */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const domain='https://kailania.vercel.app';
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
  check(/<title>[\s\S]+?<\/title>/.test(html),file+' needs a document title');
  check(html.includes('portfolio-upgrade.css'),file+' missing responsive stylesheet');
  check(html.includes('portfolio-upgrade.js'),file+' missing behavior script');
  check(html.includes('<meta property="og:image"'),file+' missing preview image');
  check(html.includes(domain),file+' missing canonical domain');
  check(!html.includes('https://kalarcon775.github.io'),file+' references old canonical host');
  for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
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
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const directory=fs.readFileSync(path.join(projectDir,'index.html'),'utf8');
check(home.includes('id="robot-3d-canvas"'),'3D viewer missing');
check(home.includes('id="theme-toggle"'),'Theme toggle missing');
check(home.includes('data-robot-view="3d"'),'Robot view picker missing');
check((directory.match(/data-gallery-category=/g)||[]).length===16,'16 categorized gallery cards required');
check(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes(domain),'robots.txt wrong host');
check(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes(domain),'sitemap.xml wrong host');
console.log((failed?'FAIL':'PASS')+': '+(checks-failed)+'/'+checks+' static checks');
if(failed)process.exitCode=1;