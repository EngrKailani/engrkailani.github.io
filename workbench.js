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

  // Module 01: waveform generator and synthetic measurements.
  const scope = { wave: 'sine', freq: 120, amp: 2, duty: 50, noise: 0,
    phase: 0, running: false, raf: null, previous: 0 };
  const TAU = 2 * Math.PI;
  function phaseValue(t) {
    const u = ((t % 1) + 1) % 1;
    if (scope.wave === 'sine') return Math.sin(TAU * u);
    if (scope.wave === 'triangle') return 1 - 4 * Math.abs(u - .5);
    if (scope.wave === 'pwm') return u < scope.duty / 100 ? 1 : 0;
    return u < scope.duty / 100 ? 1 : -1;
  }
  function sampleSignal(cycle) {
    const noise = (Math.sin(cycle * 171.7) * .66 + Math.sin(cycle * 367.1) * .34) *
      scope.amp * scope.noise / 100;
    return scope.amp * phaseValue(cycle) + noise;
  }
  function drawScope() {
    const obj = configureCanvas('scope-canvas'); if (!obj) return;
    const {ctx, w, h} = obj;
    const g = screenGrid(ctx, w, h, 48, 20, 17, 31);
    const displayTimeMs = 3000 / scope.freq;
    const yScale = Math.max(.5, scope.amp * 1.3);
    label(ctx, '+' + fmt(yScale, 1) + ' V', g.left - 5, g.top + 7, 'right');
    label(ctx, '0 V', g.left - 5, g.top + g.ph / 2, 'right');
    label(ctx, '-' + fmt(yScale, 1) + ' V', g.left - 5, g.top + g.ph - 7, 'right');
    label(ctx, '0', g.left, h - 13, 'left');
    label(ctx, fmt(displayTimeMs / 2, displayTimeMs < 10 ? 1 : 0) + ' ms', g.left + g.pw / 2, h - 13, 'center');
    label(ctx, fmt(displayTimeMs, displayTimeMs < 10 ? 1 : 0) + ' ms', g.left + g.pw, h - 13, 'right');
    ctx.strokeStyle = '#707785';ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);ctx.beginPath();
    ctx.moveTo(g.left, g.top + g.ph / 2);ctx.lineTo(g.left + g.pw, g.top + g.ph / 2);ctx.stroke();ctx.setLineDash([]);
    const N = Math.max(360, Math.round(g.pw));
    let min = Infinity, max = -Infinity, squared = 0;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const cycle = scope.phase + 3 * i / N;
      const voltage = sampleSignal(cycle);
      const x = g.left + g.pw * i / N;
      const y = g.top + g.ph / 2 - voltage / yScale * g.ph * .45;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      if (i < N) {min = Math.min(min, voltage);max = Math.max(max, voltage);squared += voltage * voltage;}
    }
    ctx.strokeStyle = '#f5a8c9';ctx.lineWidth = 2.3;ctx.lineJoin = 'round';ctx.stroke();
    $('scope-read-freq').textContent = scope.freq + ' Hz';
    $('scope-read-pp').textContent = fmt(max - min, 2) + ' V';
    $('scope-read-rms').textContent = fmt(Math.sqrt(squared / N), 2) + ' V';
    $('scope-timebase').textContent = fmt(displayTimeMs, displayTimeMs < 10 ? 1 : 0) + ' ms window / 3 cycles';
  }
  function scopeFrame(time) {
    if (!scope.running) return;
    if (!scope.previous) scope.previous = time;
    const dt = Math.min(80, time - scope.previous);
    scope.previous = time;
    if (!document.hidden && active === 'scope') {
      scope.phase = (scope.phase + dt * .0006) % 1;
      drawScope();
    }
    scope.raf = requestAnimationFrame(scopeFrame);
  }
  function setScopeRunning(running) {
    scope.running = running;
    $('scope-run').textContent = running ? 'Pause trace' : 'Run trace';
    $('scope-run').setAttribute('aria-pressed', String(running));
    $('scope-status').textContent = running ? 'RUNNING / SIMULATED' : 'HOLD';
    if (scope.raf !== null) cancelAnimationFrame(scope.raf);
    scope.raf = null; scope.previous = 0;
    if (running) scope.raf = requestAnimationFrame(scopeFrame);
    else drawScope();
  }
  function updateScope() {
    scope.wave = $('scope-wave').value;
    scope.freq = num('scope-freq');scope.amp = num('scope-amp');
    scope.duty = num('scope-duty');scope.noise = num('scope-noise');
    $('scope-freq-out').textContent = scope.freq + ' Hz';
    $('scope-amp-out').textContent = fmt(scope.amp, 1) + ' V';
    $('scope-duty-out').textContent = scope.duty + '%';
    $('scope-noise-out').textContent = scope.noise + '%';
    $('scope-duty').disabled = !['square', 'pwm'].includes(scope.wave);
    if (active === 'scope') drawScope();
  }
  for (const id of ['scope-wave', 'scope-freq', 'scope-amp', 'scope-duty', 'scope-noise'])
    $(id).addEventListener('input', updateScope);
  $('scope-run').addEventListener('click', () => setScopeRunning(!scope.running));
  $('scope-reset').addEventListener('click', () => {
    setScopeRunning(false);
    for (const [id, value] of Object.entries({
      'scope-wave':'sine','scope-freq':'120','scope-amp':'2','scope-duty':'50','scope-noise':'0'
    })) $(id).value = value;
    scope.phase = 0;updateScope();
  });

  // Module 02: direct forward kinematics for a generic three-link planar chain.
  const lengths = [140, 110, 75];
  function robotPoints(angles) {
    let theta = 0, x = 0, y = 0;
    const result = [[x, y]];
    for (let i = 0; i < 3; i++) {
      theta += deg(angles[i]);
      x += lengths[i] * Math.cos(theta);
      y += lengths[i] * Math.sin(theta);
      result.push([x, y]);
    }
    return {points: result, x, y, theta: angles.reduce((a,b)=>a+b,0)};
  }
  function drawRobot() {
    const obj = configureCanvas('robot-canvas'); if (!obj) return;
    const {ctx,w,h} = obj;
    const a = [num('robot-j1'), num('robot-j2'), num('robot-j3')];
    a.forEach((v,i) => $('robot-j'+(i+1)+'-out').textContent = v + '°');
    const pos = robotPoints(a), g = screenGrid(ctx,w,h,18,13,18,14);
    const scale = Math.min((w - 80) / 690, (h - 45) / 690);
    const ox = w * .51, oy = h * .51;
    const point = p => [ox + p[0] * scale, oy - p[1] * scale];
    ctx.strokeStyle='#606a7b';ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(g.left,oy);ctx.lineTo(w-g.left,oy);ctx.moveTo(ox,g.top);ctx.lineTo(ox,h-g.top);ctx.stroke();
    label(ctx,'+X',w-24,oy-13,'right');label(ctx,'+Y',ox+10,20,'left');
    if ($('robot-envelope').checked) {
      ctx.strokeStyle='#8b7997';ctx.lineWidth=1.3;ctx.setLineDash([7,5]);ctx.beginPath();
      ctx.arc(ox,oy,lengths.reduce((a,b)=>a+b,0)*scale,0,TAU);ctx.stroke();ctx.setLineDash([]);
    }
    const strokes = ['#e9a8cf','#85d9ce','#d5c3f7'];
    for (let i=0;i<3;i++){
      const [x1,y1]=point(pos.points[i]),[x2,y2]=point(pos.points[i+1]);
      ctx.strokeStyle='#101821';ctx.lineWidth=12;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.strokeStyle=strokes[i];ctx.lineWidth=7;
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.fillStyle='#242a38';ctx.strokeStyle='#dce9e9';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x1,y1,7,0,TAU);ctx.fill();ctx.stroke();
    }
    const [tx,ty]=point(pos.points[3]);ctx.fillStyle='#bcebd9';ctx.strokeStyle='#1d252c';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(tx,ty,8,0,TAU);ctx.fill();ctx.stroke();
    const offset = deg(pos.theta), vx=Math.cos(offset), vy=-Math.sin(offset);
    ctx.strokeStyle='#bcebd9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+vx*21,ty+vy*21);ctx.stroke();
    ctx.fillStyle='#bcebd9';ctx.beginPath();ctx.arc(tx+vx*21,ty+vy*21,3,0,TAU);ctx.fill();
    label(ctx,'TOOL',clamp(tx+12,12,w-50),clamp(ty-16,15,h-14),'left','#e4eee9');
    label(ctx,'BASE',clamp(ox+11,15,w-80),clamp(oy+18,20,h-16),'left');
    $('robot-read-x').textContent = fmt(pos.x,1)+' mm';
    $('robot-read-y').textContent = fmt(pos.y,1)+' mm';
    $('robot-read-angle').textContent = fmt(pos.theta,0)+'°';
  }
  for(let i=1;i<=3;i++) $('robot-j'+i).addEventListener('input',()=>{if(active==='robot')drawRobot()});
  $('robot-envelope').addEventListener('change',()=>{if(active==='robot')drawRobot()});
  const poses = {extend:[0,0,0],fold:[120,-150,120],inspect:[25,-55,40]};
  document.querySelectorAll('[data-robot-preset]').forEach(b=>b.addEventListener('click',()=>{
    poses[b.dataset.robotPreset].forEach((value,i)=>{ $('robot-j'+(i+1)).value = value; });
    drawRobot();
  }));

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
