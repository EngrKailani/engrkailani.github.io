/* Browser-only viewer. All model calculations live in robotics-experiment-model.js. */
(()=>{
  'use strict';
  const model=window.RoboticsExperiment;
  const form=document.getElementById('experiment-form');
  const svg=document.getElementById('exp-plot');
  const summary=document.getElementById('exp-summary');
  const csvButton=document.getElementById('exp-csv');
  const status=document.getElementById('exp-status');
  if(!model||!form||!svg)return;
  let result=null;
  const ns='http://www.w3.org/2000/svg';
  const make=(tag,attrs={})=>{
    const el=document.createElementNS(ns,tag);
    for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));
    return el;
  };
  const fmt=n=>n.toFixed(2);
  function draw(rows){
    svg.replaceChildren();
    const x=p=>50+(p-105)*5.2;
    const y=p=>300-(p-28)*3.5;
    for(let i=0;i<=4;i++){
      const xx=70+170*i;
      svg.appendChild(make('line',{x1:xx,y1:24,x2:xx,y2:302,class:'exp-gridline'}));
      const yy=34+66*i;
      svg.appendChild(make('line',{x1:50,y1:yy,x2:755,y2:yy,class:'exp-gridline'}));
    }
    const tracks=[
      ['exp-truth',r=>[r.trueX,r.trueY]],
      ['exp-raw',r=>[r.measuredX,r.measuredY]],
      ['exp-filtered',r=>[r.filteredX,r.filteredY]]
    ];
    for(const [cls,point] of tracks){
      const d=rows.map((r,i)=>{
        const [px,py]=point(r);
        return (i?'L':'M')+x(px).toFixed(2)+' '+y(py).toFixed(2);
      }).join(' ');
      svg.appendChild(make('path',{d,class:cls}));
    }
    const label=make('text',{x:52,y:323});
    label.textContent='Planar position (mm), synthetic trajectory';
    svg.appendChild(label);
  }
  function run(){
    const values=new FormData(form);
    try{
      const opts={seed:Number(values.get('seed')),noiseMm:Number(values.get('noise')),
        alpha:Number(values.get('alpha')),samples:Number(values.get('samples'))};
      result=model.runExperiment(opts);
      const m=result.metrics;
      const difference=m.relativeChange===null?'Not defined':
        Math.abs(m.relativeChange).toFixed(1)+'% '+(m.relativeChange<=0?'lower':'higher');
      summary.replaceChildren();
      for(const [label,value] of [
        ['Unfiltered endpoint RMSE',fmt(m.rawRmse)+' mm'],
        ['Smoothed endpoint RMSE',fmt(m.filteredRmse)+' mm'],
        ['Smoothed versus raw RMSE',difference]
      ]){
        const card=document.createElement('div');
        card.className='exp-metric';
        const span=document.createElement('span');span.textContent=label;
        const strong=document.createElement('strong');strong.textContent=value;
        card.append(span,strong);summary.append(card);
      }
      draw(result.rows);
      csvButton.disabled=false;
      status.textContent='Simulation complete. '+result.rows.length+' deterministic synthetic samples. Results change when settings change.';
    }catch(e){
      result=null;csvButton.disabled=true;summary.replaceChildren();svg.replaceChildren();
      status.textContent='Unable to run simulation: '+e.message;
    }
  }
  form.addEventListener('submit',event=>{event.preventDefault();run()});
  csvButton.addEventListener('click',()=>{
    if(!result)return;
    const cols=['sample','trueX','trueY','measuredX','measuredY','filteredX','filteredY','rawError','filteredError'];
    const lines=['# synthetic planar 3R experiment; seed='+result.params.seed+
        '; noise_mm='+result.params.noiseMm+'; alpha='+result.params.alpha+'; samples='+result.params.samples,
      cols.join(','),...result.rows.map(row=>cols.map(key=>Number.isInteger(row[key])?row[key]:row[key].toFixed(8)).join(','))];
    const href=URL.createObjectURL(new Blob([lines.join('\n')+'\n'],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=href;link.download='planar-robot-synthetic-run.csv';
    document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);
  });
  run();
})();
