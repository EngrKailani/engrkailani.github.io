/* Print measured Lighthouse results; no synthetic scores or fixed perf claims. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../quality-artifacts');
const variants=['mobile','desktop'];
let failed=false;
const table=['### Lighthouse reports (lab measurements)','',
  '| Mode | Performance | Accessibility | Best practices | SEO | LCP | CLS |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
for(const mode of variants){
  const file=path.join(base,'lighthouse-'+mode+'.json');
  if(!fs.existsSync(file)){console.error('Missing Lighthouse report: '+file);failed=true;continue}
  let r;
  try{r=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){console.error('Invalid report: '+e.message);failed=true;continue}
  const score=k=>r.categories?.[k]?.score==null?'n/a':Math.round(r.categories[k].score*100);
  const metric=k=>r.audits?.[k]?.displayValue||'n/a';
  if(r.runtimeError){failed=true;console.error(mode+': '+r.runtimeError.message)}
  table.push('| '+mode+' | '+score('performance')+' | '+score('accessibility')+
    ' | '+score('best-practices')+' | '+score('seo')+
    ' | '+metric('largest-contentful-paint')+' | '+metric('cumulative-layout-shift')+' |');
}
table.push('','Numbers are Lighthouse lab runs from the CI browser, not field-user Core Web Vitals.');
const summary=table.join('\n')+'\n';
console.log(summary);
fs.writeFileSync(path.join(base,'lighthouse-summary.md'),summary);
if(failed)process.exitCode=1;
