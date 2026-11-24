/* Responsive, image and WCAG browser checks for the professional portfolio. */
'use strict';
const { chromium }=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'quality-artifacts');
const screenshotDir=path.join(out,'screenshots');
fs.mkdirSync(screenshotDir,{recursive:true});
const origin=process.env.SITE_URL || 'http://127.0.0.1:4173';
const slugs=['nasa','leg','thermal','vna','iverify','ur3e','fingerprint',
  'alu','controls','dmx','hall','huemotion','motor','powershell','prodriver','vhdl'];
const cases=[
  {path:'/',width:1440,screenshot:true,images:true},
  {path:'/',width:768},
  {path:'/',width:390,screenshot:true,images:true},
  {path:'/',width:320},
  {path:'/research.html',width:1440,screenshot:true},
  {path:'/research.html',width:320},
  {path:'/academic-cv.html',width:1440},
  {path:'/academic-cv.html',width:320},
  {path:'/resume.html',width:1440},
  {path:'/resume.html',width:390},
  {path:'/projects/index.html',width:1440,screenshot:true},
  {path:'/projects/index.html',width:390},
  {path:'/workbench.html',width:1440},
  {path:'/workbench.html',width:320},
  ...slugs.map(slug=>({path:'/projects/'+slug+'.html',width:390})),
  {path:'/',width:1440,screenshot:true,theme:'dark'},
  {path:'/',width:390,screenshot:true,theme:'dark'},
  {path:'/research.html',width:390,screenshot:true,theme:'dark'},
  {path:'/projects/index.html',width:390,screenshot:true,theme:'dark'},
  {path:'/projects/nasa.html',width:390,theme:'dark'},
  {path:'/workbench.html',width:390,theme:'dark'},
  {path:'/academic-cv.html',width:390,theme:'dark'},
  {path:'/resume.html',width:390,theme:'dark'}
];
const issues=[];
const reports=[];
function note(s){issues.push(s);console.error('::error::'+s)}
function label(test){return (test.path==='/'?'home':test.path.replace(/^\//,'').replace(/\//g,'-'))+'-'+test.width+(test.theme?'-'+test.theme:'')}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  try {
    for(const test of cases) {
      const context=await browser.newContext({
        viewport:{width:test.width,height:900},
        colorScheme:'light',
        reducedMotion:'reduce',
        deviceScaleFactor:1
      });
      if(test.theme==='dark'){
        await context.addInitScript(()=>{try{localStorage.setItem('kailani-theme','dark')}catch(_){}});
      }
      const page=await context.newPage();
      const name=label(test);
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      try {
        const response=await page.goto(origin+test.path,{waitUntil:'domcontentloaded',timeout:40000});
        if(!response || response.status()>=400)note(name+': document did not load');
        await page.waitForTimeout(230);
        if(test.theme==='dark'){
          const chosen=await page.locator('html').getAttribute('data-theme');
          if(chosen!=='dark')note(name+': dark theme did not initialize');
        }
        const state=await page.evaluate(()=>{
          const doc=document.documentElement;
          const viewport=doc.clientWidth;
          const full=Math.max(doc.scrollWidth,document.body.scrollWidth);
          const h1=document.querySelectorAll('h1').length;
          return {viewport,full,h1,bodyText:document.body.innerText.length};
        });
        if(state.full>state.viewport+3)note(name+': horizontal overflow '+state.full+'px / '+state.viewport+'px');
        if(state.h1!==1)note(name+': expected one page-level heading, found '+state.h1);
        if(state.bodyText<150)note(name+': unexpectedly little readable content');
        if(errors.length)note(name+': JavaScript error: '+errors.join('; ').slice(0,320));
        if(test.path==='/') {
          const cards=await page.locator('.work-card').count();
          if(cards!==6)note(name+': expected six curated project cards, found '+cards);
          const gridLayout=await page.locator('#selected-work .work-grid').evaluate(grid=>{
            const list=[...grid.querySelectorAll('.work-card')];
            const media=list.map(card=>card.querySelector('figure')?.getBoundingClientRect().height||0);
            const rects=list.map(card=>card.getBoundingClientRect());
            return {
              columns:getComputedStyle(grid).gridTemplateColumns.trim().split(/\\s+/).length,
              mediaRange:Math.max(...media)-Math.min(...media),
              pairsAligned:[0,2,4].every(i=>Math.abs(rects[i].top-rects[i+1].top)<2),
              equalCardRows:[0,2,4].every(i=>Math.abs(rects[i].height-rects[i+1].height)<2)
            };
          });
          if(test.width>=761){
            if(gridLayout.columns!==2 || !gridLayout.pairsAligned || !gridLayout.equalCardRows ||
               gridLayout.mediaRange>2)
              note(name+': six featured projects are not evenly aligned in three desktop rows');
          } else if(gridLayout.columns!==1){
            note(name+': featured projects should stack in one column on narrow screens');
          }
          const intro=await page.locator('#hero-title').textContent();
          if(!intro.includes('reliable robots'))note(name+': main engineering focus not visible');
          if(await page.locator('#bookshelf, #robot-lab, #repo-orbit-shell, #case-explorer').count())
            note(name+': redundant homepage section still present');
          if(await page.locator('a[href="projects/index.html"]').count()<1 ||
            await page.locator('a[href="academic-cv.html"]').count()<1 ||
            await page.locator('a[href="resume.html"]').count()<1)
            note(name+': required portfolio navigation missing');
          if(test.width===390) {
            const nav=await page.locator('nav.cosmic-site-nav').isVisible();
            const menu=page.locator('.cosmic-mobile-menu summary');
            const visible=await menu.isVisible();
            if(nav && visible) await menu.click();
            const contact=visible && await page.locator('.cosmic-mobile-links a[href="#contact"]').isVisible();
            if(!nav || !visible || !contact)note(name+': mobile navigation is not accessible');
            if(visible) await page.locator('.cosmic-mobile-menu').evaluate(el=>{el.open=false});
          }
        }
        if(test.path==='/projects/index.html') {
          const faculty=page.locator('[data-gallery-filter="research"]');
          if(!await faculty.count()) {
            note(name+': faculty research filter is missing');
          } else {
            await faculty.click();
            const visible=await page.locator('[data-gallery-category]:visible').count();
            const text=await page.locator('#directory-count').textContent();
            const url=new URL(page.url());
            if(visible!==2 || !text.includes('2 of 16') || url.searchParams.get('area')!=='research')
              note(name+': faculty research filter should return two shareable results');
            const cards=await page.locator('[data-gallery-category]:visible').allTextContents();
            if(!cards.some(x=>x.includes('Three-Link')) || !cards.some(x=>x.includes('Virtual Network Analyzer')))
              note(name+': faculty research filter omitted an Honors Signature Experience');
            const clear=page.locator('#directory-clear');
            await clear.click();
            if(await page.locator('[data-gallery-category]:visible').count()!==16 ||
              new URL(page.url()).searchParams.has('area'))
              note(name+': clearing faculty filter did not restore complete archive');
          }
        }
        if(test.path.startsWith('/projects/') && !test.path.endsWith('/index.html')) {
          if(!await page.locator('.project-evidence-first').count())note(name+': case study missing evidence summary');
          const crumb=page.locator('nav.case-breadcrumb');
          if(!await crumb.count() || !await crumb.isVisible()) {
            note(name+': project breadcrumb missing or hidden');
          } else {
            const current=(await crumb.locator('[aria-current="page"]').textContent())?.trim();
            const title=(await page.locator('h1').textContent())?.trim();
            if(current!==title)note(name+': breadcrumb title and heading differ');
            const archive=crumb.locator('a[href="index.html"]');
            if(!await archive.isVisible())note(name+': project archive breadcrumb link is not visible');
          }
          const returnLink=page.locator('nav.detail-footer a.case-archive-return[href="index.html"]');
          if(!await returnLink.count())note(name+': missing return link to full project directory');
        }
        if(test.images) {
          await page.locator('img').evaluateAll(imgs=>imgs.forEach(img=>{img.loading='eager'}));
          await page.waitForTimeout(350);
          const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(x=>x.complete && x.naturalWidth===0).map(x=>x.getAttribute('src')));
          if(broken.length)note(name+': image failed to load: '+broken.slice(0,4).join(', '));
        }
        await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
        const axe=await page.evaluate(async()=>{
          const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
          return r.violations.filter(v=>['critical','serious'].includes(v.impact))
            .map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,summary:v.help,
              targets:v.nodes.slice(0,3).map(n=>({selector:n.target?.join(', '),html:n.html?.slice(0,140),failure:n.failureSummary?.slice(0,220)}))}));
        });
        if(axe.length)note(name+': serious WCAG issues '+JSON.stringify(axe).slice(0,500));
        if(test.screenshot) {
          await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true,animations:'disabled'});
        }
        reports.push({page:test.path,width:test.width,document:state,jsErrors:errors,axe});
      } catch(e) {
        note(name+': '+String(e.message||e).slice(0,300));
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(out,'browser-quality.json'),JSON.stringify({cases:reports,issues},null,2));
  console.log('Checked '+reports.length+' browser layouts. '+issues.length+' issue(s).');
  if(issues.length)process.exitCode=1;
})().catch(err=>{console.error(err);process.exitCode=1});
