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
  {path:'/404.html',width:390,screenshot:true},
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
  {path:'/404.html',width:390,theme:'dark'},
  {path:'/',width:390,screenshot:true,theme:'dark'},
  {path:'/research.html',width:390,screenshot:true,theme:'dark'},
  {path:'/projects/index.html',width:390,screenshot:true,theme:'dark'},
  ...slugs.flatMap(slug=>[390,1440].map(width=>({
    path:'/projects/'+slug+'.html',width,theme:'dark'
  }))),
  {path:'/workbench.html',width:390,theme:'dark'},
  {path:'/academic-cv.html',width:390,theme:'dark'},
  {path:'/resume.html',width:390,theme:'dark'},
  ...['/', '/research.html', '/projects/index.html', '/projects/nasa.html',
    '/workbench.html', '/academic-cv.html', '/resume.html']
    .map(path=>({path,width:390,theme:'invalid'}))
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
      if(test.theme==='invalid'){
        await context.addInitScript(()=>{try{localStorage.setItem('kailani-theme','invalid-value')}catch(_){}});
      }
      if(test.theme==='dark'){
        await context.addInitScript(()=>{try{localStorage.setItem('kailani-theme','dark')}catch(_){}});
      }
      const page=await context.newPage();
      const name=label(test);
      let earlyTheme;
      if(test.theme==='dark' && ['/', '/academic-cv.html', '/resume.html'].includes(test.path)){
        // Observe the saved preference before the deferred toggle script is delivered.
        await page.route(url=>url.pathname.endsWith('/unified-theme.js'),async route=>{
          await page.locator('link[rel="stylesheet"]').first().waitFor({state:'attached'});
          earlyTheme=await page.locator('html').getAttribute('data-theme');
          await route.continue();
        });
      }
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      try {
        const response=await page.goto(origin+test.path,{waitUntil:'domcontentloaded',timeout:40000});
        if(!response || response.status()>=400)note(name+': document did not load');
        await page.waitForTimeout(230);
        if(test.theme==='invalid'){
          const chosen=await page.locator('html').getAttribute('data-theme');
          if(chosen!=='light')note(name+': invalid preference should fall back to light mode');
        }
        if(test.theme==='dark'){
          const chosen=await page.locator('html').getAttribute('data-theme');
          if(chosen!=='dark')note(name+': dark theme did not initialize');
          if(['/', '/academic-cv.html', '/resume.html'].includes(test.path) && earlyTheme!=='dark')
            note(name+': saved dark theme was not applied before the deferred script');
        }
        const expectedThemeColor=test.theme==='dark'?'#211a3b':'#fffbfd';
        const actualThemeColor=await page.locator('meta[name="theme-color"]').getAttribute('content');
        if(actualThemeColor!==expectedThemeColor)
          note(name+': browser theme-color mismatch, got '+actualThemeColor);
        if(test.width===1440 && !test.theme && ['/', '/workbench.html'].includes(test.path)){
          const toggle=page.locator(test.path==='/'?'.cosmic-shared-toggle':'#wb-theme');
          await toggle.click();
          if(await page.locator('html').getAttribute('data-theme')!=='dark' ||
            await page.locator('meta[name="theme-color"]').getAttribute('content')!=='#211a3b')
            note(name+': switching to dark mode did not synchronize browser theme color');
          await toggle.click();
          if(await page.locator('html').getAttribute('data-theme')!=='light' ||
            await page.locator('meta[name="theme-color"]').getAttribute('content')!=='#fffbfd')
            note(name+': switching to light mode did not synchronize browser theme color');
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
        if(test.path==='/404.html'){
          if(!await page.locator('meta[name="robots"][content="noindex"]').count())
            note(name+': missing noindex directive on custom 404 page');
          if(!await page.locator('a[href="projects/index.html"]').count())
            note(name+': not-found page needs a way back to projects');
        }
        if(test.path==='/') {
          const cards=await page.locator('.work-card').count();
          if(cards!==6)note(name+': expected six curated project cards, found '+cards);
          const mediaLabels=page.locator('.work-card figure .work-media-note');
          if(await mediaLabels.count()!==6)note(name+': expected a visible provenance label on each project');
          else {
            const visible=await mediaLabels.evaluateAll(els=>els.every(el=>{
              const s=getComputedStyle(el),r=el.getBoundingClientRect();
              return s.visibility==='visible'&&s.display!=='none'&&r.width>0&&r.height>0;
            }));
            if(!visible)note(name+': a project visual provenance label is not visible');
          }
          const resultBorders=await page.locator('#selected-work .work-card').evaluateAll(cards=>
            cards.every(card=>{
              const style=getComputedStyle(card.querySelector('.work-result'));
              return parseFloat(style.borderTopWidth)>=1 && parseFloat(style.lineHeight)>20;
            }));
          if(!resultBorders)note(name+': project evidence needs readable separators');
          const gridLayout=await page.locator('#selected-work .work-grid').evaluate(grid=>{
            const list=[...grid.querySelectorAll('.work-card')];
            const media=list.map(card=>card.querySelector('figure')?.getBoundingClientRect().height||0);
            const rects=list.map(card=>card.getBoundingClientRect());
            return {
              columns:getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
              mediaRange:Math.max(...media)-Math.min(...media),
              pairsAligned:[0,2,4].every(i=>Math.abs(rects[i].top-rects[i+1].top)<2),
              equalCardRows:[0,2,4].every(i=>Math.abs(rects[i].height-rects[i+1].height)<2)
            };
          });
          if(test.width>=761){
            if(gridLayout.columns!==2 || !gridLayout.pairsAligned || !gridLayout.equalCardRows ||
               gridLayout.mediaRange>2)
              note(name+': six featured projects are not evenly aligned in three desktop rows');
          } else if(gridLayout.columns!==1 || gridLayout.mediaRange>2){
            note(name+': featured projects should stack with even media heights on narrow screens');
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
            if(visible && contact){
              await menu.press('Escape');
              const closedOnEscape=await page.locator('.cosmic-mobile-menu').evaluate(el=>!el.open);
              const focusReturned=await menu.evaluate(el=>document.activeElement===el);
              if(!closedOnEscape || !focusReturned)
                note(name+': Escape did not close the menu and return focus');
              await menu.click();
              await page.locator('.cosmic-mobile-links a[href="#contact"]').click();
              if(await page.locator('.cosmic-mobile-menu').evaluate(el=>el.open))
                note(name+': mobile menu did not close after following the Contact link');
              if(new URL(page.url()).hash!=='#contact')
                note(name+': mobile Contact anchor did not navigate');
            }
          }
        }
        if(test.path==='/projects/index.html') {
          const badges=await page.locator('[data-gallery-filter]').evaluateAll(buttons=>
            Object.fromEntries(buttons.map(button=>[
              button.dataset.galleryFilter,
              Number(button.querySelector('.directory-filter-count')?.textContent)
            ])));
          if(badges.all!==20 || badges.research!==2 || badges.source!==5)
            note(name+': initial discipline counts should cover all 20 indexed entries');
          const archiveMedia=await page.locator('.project-directory-grid img')
            .evaluateAll(imgs=>imgs.map(img=>({
              loading:img.getAttribute('loading'),
              priority:img.getAttribute('fetchpriority'),
              alt:img.getAttribute('alt'),
              width:img.getAttribute('width'),
              height:img.getAttribute('height')
            })));
          if(archiveMedia.length!==16 ||
            archiveMedia.some((m,i)=>m.loading!=='lazy' ||
              (i>=3?m.priority!=='low':m.priority==='low') ||
              !m.alt || !m.width || !m.height))
            note(name+': offscreen archive illustrations should retain lazy loading, provenance and low network priority');
          const jumpLinks=page.locator('#directory-jump [data-directory-jump]');
          const initialJumps=await jumpLinks.evaluateAll(links=>
            Object.fromEntries(links.map(link=>[
              link.dataset.directoryJump,
              Number(link.querySelector('.directory-jump__count')?.textContent)
            ])));
          if(await jumpLinks.count()!==5 ||
            initialJumps['group-robotics']!==3 ||
            initialJumps['group-embedded']!==4 ||
            initialJumps['group-measurement']!==5 ||
            initialJumps['group-software']!==4 ||
            initialJumps['additional-project-briefs']!==4)
            note(name+': in-page section navigation must count all 20 projects');
          const briefs=page.locator('#additional-project-briefs .directory-brief-card');
          if(await briefs.count()!==4)note(name+': expected four CV and résumé project briefs');
          else {
            const briefUrls=await briefs.locator('a').evaluateAll(links=>
              links.map(link=>link.getAttribute('href')));
            for(const target of [
              '../research.html#regolith-analysis','../research.html#propulsion-testing',
              '../research.html#instron-processing','motor.html#arduino-pi-control'
            ]) if(!briefUrls.includes(target))note(name+': project brief missing destination '+target);
            const gridColumns=await page.locator('#additional-project-briefs .directory-brief-grid')
              .evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
            if(test.width<=720 && gridColumns!==1)
              note(name+': additional briefs must stack on narrow screens');
          }
          // The four additional CV/résumé briefs participate in the same search.
          const archiveSearch=page.locator('#directory-search');
          for(const [query,title] of [
            ['imagej contamination','Lunar-regolith'],
            ['instron friction','Instron'],
            ['motor generator','DC motor']
          ]) {
            await archiveSearch.fill(query);
            if(query==='imagej contamination'){
              const availableJumps=await page.locator('#directory-jump [data-directory-jump]:visible')
                .evaluateAll(links=>links.map(link=>link.dataset.directoryJump));
              if(availableJumps.length!==1 || availableJumps[0]!=='additional-project-briefs' ||
                !await page.locator('#directory-jump [data-directory-jump="additional-project-briefs"]')
                  .getAttribute('aria-label').then(text=>text?.includes('1 visible project')))
                note(name+': section shortcuts should hide empty groups after search');
              const counts=await page.locator('[data-gallery-filter]').evaluateAll(buttons=>
                Object.fromEntries(buttons.map(button=>[
                  button.dataset.galleryFilter,
                  Number(button.querySelector('.directory-filter-count')?.textContent)
                ])));
              if(counts.all!==1 || counts.measurement!==1 || counts.source!==0)
                note(name+': filter counts should respond to a live technical search');
            }
            const found=page.locator('#additional-project-briefs .directory-brief-card:visible');
            if(await found.count()!==1 ||
              !(await found.first().locator('h3').textContent()).includes(title) ||
              await page.locator('#directory-empty').isVisible())
              note(name+': search should find the additional brief for '+query);
          }
          await page.locator('[data-gallery-filter="embedded"]').click();
          if(await page.locator('#additional-project-briefs .directory-brief-card:visible').count()!==1)
            note(name+': category and query together should find the Arduino motor brief');
          await page.locator('#directory-clear').click();
          if(await page.locator('#additional-project-briefs .directory-brief-card:visible').count()!==4)
            note(name+': resetting search and category should restore four briefs');
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
            // Category selections create browser-history steps without one per keystroke.
            await page.evaluate(()=>history.back());
            await page.waitForFunction(()=>!new URLSearchParams(location.search).has('area'));
            await page.waitForFunction(()=>[...document.querySelectorAll('[data-gallery-category]')].every(el=>!el.hidden));
            await page.evaluate(()=>history.forward());
            await page.waitForFunction(()=>new URLSearchParams(location.search).get('area')==='research');
            await page.waitForFunction(()=>[...document.querySelectorAll('[data-gallery-category]')].filter(el=>!el.hidden).length===2);
            const search=page.locator('#directory-search');
            await search.fill('not-a-real-engineering-project-xyz');
            if(await page.locator('[data-gallery-category]:visible').count()!==0 ||
              await page.locator('#directory-jump').isVisible() ||
              !await page.locator('#directory-empty').isVisible() ||
              !new URL(page.url()).searchParams.has('q'))
              note(name+': no-results search should display the empty state and shareable query');
            await search.press('Escape');
            if(await search.inputValue()!=='' ||
              await page.locator('[data-gallery-category]:visible').count()!==2 ||
              new URL(page.url()).searchParams.has('q'))
              note(name+': Escape should clear only the search while retaining faculty filter');
            await page.locator('.detail-heading h1').click();
            await page.keyboard.press('/');
            if(!await search.evaluate(el=>document.activeElement===el))
              note(name+': slash shortcut did not focus project search');
            const clear=page.locator('#directory-clear');
            await clear.click();
            if(await page.locator('[data-gallery-category]:visible').count()!==16 ||
              new URL(page.url()).searchParams.has('area'))
              note(name+': clearing faculty filter did not restore complete archive');
            const source=page.locator('[data-gallery-filter="source"]');
            await source.click();
            const sourceCards=page.locator('[data-gallery-category]:visible');
            if(await sourceCards.count()!==5 ||
              !(await page.locator('#directory-count').textContent()).includes('5 of 16') ||
              new URL(page.url()).searchParams.get('area')!=='source')
              note(name+': public-code filter should show five shareable project results');
            const projectNames=await sourceCards.locator('strong').allTextContents();
            if(!['Three-Link Leg Dynamics','Thermal Controller & Logger','ProDriver Sim','HueMotion','DMX Controller']
              .every(x=>projectNames.some(y=>y.replace(/\s+/g,' ').trim()===x)))
              note(name+': public-code filter omitted a project with verified source');
            await page.locator('#directory-clear').click();
            if(await page.locator('[data-gallery-category]:visible').count()!==16)
              note(name+': clearing public-code filter failed');
            // Search verified technical methods without requiring exact phrase order.
            await search.fill('Jacobian MATLAB');
            const roboticsTitles=await page.locator('[data-gallery-category]:visible strong').allTextContents();
            if(roboticsTitles.length!==2 ||
              !roboticsTitles.some(x=>x.includes('UR3e')) ||
              !roboticsTitles.some(x=>x.includes('Leg Dynamics')))
              note(name+': multiword technical search did not find both kinematics projects');
            await search.fill('python logging');
            const logger=await page.locator('[data-gallery-category]:visible strong').allTextContents();
            if(logger.length!==1 || !logger[0].includes('Thermal'))
              note(name+': technical keyword search did not find Python thermal logging');
            await search.fill('gestures webcam');
            const gestures=await page.locator('[data-gallery-category]:visible strong').allTextContents();
            if(gestures.length!==1 || !gestures[0].includes('HueMotion'))
              note(name+': reordered query should match verified webcam gesture work');
            await search.fill('SOLT S-parameters');
            const calibration=await page.locator('[data-gallery-category]:visible strong').allTextContents();
            if(calibration.length!==1 || !calibration[0].includes('Virtual Network Analyzer'))
              note(name+': punctuation-aware query should find VNA calibration');
            await search.fill('');
            await source.click();
            await search.fill('python');
            const currentLink=page.url();
            await page.context().grantPermissions(['clipboard-read','clipboard-write']);
            await page.locator('#directory-copy-link').click();
            // Clipboard writes are asynchronous; wait for success feedback before
            // reading the clipboard, especially on slower mobile CI workers.
            await page.waitForFunction(()=>
              document.querySelector('#directory-copy-link')?.textContent?.trim()==='Link copied');
            const copied=await page.evaluate(()=>navigator.clipboard.readText());
            if(copied!==currentLink ||
              (await page.locator('#directory-copy-link').textContent()).trim()!=='Link copied')
              note(name+': copy filtered view did not preserve search and category');
            await search.fill('matlab');
            if((await page.locator('#directory-copy-link').textContent()).trim()!=='Copy view link')
              note(name+': copy confirmation did not reset after changing the view');
            await page.locator('#directory-clear').click();
            if(await page.locator('[data-gallery-category]:visible').count()!==16)
              note(name+': clearing combined filters failed');
            const softwareJump=page.locator('#directory-jump [data-directory-jump="group-software"]');
            if(!await softwareJump.isVisible())
              note(name+': section shortcuts should reappear when filters are cleared');
            else{
              await softwareJump.click();
              if(new URL(page.url()).hash!=='#group-software' ||
                !await page.locator('#group-software').isVisible())
                note(name+': section shortcut did not navigate to the visible project group');
            }
          }
        }
        if(test.path==='/research.html') {
          const sections=await page.locator('main.research-container > section.research-section[id]')
            .evaluateAll(els=>els.map(el=>el.id));
          if(sections[0]!=='investigations' || sections[1]!=='directions')
            note(name+': documented research should precede proposed directions');
          if(!await page.locator('#investigations .research-study').count())
            note(name+': documented research card grid is missing');
        }
        if(test.path.startsWith('/projects/') && !test.path.endsWith('/index.html')) {
          if(!await page.locator('.project-evidence-first').count())note(name+': case study missing evidence summary');
           if(await page.locator('nav.project-reading-shortcuts, nav.detail-jump').count()!==1)
             note(name+': case study should have one reading navigation');
           if(!(await page.locator('#evidence-summary-title').textContent()).includes('Contribution, evidence, and limitations'))
             note(name+': case study heading should clarify evidence limitations');
           const evidenceFont=await page.locator('.project-evidence-first__item p').first()
             .evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
           if(evidenceFont<14)note(name+': evidence summaries should use readable text');
          const evidenceFacets=await page.locator('.project-evidence-first__item h3').allTextContents();
          if(evidenceFacets.length!==6 ||
            !['Problem','My contribution','Engineering tools','Validation method','Documented result','Limitations']
              .every((label,index)=>evidenceFacets[index]===label))
            note(name+': engineering evidence summary does not follow the shared six-facet structure');
          if(['/projects/nasa.html','/projects/leg.html','/projects/vna.html','/projects/thermal.html']
            .includes(test.path)) {
            const supporting=page.locator('#project-evidence');
            if(!await supporting.count() || !(await supporting.locator('a').count()))
              note(name+': flagship case study missing an inspectable evidence trail');
          }
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
        const buttonStates=[];
        if(test.theme==='dark'){
          const buttons=page.locator('.case-contact .btn-primary');
          for(let i=0;i<await buttons.count();i++){
            const button=buttons.nth(i);
            for(const interaction of ['default','hover','focus']){
              if(interaction==='hover')await button.hover();
              else if(interaction==='focus'){
                await page.mouse.move(0,0);
                await button.focus();
              }
              // Let color transitions settle before sampling the interactive state.
              await page.waitForTimeout(250);
              const contrast=await button.evaluate(async el=>{
                const result=await window.axe.run(el,{runOnly:{type:'rule',values:['color-contrast']}});
                // axe cannot resolve the ancestor's decorative grid pseudo-element.
                // These buttons have opaque fills above that grid; measure their
                // rendered foreground/background pair as an independent check.
                const style=getComputedStyle(el);
                const rgba=value=>(value.match(/[\d.]+/g)||[]).map(Number);
                const foreground=rgba(style.color),background=rgba(style.backgroundColor);
                const opaque=[foreground,background].every(c=>c.length===3 || (c.length===4 && c[3]===1));
                let fullOpacity=true;
                for(let node=el;node;node=node.parentElement)
                  if(getComputedStyle(node).opacity!=='1')fullOpacity=false;
                const luminance=channels=>channels.slice(0,3).map(v=>v/255)
                  .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
                  .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
                const a=luminance(foreground),b=luminance(background);
                const ratio=opaque && fullOpacity && style.backgroundImage==='none'
                  ? (Math.max(a,b)+.05)/(Math.min(a,b)+.05) : null;
                return {violations:result.violations,incomplete:result.incomplete,
                  foreground:style.color,background:style.backgroundColor,ratio};
              });
              buttonStates.push({button:i,state:interaction,...contrast});
              await button.screenshot({path:path.join(screenshotDir,name+'-contact-'+i+'-'+interaction+'.png')});
              if(contrast.violations.length || contrast.ratio===null || contrast.ratio<4.5)
                note(name+': contact button '+interaction+' contrast did not pass');
            }
          }
        }
        if(test.screenshot) {
          await page.screenshot({path:path.join(screenshotDir,name+'.png'),fullPage:true,animations:'disabled'});
        }
        reports.push({page:test.path,width:test.width,document:state,jsErrors:errors,axe,earlyTheme,buttonStates});
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
