/* Browser-rendered regression checks using Chromium and axe-core.
   Output is attached to each GitHub Actions run. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'quality-artifacts');
fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
const origin=process.env.SITE_URL||'http://127.0.0.1:4173';
const cases=[
  {path:'/',width:1440,theme:'light',imageCheck:true,screenshot:true},
  {path:'/',width:768,theme:'light'},
  {path:'/',width:390,theme:'light',imageCheck:true,screenshot:true},
  {path:'/',width:320,theme:'light'},
  {path:'/',width:390,theme:'dark',screenshot:true},
  {path:'/',width:1440,theme:'dark'},
  {path:'/projects/nasa.html',width:390,theme:'light',imageCheck:true,screenshot:true},
  {path:'/projects/nasa.html',width:1440,theme:'light',imageCheck:true,screenshot:true},
  {path:'/projects/nasa.html',width:390,theme:'dark',screenshot:true},
  {path:'/projects/iverify.html',width:390,theme:'light'},
  {path:'/projects/controls.html',width:390,theme:'light'},
  {path:'/projects/vna.html',width:390,theme:'light',imageCheck:true},
  {path:'/projects/index.html',width:390,theme:'light',imageCheck:true,screenshot:true},
  {path:'/projects/dmx.html',width:390,theme:'light'},
  {path:'/projects/hall.html',width:390,theme:'light'},
  {path:'/projects/huemotion.html',width:390,theme:'light'},
  {path:'/projects/powershell.html',width:390,theme:'light'},
  {path:'/projects/prodriver.html',width:390,theme:'light'},
  {path:'/projects/thermal.html',width:390,theme:'light'},
  // The résumé and remaining project pages also need rendered coverage.
  {path:'/resume.html',width:390,theme:'light',screenshot:true},
  {path:'/resume.html',width:390,theme:'dark'},
  {path:'/resume.html',width:1440,theme:'light'},
  {path:'/projects/alu.html',width:390,theme:'light'},
  {path:'/projects/fingerprint.html',width:390,theme:'light'},
  {path:'/projects/leg.html',width:390,theme:'light'},
  {path:'/projects/motor.html',width:390,theme:'light'},
  {path:'/projects/ur3e.html',width:390,theme:'light'},
  {path:'/projects/vhdl.html',width:390,theme:'light'},
  {path:'/projects/index.html',width:390,theme:'dark'}
];
const issues=[];
if(!'rgb(12, 34, 56)'.match(/rgba?\(([^)]+)\)/))
  throw new Error('Caption color parser regression');

const results=[];
function note(message){issues.push(message);console.error('::error::'+message)}
function short(s){return String(s||'').replace(/\s+/g,' ').slice(0,150)}
async function audit(){
  const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  try{
    for(const test of cases){
      const context=await browser.newContext({
        viewport:{width:test.width,height:900},
        colorScheme:test.theme==='dark'?'dark':'light',
        reducedMotion:'reduce',
        deviceScaleFactor:1
      });
      await context.addInitScript(theme=>{
        try{localStorage.setItem('kailani-theme',theme)}catch{}
      },test.theme);
      const page=await context.newPage();
      const tag=test.path==='/'?'home':test.path.split('/').filter(Boolean).join('-');
      const id=tag+'-'+test.width+'-'+test.theme;
      const jsErrors=[];
      page.on('pageerror',error=>jsErrors.push(short(error.message)));
      try{
        const response=await page.goto(origin+test.path,{waitUntil:'domcontentloaded',timeout:40000});
        if(!response || response.status()>=400)note(id+': HTTP '+(response?response.status():'no response'));
        await page.waitForTimeout(750);
        const layout=await page.evaluate(()=>{
          const viewport=document.documentElement.clientWidth;
          const width=Math.max(document.body.scrollWidth,document.documentElement.scrollWidth);
          const culprits=[...document.querySelectorAll('body *')].filter(el=>{
            const r=el.getBoundingClientRect();
            const cs=getComputedStyle(el);
            return cs.position!=='fixed'&&r.width>0&&r.right>viewport+5&&r.left<viewport;
          }).slice(0,5).map(el=>el.tagName.toLowerCase()+
            (el.id?'#'+el.id:'')+
            (typeof el.className==='string'&&el.className.trim()?'.'+el.className.trim().replace(/\s+/g,'.').slice(0,65):''));
          return {viewport,scrollWidth:width,culprits,h1:document.querySelectorAll('h1').length,
            theme:document.documentElement.dataset.theme};
        });
        if(layout.scrollWidth>layout.viewport+3)note(id+': horizontal overflow '+layout.scrollWidth+' > '+layout.viewport+'; '+layout.culprits.join(', '));
        if(layout.h1!==1)note(id+': expected one h1, found '+layout.h1);
        if(layout.theme!==test.theme)note(id+': theme mismatch (rendered '+layout.theme+')');
        if(test.path==='/projects/index.html'&&test.theme==='light'&&test.width===390){
          await page.goto(origin+'/projects/index.html?area=robotics',{waitUntil:'load'});
          if((await page.locator('#directory-count').textContent()||'').trim()!=='Showing 3 of 16 engineering projects')
            note(id+': robotics deep link did not filter to three projects');
          if(await page.locator('[data-gallery-filter="robotics"]').getAttribute('aria-pressed')!=='true')
            note(id+': shared discipline filter was not active');
          if(!await page.locator('#directory-clear').isVisible())
            note(id+': filter-clear action should appear when filtered');
          await page.locator('#directory-search').fill('UR3e');
          if((await page.locator('#directory-count').textContent()||'').trim()!=='Showing 1 of 16 engineering projects'||
             !new URL(page.url()).searchParams.get('q'))
            note(id+': project search did not filter or preserve its query in URL');
          await page.reload({waitUntil:'load'});
          if(await page.locator('#directory-search').inputValue()!=='UR3e'||
             (await page.locator('#directory-count').textContent()||'').trim()!=='Showing 1 of 16 engineering projects')
            note(id+': reloading a shared project search lost its filters');
          await page.locator('#directory-clear').click();
          if((await page.locator('#directory-count').textContent()||'').trim()!=='Showing 16 of 16 engineering projects'||
             new URL(page.url()).searchParams.has('area')||
             new URL(page.url()).searchParams.has('q'))
            note(id+': clear filters did not restore all sixteen projects and clean URL');
        }
        if(test.path==='/'&&test.theme==='light'&&(test.width===1440||test.width===390)){
          const extras=page.locator('.ambient-field .ambient-star--extra');
          const extraTotal=await extras.count();
          const visibleExtras=await extras.evaluateAll(stars=>stars.filter(el=>getComputedStyle(el).display!=='none').length);
          if(extraTotal!==44 || visibleExtras!==(test.width===390?22:44))
            note(id+': background star density mismatch: '+extraTotal+' total, '+visibleExtras+' displayed');
          if(!await extras.first().evaluate(el=>getComputedStyle(el).pointerEvents==='none'))
            note(id+': background stars should not intercept clicks');
        }
        if(test.path==='/projects/index.html'){
          const thumbs=page.locator('.project-directory-grid .directory-card-visual img');
          if(await thumbs.count()!==16) note(id+': expected 16 project thumbnails');
          const first=thumbs.first();
          if(await first.count()){
            await first.evaluate(el=>el.decode().catch(()=>{}));
            if(!await first.evaluate(el=>el.complete && el.naturalWidth>0)) note(id+': directory preview did not load');
          }
          if(!await page.locator('a[href="../index.html#bookshelf"]').count()) note(id+': bookshelf link missing');
        }
        if(test.path==='/'&&test.theme==='light'&&(test.width===1440||test.width===390)){
          // The menu must expose every individual project without navigating away
          // from the homepage or breaking the existing bookshelf and planets.
          const projectsMenu=page.locator('#projects-nav-menu');
          if(test.width===390)await page.locator('#menu-toggle').click();
          await projectsMenu.locator('summary').click();
          if(!await projectsMenu.evaluate(el=>el.open))
            note(id+': Projects disclosure did not open');
          const projectsMenuLinks=projectsMenu.locator('.nav-projects__group a');
          if(await projectsMenuLinks.count()!==16)
            note(id+': expected 16 directly linked projects in the navigation');
          const menuDestinations=await projectsMenuLinks.evaluateAll(links=>links.map(a=>a.getAttribute('href')));
          if(new Set(menuDestinations).size!==16 ||
             !menuDestinations.includes('projects/nasa.html') ||
             !menuDestinations.includes('projects/powershell.html'))
            note(id+': project menu targets missing or duplicated');
          if(!await projectsMenu.locator('a[href="projects/thermal.html"]').isVisible())
            note(id+': project links should become visible in open navigation');
          if(!await projectsMenu.locator('a[href="projects/index.html"]').isVisible())
            note(id+': project-directory overview link not visible');
          await page.keyboard.press('Escape');
          if(await projectsMenu.evaluate(el=>el.open))
            note(id+': Projects dropdown should close with Escape');
          if(test.width===390){
            const nav=page.locator('#nav-links');
            const mobileToggle=page.locator('#menu-toggle');
            // Escape also closes the containing hamburger menu via the site's
            // existing keyboard handler. Test reopening and closing separately.
            if(await nav.isVisible())await mobileToggle.click();
            if(await nav.isVisible())
              note(id+': mobile navigation stayed open after dismissal');
            await mobileToggle.click();
            if(!await nav.isVisible())
              note(id+': hamburger could not reopen navigation');
            await mobileToggle.click();
            if(await nav.isVisible())
              note(id+': hamburger could not close navigation');
          }
        }
        if(test.path==='/') {
          if(await page.locator('.selected-project-preview img').count()!==3)
            note(id+': expected three illustrated featured engineering projects');
          if(!await page.locator('#bookshelf').isVisible()) note(id+': bookshelf should be visible');
          if(!await page.locator('#repo-planetarium').isVisible()) note(id+': planetarium should be visible');
          if(await page.locator('[data-open-book]').count()!==16) note(id+': expected 16 project books');
          if(await page.locator('.repo-planet').count()!==5) note(id+': expected 5 repository planets');
        }
        if(test.path==='/'&&test.theme==='light'&&(test.width===1440||test.width===390)){
          // Exercise the actual book interaction, not just the presence of spines.
          const reader=page.locator('#project-book-dialog');
          if(!await reader.count())note(id+': bookshelf reader dialog missing');
          else{
            await page.locator('[data-open-book="nasa"]').click();
            try{
              await page.waitForFunction(()=>document.getElementById('project-book-dialog')?.open,{},{timeout:5000});
            }catch{note(id+': clicking NASA project book did not open the reader')}
            if(await reader.evaluate(el=>el.open)){
              const title=(await page.locator('#book-modal-title').textContent()||'').trim();
              if(title!=='Robotics for Another World')note(id+': unexpected book title after click: '+title);
              const url=await page.locator('#book-project-link').getAttribute('href');
              if(url!=='projects/nasa.html')note(id+': reader project link incorrect: '+url);
              const select=page.locator('#book-switch-select');
              if(await select.locator('option').count()!==16)
                note(id+': sixteen project options required in switcher');
              if(await select.inputValue()!=='nasa')
                note(id+': project switcher not synchronized with selected book');
              await page.locator('#book-next').click();
              const second=(await page.locator('#book-modal-title').textContent()||'').trim();
              if(second!=='UR3e Robot Kinematics')note(id+': next-book control failed: '+second);
              if(await select.inputValue()!=='ur3e')
                note(id+': switcher not updated after Next');
              await select.selectOption('powershell');
              if((await page.locator('#book-modal-title').textContent()||'').trim()!=='PowerShell Systems & Concurrency')
                note(id+': direct jump to project 16 failed');
              if((await page.locator('#book-counter').textContent()||'').trim()!=='Book 16 of 16')
                note(id+': book counter did not update on direct jump');
              if(await page.locator('#book-next').isEnabled())note(id+': Next must be disabled for project 16');
              await select.selectOption('thermal');
              if((await page.locator('#book-modal-title').textContent()||'').trim()!=='Thermal Controller & Logger')
                note(id+': direct jump to Thermal Logger failed');
              if(await page.locator('#book-project-link').getAttribute('href')!=='projects/thermal.html')
                note(id+': project detail link not synchronized');
              if(test.width===390){
                await page.locator('#book-next-page').click();
                const status=await page.locator('#book-page-status').textContent();
                if(!status?.includes('Page 2 of 2'))note(id+': mobile book page turn failed');
              }
              await page.locator('#close-project-book').click();
              if(await reader.evaluate(el=>el.open))note(id+': book close control failed');
            }
          }
        }
        if(test.path==='/'&&test.theme==='light'&&(test.width===1440||test.width===390)){
          // Moving between 2D and 3D must not change arm geometry or joint pose.
          await page.locator('[data-robot-view="2d"]').click();
          const bones=await page.locator('#arm-bones > line').evaluateAll(elements=>elements.map(el=>({
            id:el.id,stroke:el.getAttribute('stroke'),length:el.getTotalLength(),
            style:getComputedStyle(el).stroke
          })));
          if(bones.length!==3 ||
             bones.some((bone,i)=>!bone.stroke?.startsWith('#')||
               !Number.isFinite(bone.length)||bone.length<[150,150,70][i] ||
               bone.style.includes('url('))){
            note(id+': 2D link hidden or missing: '+JSON.stringify(bones));
          }
          const floor2d=page.locator('[data-pose="floor"]');
          await floor2d.click();
          const first2d=(await page.locator('#side-tip-readout').textContent()||'');
          const z2d=Number(first2d.match(/z:\s*([+-]?[\d.]+)/i)?.[1]);
          if(!Number.isFinite(z2d)||Math.abs(z2d-.5)>.2)
            note(id+': 2D floor preset should approach 0.5in, got '+first2d);
          await page.locator('[data-robot-view="3d"]').click();
          try{await page.waitForFunction(()=>
            document.getElementById('robot-3d-status')?.textContent?.includes('Tip z:'),
            null,{timeout:6000});
          }catch{note(id+': 3D renderer did not initialize when switched from 2D')}
          if(await page.locator('#r3d-elbow').inputValue()!=='72')
            note(id+': 2D floor preset did not transfer elbow angle into 3D');
          const first3d=(await page.locator('#robot-3d-status').textContent()||'');
          const z3d=Number(first3d.match(/Tip z:\s*([+-]?[\d.]+)/)?.[1]);
          if(!Number.isFinite(z3d)||Math.abs(z3d-z2d)>.12)
            note(id+': 2D and 3D floor heights disagree: '+first2d+' / '+first3d);
          await page.locator('#r3d-shoulder').evaluate(input=>{
            input.value='20';
            input.dispatchEvent(new Event('input',{bubbles:true}));
          });
          await page.locator('[data-robot-view="2d"]').click();
          if(await page.locator('#joint-shoulder').inputValue()!=='20')
            note(id+': shoulder angle did not transfer from 3D back to 2D');
          await page.locator('#joint-elbow').evaluate(input=>{
            input.value='100';
            input.dispatchEvent(new Event('input',{bubbles:true}));
          });
          await page.locator('[data-robot-view="3d"]').click();
          if(await page.locator('#r3d-elbow').inputValue()!=='100')
            note(id+': manual 2D elbow angle did not transfer to 3D');
          await page.locator('[data-3d-pose="home"]').click();
        }
        // Captions are supporting technical content and must remain readable,
        // not merely visible. Check every rendered case-study and homepage figure.
        const captions=await page.locator('figure figcaption:visible').evaluateAll(elements=>{
          const channel=color=>{
            const m=color.match(/rgba?\(([^)]+)\)/);
            if(!m)return null;
            const parts=m[1].split(',').map(Number);
            return parts.length>=3?parts:null;
          };
          const luminance=parts=>{
            const linear=parts.slice(0,3).map(v=>{
              const n=v/255;
              return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;
            });
            return linear[0]*0.2126+linear[1]*0.7152+linear[2]*0.0722;
          };
          return elements.map(el=>{
            const cs=getComputedStyle(el);
            const text=channel(cs.color);
            const bg=channel(cs.backgroundColor);
            const contrast=text&&bg&&bg[3]!==0
              ?(Math.max(luminance(text),luminance(bg))+0.05)/
               (Math.min(luminance(text),luminance(bg))+0.05)
              :null;
            const r=el.getBoundingClientRect();
            return {text:el.textContent.trim().slice(0,85),
              fontSize:parseFloat(cs.fontSize),color:cs.color,bg:cs.backgroundColor,
              visibility:cs.visibility,opacity:Number(cs.opacity),
              width:r.width,height:r.height,contrast};
          });
        });
        for(const caption of captions){
          if(caption.visibility!=='visible'||caption.opacity<0.95||
            caption.width<1||caption.height<1)
            note(id+': figure caption hidden: '+caption.text);
          if(caption.fontSize<13.8)
            note(id+': figure caption is too small ('+caption.fontSize+'px): '+caption.text);
          if(caption.contrast!==null&&caption.contrast<4.5)
            note(id+': figure caption has insufficient contrast ('+
              caption.contrast.toFixed(2)+':1): '+caption.text);
        }
        if(test.path==='/projects/nasa.html'){
          const figures=page.locator('.nasa-figure');
          const links=page.locator('.nasa-figure .nasa-figure__zoom');
          if(await figures.count()!==4 || await links.count()!==4)
            note(id+': expected four technical figures with full-size links');
        }
        if(test.imageCheck){
          for(const img of await page.locator('img:visible').all()){
            await img.scrollIntoViewIfNeeded({timeout:6500});
            const image=await img.evaluate(async el=>{
              try{await Promise.race([el.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('image timeout')),7000))])}catch{}
              const r=el.getBoundingClientRect();
              return {src:el.getAttribute('src'),loaded:el.complete&&el.naturalWidth>0,
                naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
                width:r.width,height:r.height,alt:el.getAttribute('alt')};
            });
            if(!image.loaded)note(id+': image failed to load: '+image.src);
            if(image.width<1||image.height<1)note(id+': visible image has zero display size: '+image.src);
            if(image.alt===null)note(id+': image missing alt attribute: '+image.src);
            if(image.src?.includes('assets/Arm.jpg')&&image.width>205)
              note(id+': robotics accent exceeds 205px: '+image.width);
            const nativePhoto=/\/(?:sls-rocket-kailani|nasa-sls-team|nasa-astronaut-suit|nasa-mission-patches|Arm|robotics-lab-rover|graduation-flowers|cleanroom-suit|nasa-mission-training-complex)\.(?:jpeg|jpg)$/.test(image.src||'');
            if(nativePhoto && image.loaded && image.width>0 && image.height>0){
              const original=image.naturalWidth/image.naturalHeight;
              const displayed=image.width/image.height;
              if(Math.abs(displayed-original)/original>0.08)
                note(id+': photo has distorted proportions/cropping: '+image.src+
                  ' ('+displayed.toFixed(2)+' displayed, '+original.toFixed(2)+' original)');
            }
            if(image.src?.includes('assets/Creo-1.jpg')&&image.width>285)
              note(id+': CAD accent exceeds 285px: '+image.width);
            if(test.path==='/projects/vna.html'&&image.src?.includes('assets/VNA.jpg')&&image.width>285)
              note(id+': VNA accent exceeds 285px: '+image.width);
          }
        }
        if(test.screenshot && test.path==='/projects/nasa.html'){
          for(const figureId of ['nasa-fig-01','nasa-fig-02','nasa-fig-03','nasa-fig-04']){
            await page.locator('#'+figureId).screenshot({
              path:path.join(out,'screenshots',id+'-'+figureId+'.png'),
              animations:'disabled',timeout:20000
            });
          }
        }
        if(test.screenshot){

await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
          await page.screenshot({path:path.join(out,'screenshots',id+'.png'),animations:'disabled'});
          if(test.path==='/'){
            // Capture both robot renderers, not just text/status assertions.
            const robotPane=page.locator('.robot-viewport');
            if(await robotPane.count()){
              await page.locator('[data-robot-view="3d"]').click();
              await page.waitForTimeout(300);
              await robotPane.screenshot({
                path:path.join(out,'screenshots',id+'-robot-3d.png'),
                animations:'disabled',timeout:12000
              });
              await page.locator('[data-robot-view="2d"]').click();
              await page.waitForTimeout(100);
              await robotPane.screenshot({
                path:path.join(out,'screenshots',id+'-robot-2d.png'),
                animations:'disabled',timeout:12000
              });
              await page.locator('[data-robot-view="3d"]').click();
            }
            for(const [name,selector] of [
              ['featured-projects','#featured-projects'],
              ['nasa-photo-accents','#portfolio-photo-gallery'],
              ['education-photo','.education-panel'],
              ['about-photos','#about'],
              ['project-books','#bookshelf'],
              ['orbit-planets','#repo-planetarium']
            ]){
              const element=page.locator(selector).first();
              if(await element.count()){

await element.screenshot({
                  path:path.join(out,'screenshots',id+'-'+name+'.png'),
                  animations:'disabled',timeout:12000
                });
              }
            }
          }
        }
        await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
        const accessibility=await page.evaluate(async()=>{
          const report=await window.axe.run(document,{
            runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}
          });
          return {
            violations:report.violations.map(v=>({
              id:v.id,impact:v.impact,description:v.help,helpUrl:v.helpUrl,
              nodes:v.nodes.slice(0,8).map(n=>({target:n.target,summary:n.failureSummary}))
            })),
            incomplete:report.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))
          };
        });
        for(const v of accessibility.violations){
          const target=v.nodes[0]?.target?.join(' ')||'unknown element';
          // Every confirmed WCAG issue is actionable. The complete report is retained.
          note(id+': axe '+v.id+' ('+v.impact+') at '+target+': '+v.nodes.length+' example node(s)');
        }
        for(const e of jsErrors)note(id+': JavaScript error: '+e);
        results.push({id,path:test.path,width:test.width,theme:test.theme,layout,jsErrors,accessibility});
        console.log(id+': '+layout.scrollWidth+'px document; '+accessibility.violations.length+' accessibility rule violations');
      }catch(error){
        note(id+': browser test failed: '+short(error.stack||error.message));
        results.push({id,error:short(error.stack||error.message)});
      }finally{await context.close()}
    }
    await require("./mobile-layout.js")(browser,origin,note,out);
  }finally{await browser.close()}
  fs.writeFileSync(path.join(out,'browser-quality.json'),JSON.stringify({origin,cases:results,issues},null,2));
  console.log('Browser audit: '+results.length+' cases, '+issues.length+' issues. Report: quality-artifacts/browser-quality.json');
  if(issues.length)process.exitCode=1;
}
audit().catch(error=>{console.error(error);process.exitCode=1});
