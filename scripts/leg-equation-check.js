/* Independent consistency checks of the public three-link Honors MATLAB equations.
 * Original source: https://github.com/EngrKailani/3link-sim/blob/main/MatLabCode
 * This is a new JavaScript equation check, NOT a run of the original S-function,
 * an anthropometric model, or a recorded human-gait experiment.
 *
 * Run: node scripts/leg-equation-check.js
 */
'use strict';

const lengths=Object.freeze([1,1,0.5]); // Source values; no physical unit specified.
function calculate(angles,rates=[0,0,0]){
  if(!Array.isArray(angles)||!Array.isArray(rates)||angles.length!==3||rates.length!==3 ||
    ![...angles,...rates].every(Number.isFinite))
    throw new RangeError('Expected three finite joint angles and three finite angular rates');
  const [l1,l2,l3]=lengths;
  const [a,b,c]=[angles[0],angles[0]+angles[1],angles[0]+angles[1]+angles[2]];
  const x=l1*Math.cos(a)+l2*Math.cos(b)+l3*Math.cos(c);
  const y=l1*Math.sin(a)+l2*Math.sin(b)+l3*Math.sin(c);
  const jacobian=[
    [-l1*Math.sin(a)-l2*Math.sin(b)-l3*Math.sin(c),
      -l2*Math.sin(b)-l3*Math.sin(c),-l3*Math.sin(c)],
    [l1*Math.cos(a)+l2*Math.cos(b)+l3*Math.cos(c),
      l2*Math.cos(b)+l3*Math.cos(c),l3*Math.cos(c)]
  ];
  const velocity=jacobian.map(row=>row.reduce((sum,value,i)=>sum+value*rates[i],0));
  return {x,y,velocity,jacobian};
}
function verify(){
  const close=(value,expected,why,tolerance=1e-8)=>{
    if(Math.abs(value-expected)>tolerance)
      throw Error(why+': expected '+expected+'; got '+value);
  };
  const straight=calculate([0,0,0],[0.1,0,0]);
  close(straight.x,2.5,'Straight configuration x');
  close(straight.y,0,'Straight configuration y');
  close(straight.velocity[0],0,'Straight configuration vx');
  close(straight.velocity[1],0.25,'Straight configuration vy');
  const vertical=calculate([Math.PI/2,0,0],[0,0.1,0]);
  close(vertical.x,0,'Vertical configuration x');
  close(vertical.y,2.5,'Vertical configuration y');
  close(vertical.velocity[0],-0.15,'Vertical configuration vx');
  close(vertical.velocity[1],0,'Vertical configuration vy');
  const bent=calculate([Math.PI/6,-Math.PI/3,Math.PI/6]);
  close(bent.x,Math.sqrt(3)+0.5,'Bent configuration x');
  close(bent.y,0,'Bent configuration y');
  // Independently check that J is the derivative of the published position model.
  for(const q of [[0.4,-0.6,0.9],[-0.2,0.7,-1.1],[0,0,0]]){
    const analytic=calculate(q);
    for(let j=0;j<3;j++){
      const h=1e-6,plus=[...q],minus=[...q];
      plus[j]+=h;minus[j]-=h;
      const p=calculate(plus),m=calculate(minus);
      close(analytic.jacobian[0][j],(p.x-m.x)/(2*h),'Jx finite difference',1e-7);
      close(analytic.jacobian[1][j],(p.y-m.y)/(2*h),'Jy finite difference',1e-7);
    }
  }
  for(const bad of [[0,0],[0,NaN,0],[]]){
    let threw=false;
    try{calculate(bad)}catch(error){threw=error instanceof RangeError}
    if(!threw)throw Error('Expected finite three-joint inputs');
  }
  console.log('PASS independent three-link position/Jacobian/velocity checks; source length units only.');
  console.log(JSON.stringify({straight,vertical,bent},null,2));
}
module.exports={calculate,lengths,verify};
if(require.main===module)verify();
