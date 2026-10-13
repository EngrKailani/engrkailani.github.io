/* Generic illustrative robot-motion model shared by the 2D and 3D demos.
 * Geometry is normalized and intentionally arbitrary. It does not represent
 * project hardware, dimensions, joint limits, or validated motion plans.
 */
(() => {
  'use strict';
  const workspace=1;
  const mount=.08;
  const segmentA=.30;
  const segmentB=.27;
  const tool=.11;
  const presets=Object.freeze({
    neutral: Object.freeze({yaw:20,jointA:15,jointB:70,jointC:-35,twist:0,grip:40}),
    reach: Object.freeze({yaw:45,jointA:35,jointB:35,jointC:-20,twist:15,grip:25}),
    fold: Object.freeze({yaw:-30,jointA:10,jointB:105,jointC:-45,twist:-20,grip:65}),
    rest: Object.freeze({yaw:0,jointA:25,jointB:80,jointC:-30,twist:0,grip:35})
  });
  const radians=d=>d*Math.PI/180;
  function next(start,pitch,length,yaw){
    const p=radians(pitch),a=radians(yaw);
    return {
      x:start.x+length*Math.sin(p)*Math.cos(a),
      y:start.y+length*Math.sin(p)*Math.sin(a),
      z:start.z-length*Math.cos(p)
    };
  }
  function joints(pose){
    const anchor={x:0,y:0,z:workspace};
    const root={x:0,y:0,z:workspace-mount};
    const joint1=next(root,pose.jointA,segmentA,pose.yaw);
    const joint2=next(joint1,pose.jointA+pose.jointB,segmentB,pose.yaw);
    const tip=next(joint2,pose.jointA+pose.jointB+pose.jointC,tool,pose.yaw);
    return [anchor,root,joint1,joint2,tip];
  }
  function inside(point){
    const tolerance=.0001,half=workspace/2;
    return Math.abs(point.x)<=half+tolerance &&
      Math.abs(point.y)<=half+tolerance &&
      point.z>=-tolerance && point.z<=workspace+tolerance;
  }
  window.robotMotionModel=Object.freeze({
    workspace,mount,segmentA,segmentB,tool,presets,radians,joints,inside
  });
})();