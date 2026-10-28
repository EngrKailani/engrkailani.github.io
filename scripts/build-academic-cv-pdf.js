/* Build print-ready academic CV PDF from the canonical HTML page.
 * Run: npm install && npx playwright install chromium &&
 *      node scripts/build-academic-cv-pdf.js
 */
'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'assets','Kailani_Alarcon_Academic_CV.pdf');
const mime={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8',
  '.js':'application/javascript;charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  let url;
  try{url=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}
  catch{res.writeHead(400);return res.end()}
  const resource=path.resolve(root,'.'+url);
  if(!resource.startsWith(root+path.sep)||!fs.existsSync(resource)){
    res.writeHead(404);return res.end();
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(resource)]||'application/octet-stream'});
  fs.createReadStream(resource).pipe(res);
});
async function run(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
    const page=await browser.newPage({viewport:{width:1100,height:900},deviceScaleFactor:1});
    const result=await page.goto('http://127.0.0.1:'+server.address().port+'/academic-cv.html',
      {waitUntil:'networkidle'});
    if(result.status()!==200)throw Error('CV page unavailable');
    await page.evaluate(()=>document.fonts.ready);
    if(await page.locator('.cv-entry').count()<7)throw Error('Missing CV entries');
    if(!(await page.locator('#cv-writing-title').isVisible()))throw Error('Missing publication status');
    await page.pdf({path:file,format:'Letter',preferCSSPageSize:true,printBackground:true});
    const bytes=fs.readFileSync(file);
    if(bytes.subarray(0,5).toString()!=='%PDF-'||bytes.length<8000)
      throw Error('Invalid PDF output');
    console.log('Generated '+file+' ('+bytes.length+' bytes)');
  }finally{
    if(browser)await browser.close();
    await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});
