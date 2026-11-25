/* Screenshot-diff safety net for pages not intentionally changed in a PR.
   Compare the PR branch with its actual base commit, not snapshots invented
   from the PR itself. Intentional content edits are tested separately. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'quality-artifacts','visual-regression');
fs.mkdirSync(output,{recursive:true});
const primary=process.env.SITE_URL||'http://127.0.0.1:4173';
const reference=process.env.BASELINE_URL||'http://127.0.0.1:4174';
const cases=[
  {route:'/',width:390,theme:'light'},
  {route:'/',width:1440,theme:'dark'},
  {route:'/projects/index.html',width:390,theme:'light'},
  {route:'/projects/index.html',width:1440,theme:'dark'},
  {route:'/projects/dmx.html',width:390,theme:'light'},
  {route:'/projects/hall.html',width:390,theme:'dark'},
  {route:'/projects/nasa.html',width:390,theme:'dark'},
  {route:'/workbench.html',width:390,theme:'light'}
];
async function capture(browser,base,test,filename){
  const context=await browser.newContext({
    viewport:{width:test.width,height:800},
    deviceScaleFactor:1,reducedMotion:'reduce'
  });
  try{
    await context.addInitScript(theme=>{
      try{localStorage.setItem('kailani-theme',theme)}catch(_){}
    },test.theme);
    const page=await context.newPage();
    await page.goto(base+test.route,{waitUntil:'domcontentloaded',timeout:40000});
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}'});
    await page.evaluate(async()=>{
      await document.fonts.ready;
      const visible=[...document.images].filter(img=>img.getBoundingClientRect().top<1000);
      await Promise.all(visible.map(img=>img.decode().catch(()=>{})));
    });
    await page.screenshot({path:path.join(output,filename),animations:'disabled'});
    return fs.readFileSync(path.join(output,filename)).toString('base64');
  }finally{await context.close()}
}
async function compare(browser,a,b){
  const page=await browser.newPage();
  try{
    return await page.evaluate(async({one,two})=>{
      const load=src=>new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;
        img.src='data:image/png;base64,'+src;
      });
      const [left,right]=await Promise.all([load(one),load(two)]);
      if(left.width!==right.width||left.height!==right.height)
        return {fraction:1,reason:'viewport dimensions changed'};
      const ctx=img=>{
        const canvas=document.createElement('canvas');
        canvas.width=img.width;canvas.height=img.height;
        const context=canvas.getContext('2d',{willReadFrequently:true});
        context.drawImage(img,0,0);
        return context.getImageData(0,0,img.width,img.height).data;
      };
      const a=ctx(left),b=ctx(right);let changed=0,used=0;
      for(let i=0;i<a.length;i+=4){
        if(a[i+3]===0 && b[i+3]===0)continue;
        used++;
        if(Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),
          Math.abs(a[i+2]-b[i+2]))>38)changed++;
      }
      return {fraction:changed/Math.max(used,1),changed,total:used,
        width:left.width,height:left.height};
    },{one:a,two:b});
  }finally{await page.close()}
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const results=[];
  try{
    for(const test of cases){
      // An intentionally edited HTML page is covered by the full browser suite.
      // The baseline comparison guards unrelated pages against shared-style drift.
      const relative=test.route==='/'?'index.html':test.route.slice(1);
      const baseFile=path.join(root,'baseline',relative);
      const currentFile=path.join(root,relative);
      if(fs.existsSync(baseFile)&&fs.existsSync(currentFile)&&
        !fs.readFileSync(baseFile).equals(fs.readFileSync(currentFile))){
        console.log('SKIP changed page: '+test.route);
        continue;
      }
      const name=(test.route==='/'?'home':test.route.slice(1).replace(/\W+/g,'-'))+
        '-'+test.width+'-'+test.theme;
      const before=await capture(browser,reference,test,name+'-before.png');
      const after=await capture(browser,primary,test,name+'-after.png');
      const metrics=await compare(browser,before,after);
      const passed=metrics.fraction<=0.07;
      const result={name,route:test.route,theme:test.theme,width:test.width,
        ...metrics,passed};
      results.push(result);
      console.log((passed?'PASS ':'FAIL ')+name+': '+(metrics.fraction*100).toFixed(2)+'% meaningfully changed pixels');
    }
  }finally{await browser.close()}
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(results,null,2));
  if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
