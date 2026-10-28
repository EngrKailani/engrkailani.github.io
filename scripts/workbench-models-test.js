/* Run with: node scripts/workbench-models-test.js
   Deterministic unit tests; no browser, hardware, or remote service required. */
'use strict';
const assert=require('node:assert/strict');
const m=require('../workbench-models.js');
const L=[140,110,75];
const near=(got,want,tol=1e-8)=>assert.ok(Math.abs(got-want)<=tol,
  'Expected '+got+' within '+tol+' of '+want);
let checks=0;
const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};

test('Forward kinematics: zero and vertical poses',()=>{
  const full=m.forward3([0,0,0],L);
  near(full.x,325);near(full.y,0);near(full.theta,0);
  const vertical=m.forward3([90,0,0],L);
  near(vertical.x,0);near(vertical.y,325);
});
test('Sine, triangle, square and PWM definitions',()=>{
  near(m.waveformAt('sine',0),0);near(m.waveformAt('sine',.25),1);
  near(m.waveformAt('triangle',0),-1);near(m.waveformAt('triangle',.5),1);
  near(m.waveformAt('square',.1,20),1);
  near(m.waveformAt('square',.25,20),-1);
  near(m.waveformAt('pwm',.1,20),1);near(m.waveformAt('pwm',.3,20),0);
  assert.throws(()=>m.waveformAt('unsupported',0),RangeError);
});
test('Noise-free voltage honors amplitude',()=>{
  near(m.voltageAt({wave:'sine',amp:3,duty:50,noise:0},.25),3);
});
test('Trigger finds ideal rising/falling edges',()=>{
  const sine={wave:'sine',amp:2,duty:50};
  near(m.triggerPhase(sine,'rising',0),0,1e-3);
  near(m.triggerPhase(sine,'falling',0),.5,1e-3);
  assert.equal(m.triggerPhase(sine,'rising',3),null);
  assert.equal(m.triggerPhase(sine,'off',0),null);
  const pwm={wave:'pwm',amp:2,duty:25};
  near(m.triggerPhase(pwm,'rising',1),0,1e-3);
  near(m.triggerPhase(pwm,'falling',1),.25,1e-3);
});
test('Inverse kinematics reaches known poses in both elbow branches',()=>{
  for(const q of [[25,-55,40],[45,65,-35],[-85,75,25],
    [105,-100,-40],[-115,-30,90],[25,0,25]]){
    const pose=m.forward3(q,L);
    const target={x:pose.x,y:pose.y,phi:m.wrap180(pose.theta)};
    const answer=m.inverse3(target,L,q[1]<0?'down':'up',170);
    assert.equal(answer.ok,true,JSON.stringify({q,answer}));
    near(answer.errorMm,0,1e-6);
    const rounded=answer.angles.map(a=>Number(a.toFixed(1)));
    const roundPose=m.forward3(rounded,L);
    assert.ok(Math.hypot(roundPose.x-pose.x,roundPose.y-pose.y)<.45,
      '0.1 degree quantization should stay within 0.45 mm');
  }
});
test('Randomized deterministic inverse round trips',()=>{
  for(let i=0;i<800;i++){
    const q=[-155+310*((i*37)%797)/797,
      -155+310*((i*109)%797)/797,
      -155+310*((i*229)%797)/797];
    const pose=m.forward3(q,L);
    const target={x:pose.x,y:pose.y,phi:m.wrap180(pose.theta)};
    const result=m.inverse3(target,L,q[1]<0?'down':'up',170);
    assert.equal(result.ok,true,'IK should reproduce an interior joint pose');
    near(result.errorMm,0,1e-6);
  }
});
test('Rejects unreachable, inner-workspace and joint-limit targets',()=>{
  assert.equal(m.inverse3({x:325,y:325,phi:0},L,'down').reason,'outside-reach');
  assert.equal(m.inverse3({x:75,y:0,phi:0},L,'down').reason,'outside-reach');
  const pose=m.forward3([175,0,0],L);
  assert.equal(m.inverse3({x:pose.x,y:pose.y,phi:175},L,'down').reason,'joint-limit');
});
test('Validates input and angle wrapping',()=>{
  near(m.wrap180(190),-170);near(m.wrap180(-190),170);
  assert.throws(()=>m.inverse3({x:0,y:0,phi:NaN},L,'down'),RangeError);
  assert.throws(()=>m.inverse3({x:0,y:0,phi:0},L,'invalid'),RangeError);
});
console.log('PASS: '+checks+' model test groups');
