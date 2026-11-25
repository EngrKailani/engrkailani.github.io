/* Independent review of the thermal logger's published trend-label logic.
 * Reference: https://github.com/EngrKailani/Thermal-Logger/blob/main/main_ui.pyw
 *             update_channel_trends, with defaults in logger_core.py.
 * This reproduces only finite-valued, single-channel trend classification;
 * it does not run the original application, connect hardware or process lab data.
 * Run: node scripts/thermal-trend-source-check.js
 */
'use strict';
const DEFAULT_WINDOW=10, DEFAULT_BAND=3.0;
function review(readings,{window=DEFAULT_WINDOW,band=DEFAULT_BAND}={}){
  if(!Array.isArray(readings)||!Number.isInteger(window)||window<2||window>200||
    !Number.isFinite(band)||band<0)throw new RangeError('Invalid readings, window or band');
  const history=[];
  let consecutiveValid=0,lastValid=false,legacy='no data';
  for(const reading of readings){
    // This check is scoped to finite readings and missing/non-finite markers.
    // Python's float coercion can accept additional string/Infinity cases.
    lastValid=typeof reading==='number'&&Number.isFinite(reading);
    if(lastValid){
      history.push(reading);
      if(history.length>window)history.splice(0,history.length-window);
      consecutiveValid+=1;
    }else consecutiveValid=0;
  }
  let range=null,delta=null,mean=null;
  if(history.length>=2){
    range=Math.max(...history)-Math.min(...history);
    delta=history[history.length-1]-history[0];
    mean=history.reduce((sum,x)=>sum+x,0)/history.length;
    // Faithful to main_ui.pyw: range <= band OR out-of-band with
    // identical endpoints labels 'stable', independent of full-window count.
    legacy=range<=band?'stable':delta>0?'increasing':delta<0?'decreasing':'stable';
  }
  // Proposed review policy, not a feature present in the original logger:
  // require a full uninterrupted set of readings and a within-band range.
  const conservative=!lastValid?'missing latest reading':
    consecutiveValid<window?'insufficient consecutive readings':
    range<=band?'within configured band':'outside configured band';
  return {legacy,conservative,range,delta,mean,
    validInHistory:history.length,consecutiveValid,window,band};
}
function runChecks(){
  function expect(condition,message){if(!condition)throw Error(message)}
  const cases=[
    {name:'Single sample',values:[40],legacy:'no data',conservative:'insufficient consecutive readings'},
    {name:'Two close readings',values:[40,40.5],legacy:'stable',conservative:'insufficient consecutive readings'},
    {name:'Ten close readings',values:[40,40.2,40.3,40.1,39.9,40.2,40.1,40.2,40.3,40.1],legacy:'stable',conservative:'within configured band'},
    {name:'Ten increasing readings',values:[30,31,32,33,34,35,36,37,38,39],legacy:'increasing',conservative:'outside configured band'},
    {name:'Ten decreasing readings',values:[50,49,48,47,46,45,44,43,42,41],legacy:'decreasing',conservative:'outside configured band'},
    {name:'Wide fluctuation with equal endpoints',values:[40,44,35,40,39,38,40,40,40,40],legacy:'stable',conservative:'outside configured band'},
    {name:'Missing last observation after a stable window',values:[40,40,40,40,40,40,40,40,40,40,null],legacy:'stable',conservative:'missing latest reading'},
    {name:'Missing observation within the last window',values:[40,40,40,40,40,null,40,40,40,40,40],legacy:'stable',conservative:'insufficient consecutive readings'},
    {name:'Exact threshold is within band',values:[0,3],legacy:'stable',conservative:'insufficient consecutive readings'},
    {name:'Just beyond threshold increases',values:[0,3.01],legacy:'increasing',conservative:'insufficient consecutive readings'}
  ];
  for(const item of cases){
    const actual=review(item.values);
    expect(actual.legacy===item.legacy,item.name+': source label mismatch '+actual.legacy);
    expect(actual.conservative===item.conservative,item.name+': proposed review mismatch '+actual.conservative);
  }
  const wrap=review([10,20,30,40,50,60,70,80,90,100,100]);
  expect(wrap.validInHistory===DEFAULT_WINDOW,'Window must be bounded to 10');
  expect(wrap.delta===80,'Window must discard oldest element');
  const nullCase=review([null]);
  expect(nullCase.legacy==='no data','Missing reading must not initialize a history');
  for(const options of [{window:1},{window:2.5},{band:-1}]){
    let threw=false;
    try{review([1,2],options)}catch(e){threw=e instanceof RangeError}
    expect(threw,'Invalid configuration must be rejected');
  }
  console.log('PASS '+cases.length+' source-trend edge cases and 5 boundary/configuration checks.');
  console.log(JSON.stringify(cases.map(c=>({case:c.name,sourceLabel:c.legacy,proposedReview:c.conservative})),null,2));
  return cases;
}
module.exports={review,runChecks,DEFAULT_WINDOW,DEFAULT_BAND};
if(require.main===module)runChecks();
