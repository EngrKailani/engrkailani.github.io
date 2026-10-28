/* Engineering Workbench. All data is illustrative and computed locally in the browser. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const deg = x => x * Math.PI / 180;
  const num = id => Number($(id).value);
  const fmt = (x, n = 1) => x.toFixed(n);
  const colors = ['#f6b37d', '#83d9d3', '#d6a6e8', '#d9de85'];
  const keys = ['scope', 'robot', 'lights', 'thermal'];
  let active = 'scope';

  // Use the same appearance preference as the portfolio.
  function updateThemeButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('wb-theme').setAttribute('aria-pressed', String(dark));
    $('wb-theme').querySelector('span').textContent = dark ? 'Light mode' : 'Dark mode';
    $('wb-theme').firstChild.textContent = dark ? '☀ ' : '☾ ';
  }
  $('wb-theme').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('kailani-theme', next); } catch {}
    updateThemeButton();
  });
  updateThemeButton();

  function configureCanvas(id) {
    const c = $(id), box = c.getBoundingClientRect();
    if (!box.width || !box.height) return null;
    const w = box.width, h = box.height, ratio = Math.min(window.devicePixelRatio || 1, 2);
    const dw = Math.max(1, Math.round(w * ratio)), dh = Math.max(1, Math.round(h * ratio));
    if (c.width !== dw || c.height !== dh) { c.width = dw; c.height = dh; }
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }
  function screenGrid(ctx, w, h, left = 48, top = 20, right = 18, bottom = 32) {
    const pw = w - left - right, ph = h - top - bottom;
    ctx.fillStyle = '#1c202a'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#343b49'; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = left + i * pw / 10;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + ph); ctx.stroke();
    }
    for (let j = 0; j <= 8; j++) {
      const y = top + j * ph / 8;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + pw, y); ctx.stroke();
    }
    ctx.strokeStyle = '#566073';
    ctx.strokeRect(left, top, pw, ph);
    return { left, top, pw, ph };
  }
  function label(ctx, text, x, y, align = 'left', color = '#9ba8b9') {
    ctx.font = '11px "DM Sans", Arial, sans-serif'; ctx.textAlign = align;
    ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  function setActive(which, focus = false) {
    if (!keys.includes(which)) return;
    if (active === 'scope' && which !== 'scope') setScopeRunning(false);
    if (active === 'thermal' && which !== 'thermal') setThermalRunning(false);
    active = which;
    for (const k of keys) {
      const tab = $('wb-tab-' + k);
      tab.setAttribute('aria-selected', String(k === which));
      tab.tabIndex = k === which ? 0 : -1;
      $('wb-panel-' + k).hidden = k !== which;
    }
    if (focus) $('wb-tab-' + which).focus();
    renderActive();
  }
  document.querySelectorAll('[data-instrument]').forEach(tab => {
    tab.addEventListener('click', () => {
      setActive(tab.dataset.instrument);
      history.replaceState(null, '', '#wb-panel-' + tab.dataset.instrument);
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const i = keys.indexOf(tab.dataset.instrument);
      const to = event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1
        : (i + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
      setActive(keys[to], true);
      history.replaceState(null, '', '#wb-panel-' + keys[to]);
    });
  });

  // Phase 3: independent oscilloscope display scales and a synthetic trigger.
  const models=window.WorkbenchModels;
  if(!models)throw new Error('Workbench models must load before the instrument UI');
  const TAU=2*Math.PI;
  const scope={
    wave:'sine',freq:120,amp:2,duty:50,noise:0,msdiv:2,vdiv:1,
    trigger:'rising',level:0,cursorA:25,cursorB:75,phase:0,
    running:false,mode:'hold',raf:null,previous:0
  };
  const scopeWindowMs=()=>scope.msdiv*10;
  const sampleSignal=cycle=>models.voltageAt(scope,cycle);
  function scopeStartCycle(){
    const crossing=models.triggerPhase(scope,scope.trigger,scope.level);
    if(crossing===null)return {crossing:null,start:scope.phase};
    const cyclesPerWindow=scope.freq*scopeWindowMs()/1000;
    // A clean signal edge is placed at the 20% graticule marker.
    return {crossing,start:crossing-.2*cyclesPerWindow};
  }
  function drawScope(){
    const obj=configureCanvas('scope-canvas');if(!obj)return;
    const {ctx,w,h}=obj,g=screenGrid(ctx,w,h,51,21,18,34);
    const windowMs=scopeWindowMs(),cycleSpan=scope.freq*windowMs/1000;
    const {crossing,start}=scopeStartCycle();
    const voltsLimit=scope.vdiv*4;
    const yVoltage=v=>g.top+g.ph/2-v/(scope.vdiv*8)*g.ph;
    const timeAtFraction=f=>f*windowMs;
    const sampleAtFraction=f=>sampleSignal(start+cycleSpan*f);
    label(ctx,'+'+fmt(voltsLimit,1)+' V',g.left-6,g.top+7,'right');
    label(ctx,'0 V',g.left-6,g.top+g.ph/2,'right');
    label(ctx,'-'+fmt(voltsLimit,1)+' V',g.left-6,g.top+g.ph-7,'right');
    label(ctx,'0 ms',g.left,h-13,'left');
    label(ctx,fmt(windowMs/2,2)+' ms',g.left+g.pw/2,h-13,'center');
    label(ctx,fmt(windowMs,2)+' ms',g.left+g.pw,h-13,'right');
    ctx.save();ctx.beginPath();ctx.rect(g.left,g.top,g.pw,g.ph);ctx.clip();
    const neutral=yVoltage(0);
    ctx.strokeStyle='#758091';ctx.lineWidth=1;ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(g.left,neutral);ctx.lineTo(g.left+g.pw,neutral);ctx.stroke();
    if(scope.trigger!=='off'&&scope.level>=-voltsLimit&&scope.level<=voltsLimit){
      const ty=yVoltage(scope.level);
      ctx.strokeStyle='#e7d38b';ctx.setLineDash([4,4]);ctx.beginPath();
      ctx.moveTo(g.left,ty);ctx.lineTo(g.left+g.pw,ty);ctx.stroke();
      if(crossing!==null){
        ctx.fillStyle='#e7d38b';ctx.setLineDash([]);
        ctx.beginPath();ctx.arc(g.left+g.pw*.2,ty,3.5,0,TAU);ctx.fill();
      }
    }
    ctx.setLineDash([]);
    // Subpixel sample spacing avoids dramatic visual undersampling at fast timebases.
    const n=Math.min(4500,Math.max(900,Math.ceil(cycleSpan*48)));
    let lo=Infinity,hi=-Infinity,sum=0;
    ctx.beginPath();
    for(let i=0;i<=n;i++){
      const fraction=i/n,voltage=sampleAtFraction(fraction);
      const x=g.left+g.pw*fraction,y=yVoltage(voltage);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      if(i<n){lo=Math.min(lo,voltage);hi=Math.max(hi,voltage);sum+=voltage*voltage;}
    }
    ctx.strokeStyle='#f5a8c9';ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
    for(const [id,fraction,color] of [
      ['A',scope.cursorA/100,'#92dfd1'],['B',scope.cursorB/100,'#dcc4f3']
    ]){
      const x=g.left+g.pw*fraction,voltage=sampleAtFraction(fraction);
      ctx.strokeStyle=color;ctx.setLineDash([6,4]);ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x,g.top);ctx.lineTo(x,g.top+g.ph);ctx.stroke();
      ctx.setLineDash([]);
      const y=yVoltage(voltage);
      if(y>=g.top&&y<=g.top+g.ph){
        ctx.beginPath();ctx.arc(x,y,4,0,TAU);ctx.fillStyle=color;ctx.fill();
      }
      label(ctx,id,clamp(x, g.left+9,g.left+g.pw-9),g.top+11,'center',color);
    }
    ctx.restore();
    const ta=timeAtFraction(scope.cursorA/100),tb=timeAtFraction(scope.cursorB/100);
    const dv=sampleAtFraction(scope.cursorB/100)-sampleAtFraction(scope.cursorA/100);
    const dt=Math.abs(tb-ta);
    $('scope-read-freq').textContent=scope.freq+' Hz';
    $('scope-read-pp').textContent=fmt(hi-lo,2)+' V';
    $('scope-read-rms').textContent=fmt(Math.sqrt(sum/n),2)+' V';
    $('scope-read-dt').textContent=fmt(tb-ta,2)+' ms';
    $('scope-read-invdt').textContent=dt>1e-9?fmt(1000/dt,1)+' Hz':'—';
    $('scope-read-dv').textContent=(dv>=0?'+':'')+fmt(dv,2)+' V';
    $('scope-timebase').textContent=scope.msdiv+' ms/div · '+scope.vdiv+' V/div';
    let status='HOLD';
    if(scope.mode==='captured')status='SINGLE / GENERATED';
    else if(scope.mode==='no-trigger')status='NO TRIGGER / HOLD';
    else if(scope.trigger!=='off'&&crossing===null)
      status=scope.running?'NO TRIGGER / FREE RUN':'NO TRIGGER / HOLD';
    else if(scope.running)status=scope.trigger==='off'?'FREE RUN / GENERATED':'TRIGGERED / GENERATED';
    // This is a polite live region: don't announce the same status every frame.
    if($('scope-status').textContent!==status)$('scope-status').textContent=status;
  }
  function scopeFrame(t){
    if(!scope.running)return;
    if(!scope.previous)scope.previous=t;
    const dt=Math.min(100,t-scope.previous);
    scope.previous=t;
    if(!document.hidden&&active==='scope'&&dt>=0){
      scope.phase=(scope.phase+dt*.0007)%1;
      // The trigger locks the display when a valid ideal threshold exists.
      drawScope();
    }
    scope.raf=requestAnimationFrame(scopeFrame);
  }
  function setScopeRunning(running){
    scope.running=running;
    scope.mode=running?'running':'hold';
    if(scope.raf!==null)cancelAnimationFrame(scope.raf);
    scope.raf=null;scope.previous=0;
    $('scope-run').textContent=running?'Pause trace':'Run trace';
    $('scope-run').setAttribute('aria-pressed',String(running));
    if(running)scope.raf=requestAnimationFrame(scopeFrame);
    if(active==='scope')drawScope();
  }
  function updateScope(){
    scope.wave=$('scope-wave').value;scope.freq=num('scope-freq');
    scope.amp=num('scope-amp');scope.duty=num('scope-duty');scope.noise=num('scope-noise');
    scope.msdiv=num('scope-msdiv');scope.vdiv=num('scope-vdiv');
    scope.trigger=$('scope-trigger').value;scope.level=num('scope-level');
    scope.cursorA=num('scope-cursor-a');scope.cursorB=num('scope-cursor-b');
    $('scope-freq-out').textContent=scope.freq+' Hz';
    $('scope-amp-out').textContent=fmt(scope.amp,1)+' V';
    $('scope-duty-out').textContent=scope.duty+'%';
    $('scope-noise-out').textContent=scope.noise+'%';
    $('scope-level-out').textContent=fmt(scope.level,1)+' V';
    $('scope-cursor-a-out').textContent=scope.cursorA+'%';
    $('scope-cursor-b-out').textContent=scope.cursorB+'%';
    $('scope-duty').disabled=!['square','pwm'].includes(scope.wave);
    $('scope-level').disabled=scope.trigger==='off';
    if(scope.mode==='captured'||scope.mode==='no-trigger')scope.mode='hold';
    if(active==='scope')drawScope();
  }
  for(const id of ['scope-wave','scope-freq','scope-amp','scope-duty','scope-noise',
    'scope-msdiv','scope-vdiv','scope-trigger','scope-level',
    'scope-cursor-a','scope-cursor-b'])$(id).addEventListener('input',updateScope);
  $('scope-run').addEventListener('click',()=>setScopeRunning(!scope.running));
  $('scope-single').addEventListener('click',()=>{
    setScopeRunning(false);
    const good=scope.trigger==='off'||models.triggerPhase(scope,scope.trigger,scope.level)!==null;
    scope.mode=good?'captured':'no-trigger';
    drawScope();
  });
  $('scope-reset').addEventListener('click',()=>{
    setScopeRunning(false);
    for(const [id,value] of Object.entries({
      'scope-wave':'sine','scope-freq':'120','scope-amp':'2','scope-duty':'50',
      'scope-noise':'0','scope-msdiv':'2','scope-vdiv':'1','scope-trigger':'rising',
      'scope-level':'0','scope-cursor-a':'25','scope-cursor-b':'75'
    }))$(id).value=value;
    scope.phase=0;scope.mode='hold';updateScope();
  });

  // Phase 3: planar 3R forward/inverse kinematics. Not a UR3e model.
  const lengths=[140,110,75];
  const robot={trail:[],status:'Target ready. Select Solve target or drag the plot.',
    statusType:'ready',dragging:false,solved:false};
  const jointAngles=()=>[1,2,3].map(i=>num('robot-j'+i));
  const getTarget=()=>({x:num('robot-target-x'),y:num('robot-target-y'),
    phi:num('robot-target-phi')});
  const readableAngle=v=>(Number(v.toFixed(1)).toString()+'°');
  const currentPose=()=>models.forward3(jointAngles(),lengths);
  function syncRobotControls(){
    [1,2,3].forEach(i=>{$('robot-j'+i+'-out').textContent=readableAngle(num('robot-j'+i));});
    const target=getTarget();
    $('robot-target-x-out').textContent=target.x+' mm';
    $('robot-target-y-out').textContent=target.y+' mm';
    $('robot-target-phi-out').textContent=target.phi+'°';
    $('robot-ik-status').textContent=robot.status;
    $('robot-ik-status').dataset.state=robot.statusType;
  }
  function trackTool(){
    const pos=currentPose(),last=robot.trail[robot.trail.length-1];
    if(!last||Math.hypot(pos.x-last[0],pos.y-last[1])>.3){
      robot.trail.push([pos.x,pos.y]);
      if(robot.trail.length>180)robot.trail.shift();
    }
  }
  function drawRobot(){
    const obj=configureCanvas('robot-canvas');if(!obj)return;
    const {ctx,w,h}=obj,pos=currentPose(),target=getTarget();
    const g=screenGrid(ctx,w,h,14,13,14,13);
    const scale=Math.min((w-52)/690,(h-42)/690);
    const ox=w*.5,oy=h*.51;
    const point=p=>[ox+p[0]*scale,oy-p[1]*scale];
    syncRobotControls();
    const tx=point([target.x,target.y])[0],ty=point([target.x,target.y])[1];
    ctx.strokeStyle='#657284';ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(g.left,oy);ctx.lineTo(w-g.left,oy);
    ctx.moveTo(ox,g.top);ctx.lineTo(ox,h-g.top);ctx.stroke();
    label(ctx,'+X',w-16,oy-12,'right');label(ctx,'+Y',ox+10,20);
    if($('robot-envelope').checked){
      ctx.strokeStyle='#8d7899';ctx.lineWidth=1.3;ctx.setLineDash([7,5]);
      ctx.beginPath();ctx.arc(ox,oy,325*scale,0,TAU);ctx.stroke();ctx.setLineDash([]);
    }
    if($('robot-trail').checked&&robot.trail.length>1){
      ctx.strokeStyle='#d8c7f2';ctx.lineWidth=1.5;ctx.setLineDash([3,4]);
      ctx.beginPath();robot.trail.forEach((p,i)=>{
        const [x,y]=point(p);if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      });ctx.stroke();ctx.setLineDash([]);
    }
    // World frame at base, then link frames (X along link; Y normal to link).
    if($('robot-frames').checked){
      let orientation=0;
      const angles=jointAngles();
      for(let i=0;i<=3;i++){
        if(i)orientation+=deg(angles[i-1]);
        const [jx,jy]=point(pos.points[i]),length=17,xx=Math.cos(orientation),xy=Math.sin(orientation);
        ctx.lineWidth=1.8;
        ctx.strokeStyle='#f4a8ae';ctx.beginPath();
        ctx.moveTo(jx,jy);ctx.lineTo(jx+length*xx,jy-length*xy);ctx.stroke();
        ctx.strokeStyle='#8bdccf';ctx.beginPath();
        ctx.moveTo(jx,jy);ctx.lineTo(jx-length*xy,jy-length*xx);ctx.stroke();
        label(ctx,'F'+i,clamp(jx+8,8,w-32),clamp(jy-11,11,h-8),'left','#cdd7e1');
      }
    }
    const strokes=['#e9a8cf','#85d9ce','#d5c3f7'];
    ctx.lineCap='round';ctx.lineJoin='round';
    for(let i=0;i<3;i++){
      const [x1,y1]=point(pos.points[i]),[x2,y2]=point(pos.points[i+1]);
      ctx.strokeStyle='#101821';ctx.lineWidth=12;ctx.beginPath();
      ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.strokeStyle=strokes[i];ctx.lineWidth=7;ctx.beginPath();
      ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.fillStyle='#242a38';ctx.strokeStyle='#e4edec';ctx.lineWidth=2;ctx.beginPath();
      ctx.arc(x1,y1,6.5,0,TAU);ctx.fill();ctx.stroke();
    }
    const [ex,ey]=point(pos.points[3]);
    ctx.fillStyle='#bcebd9';ctx.strokeStyle='#1d252c';ctx.lineWidth=2;ctx.beginPath();
    ctx.arc(ex,ey,7.5,0,TAU);ctx.fill();ctx.stroke();
    const rad=deg(pos.theta);ctx.strokeStyle='#bcebd9';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(rad)*23,ey-Math.sin(rad)*23);ctx.stroke();
    const error=Math.hypot(pos.x-target.x,pos.y-target.y);
    // Target and wrist pose are distinct; a red target is an unsatisfied goal.
    const targetColor=robot.solved&&error<2?'#9be6b7':'#f0bf83';
    ctx.lineWidth=2;ctx.strokeStyle=targetColor;ctx.beginPath();
    ctx.arc(tx,ty,9,0,TAU);ctx.moveTo(tx-14,ty);ctx.lineTo(tx+14,ty);
    ctx.moveTo(tx,ty-14);ctx.lineTo(tx,ty+14);ctx.stroke();
    label(ctx,'GOAL',clamp(tx+13,12,w-47),clamp(ty-18,15,h-14),'left',targetColor);
    label(ctx,'TOOL',clamp(ex+12,12,w-50),clamp(ey+16,15,h-14),'left','#d8f2e9');
    $('robot-read-x').textContent=fmt(pos.x,1)+' mm';
    $('robot-read-y').textContent=fmt(pos.y,1)+' mm';
    $('robot-read-angle').textContent=readableAngle(models.wrap180(pos.theta));
    $('robot-read-error').textContent=fmt(error,1)+' mm';
  }
  function setRobotStatus(message,type='ready'){
    robot.status=message;robot.statusType=type;syncRobotControls();
  }
  function solveTarget(){
    const goal=getTarget();
    const answer=models.inverse3(goal,lengths,$('robot-elbow').value,170);
    if(!answer.ok){
      robot.solved=false;
      setRobotStatus(answer.reason==='outside-reach'?
        'Unreachable wrist position at this tool orientation. Change X, Y, or φ.':
        'Joint limit: this elbow branch exceeds ±170°. Try the other branch or a new target.','error');
      if(active==='robot')drawRobot();
      return false;
    }
    answer.angles.forEach((value,i)=>{$('robot-j'+(i+1)).value=value.toFixed(1)});
    trackTool();
    const actual=currentPose(),error=Math.hypot(actual.x-goal.x,actual.y-goal.y);
    robot.solved=true;
    setRobotStatus('IK solved ('+$('robot-elbow').value+' branch). Position error '+
      fmt(error,2)+' mm from 0.1° slider rounding.','success');
    if(active==='robot')drawRobot();
    return true;
  }
  function updateRobotGoal(){
    robot.solved=false;
    setRobotStatus('New target selected. Choose Solve target to update the joints.');
    if(active==='robot')drawRobot();
  }
  [1,2,3].forEach(i=>$('robot-j'+i).addEventListener('input',()=>{
    robot.solved=false;trackTool();
    setRobotStatus('Manual joint adjustment. Solve target to fit the selected goal.');
    if(active==='robot')drawRobot();
  }));
  for(const id of ['robot-target-x','robot-target-y','robot-target-phi','robot-elbow']){
    $(id).addEventListener('input',updateRobotGoal);
  }
  for(const id of ['robot-envelope','robot-frames','robot-trail'])
    $(id).addEventListener('change',()=>{if(active==='robot')drawRobot()});
  const poses={extend:[0,0,0],fold:[120,-150,120],inspect:[25,-55,40]};
  document.querySelectorAll('[data-robot-preset]').forEach(b=>b.addEventListener('click',()=>{
    poses[b.dataset.robotPreset].forEach((value,i)=>{$('robot-j'+(i+1)).value=value});
    robot.solved=false;trackTool();
    setRobotStatus('Preset joint pose applied. Use target controls to solve a goal.');
    drawRobot();
  }));
  $('robot-solve').addEventListener('click',solveTarget);
  $('robot-clear-path').addEventListener('click',()=>{
    robot.trail=[];trackTool();
    if(active==='robot')drawRobot();
  });
  const robotCanvas=$('robot-canvas');
  function setTargetFromPointer(event){
    const bounds=robotCanvas.getBoundingClientRect(),w=bounds.width,h=bounds.height;
    if(w<1||h<1)return;
    const scale=Math.min((w-52)/690,(h-42)/690);
    const x=(event.clientX-bounds.left-w*.5)/scale;
    const y=(h*.51-(event.clientY-bounds.top))/scale;
    $('robot-target-x').value=Math.round(clamp(x,-325,325));
    $('robot-target-y').value=Math.round(clamp(y,-325,325));
    solveTarget();
  }
  robotCanvas.addEventListener('pointerdown',event=>{
    if(event.button!==0&&event.pointerType==='mouse')return;
    robot.dragging=true;
    if(robotCanvas.setPointerCapture)robotCanvas.setPointerCapture(event.pointerId);
    setTargetFromPointer(event);event.preventDefault();
  });
  robotCanvas.addEventListener('pointermove',event=>{
    if(!robot.dragging)return;
    setTargetFromPointer(event);
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])
    robotCanvas.addEventListener(name,()=>{robot.dragging=false});
  trackTool();

  // Module 03: browser-only RGB/DMX-style stage visualization.
  const scenes = {
    aurora:[138,86,218,85], warm:[255,158,90,95],
    ice:[85,205,246,88], blackout:[138,86,218,0]
  };
  function hex(x){return x.toString(16).padStart(2,'0').toUpperCase()}
  function renderLights() {
    const rgb=['r','g','b'].map(s=>num('lights-'+s));
    const dim=num('lights-dim');
    const hexColor='#'+rgb.map(hex).join('');
    for(const channel of ['r','g','b']) $('lights-'+channel+'-out').textContent=num('lights-'+channel);
    $('lights-dim-out').textContent=dim+'%';
    $('lights-read-rgb').textContent=rgb.join(' / ');
    $('lights-read-dim').textContent=dim+'%';
    $('lights-read-hex').textContent=hexColor;
    const scene=$('lights-scene');
    $('lights-stage-status').textContent='SCENE: '+(scene.options[scene.selectedIndex].textContent).toUpperCase();
    document.querySelectorAll('[data-fixture]').forEach(f=>{
      f.style.setProperty('--light-rgb',rgb.join(','));
      f.style.setProperty('--light-opacity',String(dim/100));
    });
  }
  $('lights-scene').addEventListener('change',()=>{
    const scene=scenes[$('lights-scene').value];
    if(scene) ['r','g','b','dim'].forEach((id,i)=>{$('lights-'+id).value=scene[i]});
    renderLights();
  });
  for(const id of ['r','g','b','dim']) $('lights-'+id).addEventListener('input',()=>{
    $('lights-scene').value='custom';renderLights();
  });

  // Module 04: deterministic illustrative exponential temperature responses.
  let thermal = {power:65,cool:20,time:45,visible:[true,true,true,true],
    playing:false,raf:null,previous:0};
  const ambient = [23,24.2,22.7,23.5];
  function tempAt(channel, min) {
    const p=thermal.power/100, c=thermal.cool/100;
    const tau=10+channel*4+10*c;
    const rise=p*(58+channel*6)*(1-.78*c)*(1-Math.exp(-min/tau));
    const ripple=(1-Math.exp(-min/9))*Math.sin(min*.14+channel*1.6)*(.25+.35*p);
    return ambient[channel]+rise+ripple;
  }
  function drawThermal() {
    const obj=configureCanvas('thermal-canvas');if(!obj)return;
    const {ctx,w,h}=obj;
    const g=screenGrid(ctx,w,h,46,20,15,34);
    const top=Math.ceil(Math.max(60,...[0,1,2,3].map(i=>tempAt(i,120)+10))/10)*10;
    const bottom=15;
    const pxX=t=>g.left+t/120*g.pw;
    const pxY=t=>g.top+g.ph-(t-bottom)/(top-bottom)*g.ph;
    for(let v=20;v<top;v+=20) label(ctx,v+'°',g.left-7,pxY(v),'right');
    for(let t=0;t<=120;t+=30)label(ctx,t+' min',pxX(t),h-14,t===0?'left':t===120?'right':'center');
    for(let i=0;i<4;i++){
      if(!thermal.visible[i])continue;
      ctx.beginPath();
      for(let t=0;t<=120;t+=.5){
        const x=pxX(t),y=pxY(tempAt(i,t));
        if(t===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=colors[i];ctx.lineWidth=2.1;ctx.lineJoin='round';ctx.stroke();
    }
    const cursor=pxX(thermal.time);
    ctx.setLineDash([4,5]);ctx.strokeStyle='#d8dae8';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(cursor,g.top);ctx.lineTo(cursor,g.top+g.ph);ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<4;i++){
      const temp=tempAt(i,thermal.time);
      $('thermal-read-'+i).textContent=fmt(temp,1)+'°C';
      $('thermal-read-'+i).parentElement.style.opacity=thermal.visible[i]?'1':'.55';
      if(!thermal.visible[i])continue;
      ctx.fillStyle=colors[i];ctx.strokeStyle='#1c202a';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cursor,pxY(temp),5,0,TAU);ctx.fill();ctx.stroke();
    }
    $('thermal-power-out').textContent=thermal.power+'%';
    $('thermal-cool-out').textContent=thermal.cool+'%';
    $('thermal-time-out').textContent=fmt(thermal.time,0)+' min';
    $('thermal-time').value=Math.round(thermal.time);
  }
  function thermalFrame(timestamp) {
    if(!thermal.playing)return;
    if(!thermal.previous)thermal.previous=timestamp;
    const elapsed=Math.min(100,timestamp-thermal.previous);
    thermal.previous=timestamp;
    if(!document.hidden&&active==='thermal'){
      thermal.time=clamp(thermal.time+elapsed*.0075,0,120);
      drawThermal();
      if(thermal.time>=120){setThermalRunning(false);return;}
    }
    thermal.raf=requestAnimationFrame(thermalFrame);
  }
  function setThermalRunning(on) {
    thermal.playing=on;
    if(thermal.raf!==null)cancelAnimationFrame(thermal.raf);
    thermal.raf=null;thermal.previous=0;
    $('thermal-run').textContent=on?'Pause test':'Play test';
    $('thermal-run').setAttribute('aria-pressed',String(on));
    $('thermal-status').textContent=on?'PLAYING / GENERATED':'PAUSED';
    if(on) {
      if(thermal.time>=120)thermal.time=0;
      thermal.raf=requestAnimationFrame(thermalFrame);
    }
    if(active==='thermal')drawThermal();
  }
  function updateThermal(){
    thermal.power=num('thermal-power');thermal.cool=num('thermal-cool');
    thermal.time=num('thermal-time');
    thermal.visible=[0,1,2,3].map(i=>document.querySelector('[data-thermal-channel="'+i+'"]').checked);
    if(active==='thermal')drawThermal();
  }
  for(const id of ['thermal-power','thermal-cool','thermal-time'])
    $(id).addEventListener('input',updateThermal);
  document.querySelectorAll('[data-thermal-channel]').forEach(ch=>ch.addEventListener('change',updateThermal));
  $('thermal-run').addEventListener('click',()=>setThermalRunning(!thermal.playing));
  $('thermal-export').addEventListener('click',()=>{
    const rows=['elapsed_min,tc_01_c,tc_02_c,tc_03_c,tc_04_c,heater_percent,cooling_percent'];
    for(let i=0;i<=120;i++){
      rows.push([i,...ambient.map((_,j)=>fmt(tempAt(j,i),2)),thermal.power,thermal.cool].join(','));
    }
    const blob=new Blob([rows.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='simulated_thermal_run.csv';document.body.appendChild(a);
    a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });

  function renderActive() {
    if(active==='scope')drawScope();
    else if(active==='robot')drawRobot();
    else if(active==='lights')renderLights();
    else if(active==='thermal')drawThermal();
  }
  let pendingResize=false;
  window.addEventListener('resize',()=>{
    if(pendingResize)return;
    pendingResize=true;
    requestAnimationFrame(()=>{pendingResize=false;renderActive()});
  },{passive:true});
  window.addEventListener('pagehide',()=>{
    if(scope.raf!==null)cancelAnimationFrame(scope.raf);
    if(thermal.raf!==null)cancelAnimationFrame(thermal.raf);
  });
  updateScope();renderLights();updateThermal();
  const hash=window.location.hash.replace('#wb-panel-','');
  setActive(keys.includes(hash)?hash:'scope');
})();
