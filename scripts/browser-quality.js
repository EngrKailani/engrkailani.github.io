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
  {path:'/projects/nasa.html',width:390,theme:'dark'},
  {path:'/projects/iverify.html',width:390,theme:'light'},
  {path:'/projects/controls.html',width:390,theme:'light'},
  {path:'/projects/vna.html',width:390,theme:'light',imageCheck:true},
  {path:'/projects/index.html',width:390,theme:'light'},
  {path:'/projects/dmx.html',width:390,theme:'light'},
  {path:'/projects/hall.html',width:390,theme:'light'},
  {path:'/projects/huemotion.html',width:390,theme:'light'},
  {path:'/projects/powershell.html',width:390,theme:'light'},
  {path:'/projects/prodriver.html',width:390,theme:'light'},
  {path:'/projects/thermal.html',width:390,theme:'light'}
];
const issues=[];
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
        if(test.path==='/'){
          const captions=await page.locator('figure figcaption:visible').evaluateAll(elements=>
            elements.map(el=>{
              const style=getComputedStyle(el);
              const color=style.color;
              const rect=el.getBoundingClientRect();
              return {text:el.textContent.trim().slice(0,85),color,
                visibility:style.visibility,opacity:Number(style.opacity),
                width:rect.width,height:rect.height};
            })
          );
          for(const caption of captions){
            if(caption.visibility!=='visible'||caption.opacity<0.95||
              caption.width<1||caption.height<1)
              note(id+': photo caption hidden: '+caption.text);
            if(test.theme==='light' && /rgb\\(2(?:[0-5]\\d),\\s*2(?:[0-5]\\d),\\s*2(?:[0-5]\\d)\\)/.test(caption.color))
              note(id+': photo caption too pale in light mode: '+caption.text);
          }
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
            if(image.src?.includes('assets/VNA.jpg')&&image.width>285)
              note(id+': VNA accent exceeds 285px: '+image.width);
          }
        }
        if(test.screenshot){
          await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
          await page.screenshot({path:path.join(out,'screenshots',id+'.png'),animations:'disabled'});
          if(test.path==='/'){
            for(const [name,selector] of [
              ['featured-projects','#featured-projects'],
              ['nasa-photo-accents','#portfolio-photo-gallery'],
              ['education-photo','.education-panel'],
              ['about-photos','#about']
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
  }finally{await browser.close()}
  fs.writeFileSync(path.join(out,'browser-quality.json'),JSON.stringify({origin,cases:results,issues},null,2));
  console.log('Browser audit: '+results.length+' cases, '+issues.length+' issues. Report: quality-artifacts/browser-quality.json');
  if(issues.length)process.exitCode=1;
}
audit().catch(error=>{console.error(error);process.exitCode=1});
