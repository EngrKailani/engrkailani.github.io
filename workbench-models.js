/* Educational engineering models. Pure functions: browser + Node tests.
   Geometry is an illustrative planar 3R chain, not a physical robot model.
   Waveforms are mathematical functions, not digitized instrument readings. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WorkbenchModels=api;
})(typeof window==='object'?window:null,function(){
  'use strict';
  const TAU=2*Math.PI;
  const deg=n=>n*Math.PI/180;
  const rad=n=>n*180/Math.PI;
  const wrap180=n=>((n+180)%360+360)%360-180;
  const lengthsDefault=[140,110,75];

  function waveformAt(type,cycle,duty=50){
    const u=((cycle%1)+1)%1;
    if(type==='sine')return Math.sin(TAU*u);
    if(type==='triangle')return 1-4*Math.abs(u-.5);
    if(type==='pwm')return u<duty/100?1:0;
    if(type==='square')return u<duty/100?1:-1;
    throw new RangeError('Unsupported synthetic waveform');
  }
  function voltageAt(cfg,cycle){
    const base=cfg.amp*waveformAt(cfg.wave,cycle,cfg.duty);
    const noise=(Math.sin(cycle*171.7)*.66+Math.sin(cycle*367.1)*.34)*
      cfg.amp*(cfg.noise||0)/100;
    return base+noise;
  }
  // Find a clean-wave crossing (no noise) in one cycle. Signal wraps at t=0,
  // including the discontinuous rising edge of PWM and square waves.
  function triggerPhase(cfg,edge,level){
    if(edge!=='rising'&&edge!=='falling')return null;
    const steps=4096;
    let prev=cfg.amp*waveformAt(cfg.wave,-1/steps,cfg.duty);
    for(let i=0;i<=steps;i++){
      const phase=i/steps;
      const next=cfg.amp*waveformAt(cfg.wave,phase,cfg.duty);
      const crosses=edge==='rising'?(prev<level&&next>=level):
        (prev>level&&next<=level);
      if(crosses){
        // A square/PWM edge is discontinuous: report the boundary sample,
        // rather than interpolating a fictitious voltage ramp across the jump.
        if(cfg.wave==='square'||cfg.wave==='pwm')return phase%1;
        const denom=next-prev;
        const alpha=Math.abs(denom)<1e-12?0:(level-prev)/denom;
        return (((i-1+Math.max(0,Math.min(1,alpha)))/steps)%1+1)%1;
      }
      prev=next;
    }
    return null;
  }
  function forward3(angles,lengths=lengthsDefault){
    if(angles.length!==3||lengths.length!==3)throw new RangeError('Three links expected');
    let x=0,y=0,orientation=0;
    const points=[[0,0]];
    for(let i=0;i<3;i++){
      orientation+=deg(angles[i]);
      x+=lengths[i]*Math.cos(orientation);
      y+=lengths[i]*Math.sin(orientation);
      points.push([x,y]);
    }
    return {x,y,theta:angles[0]+angles[1]+angles[2],points};
  }
  function inverse3(target,lengths=lengthsDefault,branch='down',limit=170){
    if(lengths.length!==3||lengths.some(l=>!Number.isFinite(l)||l<=0)||
       ![target.x,target.y,target.phi].every(Number.isFinite)||
       !['up','down'].includes(branch))throw new RangeError('Invalid 3R IK input');
    const [l1,l2,l3]=lengths;
    const wx=target.x-l3*Math.cos(deg(target.phi));
    const wy=target.y-l3*Math.sin(deg(target.phi));
    const dist=Math.hypot(wx,wy);
    // Wrist of this fixed-orientation pose must be between |l1-l2| and l1+l2.
    if(dist>l1+l2+1e-8||dist<Math.abs(l1-l2)-1e-8)
      return {ok:false,reason:'outside-reach',wristDistance:dist};
    const cos2=Math.max(-1,Math.min(1,(wx*wx+wy*wy-l1*l1-l2*l2)/(2*l1*l2)));
    const q2=(branch==='up'?1:-1)*Math.acos(cos2);
    const q1=Math.atan2(wy,wx)-Math.atan2(l2*Math.sin(q2),l1+l2*Math.cos(q2));
    const q3=deg(target.phi)-q1-q2;
    const angles=[q1,q2,q3].map(v=>wrap180(rad(v)));
    if(angles.some(q=>Math.abs(q)>limit+1e-8))
      return {ok:false,reason:'joint-limit',angles,wristDistance:dist};
    const pose=forward3(angles,lengths);
    return {ok:true,angles,pose,wristDistance:dist,
      errorMm:Math.hypot(pose.x-target.x,pose.y-target.y)};
  }
  return Object.freeze({waveformAt,voltageAt,triggerPhase,forward3,inverse3,wrap180});
});
