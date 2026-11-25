/* Browser interactions and CSV smoke test for the synthetic robotics experiment.
 * Run: npm install; npx playwright install chromium; node scripts/robotics-experiment-smoke.js */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8',
  '.js':'application/javascript;charset=utf-8','.svg':'image/svg+xml'};
function makeServer(){
  return http.createServer((req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}
    catch{res.writeHead(400);res.end();return}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
    fs.stat(file,(error,stat)=>{
      if(error||!stat.isFile()){res.writeHead(404);res.end();return}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    });
  });
}
async function run(){
  const server=makeServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
    const origin='http://127.0.0.1:'+server.address().port;
    for(const width of [320,390,1280]){
      for(const theme of ['light','dark']){
        const context=await browser.newContext({
          viewport:{width,height:850},reducedMotion:'reduce',acceptDownloads:true
        });
        await context.addInitScript(value=>localStorage.setItem('kailani-theme',value),theme);
        const page=await context.newPage(),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        const response=await page.goto(origin+'/robotics-experiment.html',{waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        await page.locator('#exp-status').waitFor();
        await page.locator('#exp-status').filter({hasText:'Simulation complete'}).waitFor();
        assert.equal(await page.locator('#exp-summary .exp-metric').count(),3);
        assert.equal(await page.locator('#exp-batch-summary .exp-metric').count(),3);
        assert.equal(await page.locator('#exp-sensitivity-rows tr').count(),5);
        assert.equal(await page.locator('#exp-plot path').count(),3);
        assert.equal(await page.locator('#exp-error-plot path').count(),2);
        assert.equal(await page.locator('#exp-sensitivity-plot path').count(),2);
        assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
        // On narrow screens, charts and the results table must be keyboard scrollable.
        const regions=page.locator('.exp-chart-wrap, .exp-table-wrap');
        assert.equal(await regions.count(),4);
        for(let i=0;i<4;i++){
          const region=regions.nth(i);
          assert.equal(await region.getAttribute('tabindex'),'0');
          assert.equal(await region.getAttribute('role'),'region');
          assert((await region.getAttribute('aria-label')||'').length>12);
        }
        if(width<=390){
          const scroll=regions.first();
          await scroll.focus();
          assert.equal(await scroll.evaluate(el=>document.activeElement===el),true,
            'Chart container must accept keyboard focus');
          await scroll.press('ArrowRight');
          await page.waitForTimeout(200);
          assert((await scroll.evaluate(el=>el.scrollLeft))>0,
            'Focused chart must scroll using arrow keys at '+width+'px');
        }
        await page.locator('input[name="trials"]').fill('4');
        await page.locator('input[name="noise"]').fill('0');
        await page.locator('button[type="submit"]').click();
        assert.match(await page.locator('#exp-status').textContent(),/4 paired synthetic trial seeds/);
        const sampleEvent=page.waitForEvent('download');
        await page.locator('#exp-csv').click();
        const sample=await sampleEvent;
        assert.equal(sample.suggestedFilename(),'planar-robot-synthetic-samples.csv');
        const trialsEvent=page.waitForEvent('download');
        await page.locator('#exp-trials-csv').click();
        const trials=await trialsEvent;
        assert.equal(trials.suggestedFilename(),'planar-robot-synthetic-trials.csv');
        const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,
          document.body.scrollWidth)-document.documentElement.clientWidth);
        assert(overflow<=3,'Horizontal scrolling at '+width+' '+theme+': '+overflow);
        assert.deepEqual(errors,[],'Browser errors at '+width+' '+theme);
        await context.close();
        console.log('PASS robotics experiment '+width+'px, '+theme+' theme, graphs and CSV exports');
      }
    }
  }finally{
    if(browser)await browser.close();
    await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});
