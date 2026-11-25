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
