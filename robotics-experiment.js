/* Interactive, browser-only synthetic robotics measurements and plots.
   Model calculations and seeded statistics are implemented separately. */
(()=>{
  'use strict';
  const model=window.RoboticsExperiment;
  const form=document.getElementById('experiment-form');
  const xy=document.getElementById('exp-plot');
  const errorPlot=document.getElementById('exp-error-plot');
  const sensitivityPlot=document.getElementById('exp-sensitivity-plot');
  const oneSummary=document.getElementById('exp-summary');
  const batchSummary=document.getElementById('exp-batch-summary');
  const sensitivityRows=document.getElementById('exp-sensitivity-rows');
  const sampleDownload=document.getElementById('exp-csv');
  const trialDownload=document.getElementById('exp-trials-csv');
  const status=document.getElementById('exp-status');
  if(!model||!form||!xy||!errorPlot||!sensitivityPlot)return;
  const ns='http://www.w3.org/2000/svg';
  let single=null,aggregate=null;
  const fmt=n=>Number(n).toFixed(2);
  function node(name,attrs={},value){
    const el=document.createElementNS(ns,name);
    for(const [key,v] of Object.entries(attrs))el.setAttribute(key,String(v));
    if(value!==undefined)el.textContent=String(value);
    return el;
  }
  function text(name,value){
    const el=document.createElement(name);
    el.textContent=String(value);
    return el;
  }
  function metric(container,title,value){
    const card=text('div','');
    card.className='exp-metric';
    card.append(text('span',title),text('strong',value));
    container.append(card);
  }
  function frame(svg,title,xmin,xmax,ymin,ymax,xLabel,yLabel){
    svg.replaceChildren(node('title',{},title));
    const left=58,right=750,top=20,bottom=268;
    const x=v=>left+(v-xmin)/(xmax-xmin)*(right-left);
    const y=v=>bottom-(v-ymin)/(ymax-ymin)*(bottom-top);
    for(let i=0;i<=4;i++){
      const xp=left+i*(right-left)/4,yp=top+i*(bottom-top)/4;
      svg.append(node('line',{x1:xp,x2:xp,y1:top,y2:bottom,class:'exp-gridline'}),
        node('line',{x1:left,x2:right,y1:yp,y2:yp,class:'exp-gridline'}));
      svg.append(node('text',{x:xp,y:bottom+18,'text-anchor':'middle'},fmt(xmin+(xmax-xmin)*i/4)));
      svg.append(node('text',{x:left-8,y:yp+4,'text-anchor':'end'},fmt(ymax-(ymax-ymin)*i/4)));
    }
    svg.append(node('text',{x:(left+right)/2,y:303,'text-anchor':'middle'},xLabel));
    svg.append(node('text',{x:12,y:15},yLabel));
    return {x,y};
  }
  function line(svg,rows,getX,getY,cls,map){
    const d=rows.map((row,i)=>{
      const [x,y]=map(getX(row),getY(row));
      return (i?'L':'M')+x.toFixed(2)+','+y.toFixed(2);
    }).join(' ');
    svg.append(node('path',{d,class:cls}));
  }
  function drawXY(rows){
    const all=rows.flatMap(r=>[[r.trueX,r.trueY],[r.measuredX,r.measuredY],[r.filteredX,r.filteredY]]);
    const xs=all.map(v=>v[0]),ys=all.map(v=>v[1]);
    const xmin=Math.min(...xs)-8,xmax=Math.max(...xs)+8;
    const ymin=Math.min(...ys)-8,ymax=Math.max(...ys)+8;
    const p=frame(xy,'Synthetic ground truth, raw measurements, and smoothed 3R kinematic path',xmin,xmax,ymin,ymax,'X position (mm)','Y (mm)');
    for(const [xx,yy,cls] of [
      ['trueX','trueY','exp-truth'],
      ['measuredX','measuredY','exp-raw'],
      ['filteredX','filteredY','exp-filtered']
    ])line(xy,rows,r=>r[xx],r=>r[yy],cls,(x,y)=>[p.x(x),p.y(y)]);
  }
  function drawError(rows){
    const top=Math.max(1,...rows.map(r=>Math.max(r.rawError,r.filteredError)))*1.1;
    const p=frame(errorPlot,'Synthetic endpoint error by sample index',1,rows.length,0,top,'Sample index','Error (mm)');
    for(const [key,cls] of [['rawError','exp-raw'],['filteredError','exp-filtered']]){
      line(errorPlot,rows,r=>r.sample,r=>r[key],cls,(x,y)=>[p.x(x),p.y(y)]);
    }
  }
  function drawSensitivity(rows){
    const max=Math.max(1,...rows.map(r=>Math.max(r.rawRmse,r.filteredRmse)))*1.12;
    const p=frame(sensitivityPlot,'Mean synthetic RMSE versus exponential smoothing weight',0.1,1,0,max,'Smoothing weight α','RMSE (mm)');
    for(const [key,cls] of [['rawRmse','exp-raw'],['filteredRmse','exp-filtered']]){
      line(sensitivityPlot,rows,r=>r.alpha,r=>r[key],cls,(x,y)=>[p.x(x),p.y(y)]);
      for(const r of rows)sensitivityPlot.append(node('circle',{cx:p.x(r.alpha),cy:p.y(r[key]),r:4,class:cls+'-point'}));
    }
    sensitivityRows.replaceChildren();
    for(const r of rows){
      const tr=text('tr','');
      for(const v of [r.alpha.toFixed(2),fmt(r.rawRmse),fmt(r.filteredRmse)]){
        const td=text('td',v);tr.append(td);
      }
      sensitivityRows.append(tr);
    }
  }
  function run(){
    const values=new FormData(form);
    try{
      const opts={
        seed:Number(values.get('seed')),
        noiseMm:Number(values.get('noise')),
        alpha:Number(values.get('alpha')),
        samples:Number(values.get('samples')),
        trials:Number(values.get('trials'))
      };
      single=model.runExperiment(opts);
      aggregate=model.runTrials(opts);
      const sweep=model.runSensitivity(opts);
      oneSummary.replaceChildren();batchSummary.replaceChildren();
      const m=single.metrics,b=aggregate.metrics;
      const relative=m.relativeChange===null?'Undefined':
        fmt(Math.abs(m.relativeChange))+'% '+(m.relativeChange<=0?'lower':'higher');
      metric(oneSummary,'Single-run raw RMSE',fmt(m.rawRmse)+' mm');
      metric(oneSummary,'Single-run smoothed RMSE',fmt(m.filteredRmse)+' mm');
      metric(oneSummary,'Single-run comparison',relative);
      metric(batchSummary,'Mean raw RMSE',fmt(b.meanRawRmse)+' mm');
      metric(batchSummary,'Mean smoothed RMSE',fmt(b.meanFilteredRmse)+' mm');
      metric(batchSummary,'Mean paired improvement, 95% bootstrap interval',
        fmt(b.meanImprovementMm)+' mm ('+fmt(b.ciLow)+' to '+fmt(b.ciHigh)+' mm)');
      drawXY(single.rows);drawError(single.rows);drawSensitivity(sweep);
      sampleDownload.disabled=false;
      trialDownload.disabled=false;
      status.textContent='Simulation complete: '+opts.samples+' samples, '+opts.trials+
        ' paired synthetic trial seeds, and a five-setting smoothing comparison. No hardware data used.';
    }catch(error){
      single=null;aggregate=null;
      sampleDownload.disabled=true;trialDownload.disabled=true;
      oneSummary.replaceChildren();batchSummary.replaceChildren();sensitivityRows.replaceChildren();
      xy.replaceChildren();errorPlot.replaceChildren();sensitivityPlot.replaceChildren();
      status.textContent='Unable to run simulation: '+error.message;
    }
  }
  function csvDownload(filename,lines){
    const blob=new Blob([lines.join('\n')+'\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download=filename;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  sampleDownload.addEventListener('click',()=>{
    if(!single)return;
    const cols=['sample','trueX','trueY','measuredX','measuredY','filteredX','filteredY','rawError','filteredError'];
    csvDownload('planar-robot-synthetic-samples.csv',[
      '# Synthetic planar 3R samples; '+JSON.stringify(single.params),
      cols.join(','),
      ...single.rows.map(row=>cols.map(k=>Number.isInteger(row[k])?row[k]:row[k].toFixed(8)).join(','))
    ]);
  });
  trialDownload.addEventListener('click',()=>{
    if(!aggregate)return;
    const cols=['trial','seed','rawRmse','filteredRmse','improvementMm'];
    csvDownload('planar-robot-synthetic-trials.csv',[
      '# Paired deterministic seeds; synthetic model only; '+JSON.stringify(aggregate.params),
      cols.join(','),
      ...aggregate.records.map(row=>cols.map(k=>Number.isInteger(row[k])?row[k]:row[k].toFixed(8)).join(','))
    ]);
  });
  form.addEventListener('submit',event=>{event.preventDefault();run()});
  run();
})();
