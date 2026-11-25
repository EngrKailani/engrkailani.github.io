/* Reproducible educational robotics experiment.
   Runs seeded synthetic measurements through a planar 3R inverse-kinematics model.
   No recorded human, NASA, or robot hardware observations are used. */
(function(root,factory){
  'use strict';
  const models=typeof module==='object'&&module.exports?require('./workbench-models.js'):root.WorkbenchModels;
  const api=factory(models);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RoboticsExperiment=api;
})(typeof window==='object'?window:null,function(models){
  'use strict';
  if(!models||typeof models.inverse3!=='function')throw new Error('Load the three-link kinematics model first');
  const lengths=[140,110,75];
  function random(seed){
    let state=seed>>>0;
    return function(){
      state=(state+0x6D2B79F5)>>>0;
      let t=state;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }
  function gaussian(rng){
    return Math.sqrt(-2*Math.log(Math.max(1e-12,rng())))*Math.cos(2*Math.PI*rng());
  }
  function rmse(rows,key){
    return Math.sqrt(rows.reduce((sum,row)=>sum+row[key]*row[key],0)/rows.length);
  }
  function runExperiment({seed=42,noiseMm=8,alpha=0.3,samples=240}={}){
    if(!Number.isInteger(seed)||seed<0||seed>4294967295||
       !Number.isFinite(noiseMm)||noiseMm<0||noiseMm>25||
       !Number.isFinite(alpha)||alpha<=0||alpha>1||
       !Number.isInteger(samples)||samples<30||samples>2000)throw new RangeError('Invalid simulation parameters');
    const rng=random(seed);
    const rows=[];
    let smoothed=null;
    for(let i=0;i<samples;i++){
      const phase=i/samples;
      const truth={x:162+29*Math.sin(2*Math.PI*phase),y:78+19*Math.sin(4*Math.PI*phase+0.3),phi:0};
      const observed={x:truth.x+noiseMm*gaussian(rng),y:truth.y+noiseMm*gaussian(rng),phi:0};
      smoothed=smoothed?{x:alpha*observed.x+(1-alpha)*smoothed.x,
        y:alpha*observed.y+(1-alpha)*smoothed.y,phi:0}: {...observed};
      const raw=models.inverse3(observed,lengths,'down');
      const filtered=models.inverse3(smoothed,lengths,'down');
      if(!raw.ok||!filtered.ok)throw new Error('Simulation pose left the model workspace; choose a smaller noise level');
      const rawPose=models.forward3(raw.angles,lengths);
      const filteredPose=models.forward3(filtered.angles,lengths);
      const rawError=Math.hypot(rawPose.x-truth.x,rawPose.y-truth.y);
      const filteredError=Math.hypot(filteredPose.x-truth.x,filteredPose.y-truth.y);
      rows.push({sample:i+1,trueX:truth.x,trueY:truth.y,measuredX:observed.x,measuredY:observed.y,
        filteredX:filteredPose.x,filteredY:filteredPose.y,rawError,filteredError});
    }
    const rawRmse=rmse(rows,'rawError');
    const filteredRmse=rmse(rows,'filteredError');
    return {rows,params:{seed,noiseMm,alpha,samples},metrics:{rawRmse,filteredRmse,
      relativeChange:rawRmse>0?(filteredRmse/rawRmse-1)*100:null,
      maxRaw:Math.max(...rows.map(row=>row.rawError)),
      maxFiltered:Math.max(...rows.map(row=>row.filteredError))}};
  }
  return Object.freeze({runExperiment});
});
