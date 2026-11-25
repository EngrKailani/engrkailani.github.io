/* Independent check of the published custom domain after a GitHub Pages push.
 * Run: node scripts/production-smoke.js
 * Not a substitute for testing the repository locally. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const BASE='https://kailanialarcon.com';
const RETRIES=8,DELAY_MS=20000;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function retrieve(path){
  const response=await fetch(BASE+path,{redirect:'follow',signal:AbortSignal.timeout(15000),
    headers:{'cache-control':'no-cache'}});
  if(!response.ok)throw Error(path+': HTTP '+response.status);
  return response;
}
async function check(){
  assert.equal(fs.readFileSync('CNAME','utf8').trim(),'kailanialarcon.com',
    'Repository CNAME must match canonical hostname');
  const home=await(await retrieve('/')).text();
  assert(home.includes('id="selected-work"')&&home.includes('Selected engineering projects.'),
    'Published homepage does not contain the expected project showcase');
  const experiment=await(await retrieve('/robotics-experiment.html')).text();
  assert(experiment.includes('id="exp-sensitivity-plot"'),
    'Published robotics experiment lacks the results chart');
  assert(experiment.includes('tabindex="0"')&&
    experiment.includes('aria-label="Synthetic planar robot trajectories, horizontally scrollable"'),
    'Published robotics experiment does not include the keyboard-accessible chart update');
  const vna=await(await retrieve('/projects/vna.html')).text();
  assert(vna.includes('vna-twoport-diagnostics') &&
    vna.includes('maximum power-wave gain is 0.25') &&
    vna.includes('eleven offline unit tests'),
    'Published VNA page lacks synthetic reciprocity and passivity diagnostics');
  const thermal=await(await retrieve('/projects/thermal.html')).text();
  assert(thermal.includes('thermal-source-table-wrap') &&
    thermal.includes('Ten values with a 9 °C range') &&
    thermal.includes('thermal-trend-source-audit.md'),
    'Published thermal case study lacks source-backed label review');
  const leg=await(await retrieve('/projects/leg.html')).text();
  assert(leg.includes('No joint-acceleration input') &&
    leg.includes('Independent checks against the published equations') &&
    leg.includes('three-link-source-audit.md'),
    'Published Honors case study is missing source-based torque limitations or audit link');
  const research=await(await retrieve('/research.html')).text();
  assert(research.includes('does not include the joint-acceleration term'),
    'Published research page has an outdated full-dynamics description');
  const archive=await(await retrieve('/projects/')).text();
  assert(archive.includes('independently checked kinematics'),
    'Published project directory does not reflect the source audit');
  const model=await(await retrieve('/robotics-experiment-model.js')).text();
  assert(model.includes('runTrials')&&model.includes('runSensitivity'),
    'Published robotics experiment model is stale');
  for(const path of ['/assets/Kailani_Alarcon_CV.pdf','/assets/Kailani_Alarcon_Master_Resume.pdf']){
    const response=await retrieve(path);
    const bytes=new Uint8Array(await response.arrayBuffer());
    assert(bytes.length>3000&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-',
      path+': not a valid published PDF asset');
  }
  console.log('PASS: published custom domain, accessible robotics experiment, model assets, CV and résumé PDFs.');
}
(async()=>{
  let lastError;
  for(let attempt=1;attempt<=RETRIES;attempt++){
    try{await check();return}
    catch(error){
      lastError=error;
      console.error('Attempt '+attempt+'/'+RETRIES+': '+error.message);
      if(attempt<RETRIES)await pause(DELAY_MS);
    }
  }
  console.error('Public deployment cannot be verified: '+lastError.message);
  process.exitCode=1;
})();
