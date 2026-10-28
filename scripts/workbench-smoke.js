/* Focused Phase 3 browser smoke test.
   Run: npm install; npx playwright install chromium; node scripts/workbench-smoke.js
   Starts a temporary local HTTP server; no deployed site or network is required. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const media={
  '.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8',
  '.css':'text/css;charset=utf-8','.svg':'image/svg+xml','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.woff2':'font/woff2','.pdf':'application/pdf'
};
function siteServer(){
  return http.createServer((req,res)=>{
    let name;
    try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}
    catch{res.writeHead(400);res.end();return}
    const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep)){
      res.writeHead(403);res.end();return;
    }
    fs.stat(file,(err,stat)=>{
      if(err||!stat.isFile()){res.writeHead(404);res.end();return}
      res.writeHead(200,{'Content-Type':media[path.extname(file)]||'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    });
  });
}
async function run(){
  const server=siteServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
    const origin='http://127.0.0.1:'+server.address().port;
    for(const width of [320,390,1280]){
      const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      const response=await page.goto(origin+'/workbench.html',{waitUntil:'domcontentloaded'});
      assert.equal(response.status(),200);
      await page.locator('#scope-read-freq').waitFor();
      assert.equal((await page.locator('#scope-read-freq').textContent()).trim(),'120 Hz');
      await page.locator('#scope-msdiv').selectOption('5');
      await page.locator('#scope-vdiv').selectOption('2');
      assert.equal((await page.locator('#scope-timebase').textContent()).trim(),'5 ms/div · 2 V/div');
      assert.equal((await page.locator('#scope-read-dt').textContent()).trim(),'25.00 ms');
      await page.locator('#scope-level').evaluate(el=>{
        el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));
      });
      await page.locator('#scope-single').click();
      assert.match(await page.locator('#scope-status').textContent(),/NO TRIGGER/);
      await page.locator('#scope-reset').click();
      await page.locator('#scope-single').click();
      assert.match(await page.locator('#scope-status').textContent(),/SINGLE/);
      await page.locator('#wb-tab-robot').click();
      await page.locator('#robot-solve').click();
      assert.match(await page.locator('#robot-ik-status').textContent(),/IK solved/);
      assert.ok(parseFloat(await page.locator('#robot-read-error').textContent())<.5);
      await page.locator('#robot-elbow').selectOption('up');
      await page.locator('#robot-solve').click();
      assert.ok(parseFloat(await page.locator('#robot-j2-out').textContent())>0);
      for(const id of ['robot-target-x','robot-target-y']){
        await page.locator('#'+id).evaluate(el=>{
          el.value='325';el.dispatchEvent(new Event('input',{bubbles:true}));
        });
      }
      await page.locator('#robot-solve').click();
      assert.match(await page.locator('#robot-ik-status').textContent(),/Unreachable/);
      await page.locator('#wb-tab-lights').click();
      await page.locator('#lights-scene').selectOption('blackout');
      assert.equal((await page.locator('#lights-read-dim').textContent()).trim(),'0%');
      await page.locator('#wb-tab-thermal').click();
      assert.match(await page.locator('#thermal-read-0').textContent(),/°C/);
      const overflow=await page.evaluate(()=>Math.max(
        document.documentElement.scrollWidth,document.body.scrollWidth)-
        document.documentElement.clientWidth);
      assert.ok(overflow<=3,'Horizontal overflow at '+width+'px: '+overflow+'px');
      assert.deepEqual(errors,[], 'Browser errors at '+width+'px');
      console.log('PASS workbench browser interactions and layout at '+width+'px');
      await context.close();
    }
  }finally{
    if(browser)await browser.close();
    await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  }
}
run().catch(e=>{console.error(e);process.exitCode=1});
