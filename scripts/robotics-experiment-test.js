/* Run: node scripts/robotics-experiment-test.js */
'use strict';
const assert=require('node:assert/strict');
const exp=require('../robotics-experiment-model.js');
const a=exp.runExperiment({seed:42,noiseMm:8,alpha:0.3});
const b=exp.runExperiment({seed:42,noiseMm:8,alpha:0.3});
assert.deepEqual(a,b,'same seed and parameters must give identical measurements');
assert.equal(a.rows.length,240);
assert(a.metrics.rawRmse>0 && Number.isFinite(a.metrics.filteredRmse));
assert(a.rows.every(r=>Number.isFinite(r.rawError)&&Number.isFinite(r.filteredError)));
const c=exp.runExperiment({seed:43,noiseMm:8,alpha:0.3});
assert.notDeepEqual(a.rows[0].measuredX,c.rows[0].measuredX,'seed changes noise series');
const zero=exp.runExperiment({noiseMm:0,seed:123});
assert(zero.metrics.rawRmse<1e-8,'noise-free IK should recover model target');
assert(zero.metrics.filteredRmse>zero.metrics.rawRmse,'filter introduces lag for moving trajectory');
assert.throws(()=>exp.runExperiment({alpha:0}),RangeError);
assert.throws(()=>exp.runExperiment({noiseMm:-2}),RangeError);
console.log('Robotics experiment: deterministic seed, FK/IK consistency, noise-free baseline, validation passed.');


const batchA=exp.runTrials({seed:42,noiseMm:8,alpha:0.3,trials:12});
const batchB=exp.runTrials({seed:42,noiseMm:8,alpha:0.3,trials:12});
assert.deepEqual(batchA,batchB,'paired Monte Carlo trials and bootstrap must be deterministic');
assert.equal(batchA.records.length,12);
assert(batchA.metrics.ciLow<=batchA.metrics.meanImprovementMm);
assert(batchA.metrics.meanImprovementMm<=batchA.metrics.ciHigh);
assert(batchA.records.every(r=>Math.abs(r.improvementMm-(r.rawRmse-r.filteredRmse))<1e-10));
const alphaOne=exp.runTrials({seed:42,alpha:1,trials:8});
assert(Math.abs(alphaOne.metrics.meanImprovementMm)<1e-10,'alpha = 1 must match raw baseline');
const sensitivity=exp.runSensitivity({seed:42,trials:6});
assert.deepEqual(sensitivity.map(r=>r.alpha),[0.15,0.3,0.5,0.8,1]);
assert(sensitivity.every(r=>Number.isFinite(r.filteredRmse)&&Number.isFinite(r.rawRmse)));
assert(Math.abs(sensitivity[4].filteredRmse-sensitivity[4].rawRmse)<1e-10);
assert.throws(()=>exp.runTrials({seed:-1}),RangeError);
assert.throws(()=>exp.runTrials({trials:41}),RangeError);
assert.throws(()=>exp.runTrials({trials:2}),RangeError);
console.log('Paired-seed Monte Carlo, interval bounds, smoothing sweep, and edge cases passed.');
