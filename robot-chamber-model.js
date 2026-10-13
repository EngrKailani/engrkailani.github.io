/* Shared illustrative ceiling-mounted arm geometry for the 2D and 3D lab.
 * Inches, with floor z=0 and ceiling z=36. Centerlines only, not hardware.
 */
(() => {
  'use strict';
  const chamber=36, mount=3, link1=18.5, link2=18.5, tool=8.5;
  const presets=Object.freeze({
    home: Object.freeze({yaw:45,shoulder:0,elbow:85,wrist:-60,twist:0,grip:35}),
    floor: Object.freeze({yaw:45,shoulder:0,elbow:72,wrist:-60,twist:0,grip:10}),
    inspect: Object.freeze({yaw:-45,shoulder:-10,elbow:110,wrist:-60,twist:20,grip:65}),
    park: Object.freeze({yaw:45,shoulder:0,elbow:110,wrist:-60,twist:0,grip:30})
  });
  const radians=d=>d*Math.PI/180;
  function next(start,pitch,length,yaw){
    const p=radians(pitch),a=radians(yaw);
    return {x:start.x+length*Math.sin(p)*Math.cos(a),
      y:start.y+length*Math.sin(p)*Math.sin(a),
      z:start.z-length*Math.cos(p)};
  }
  function joints(pose){
    const ceiling={x:0,y:0,z:chamber};
    const shoulder={x:0,y:0,z:chamber-mount};
    const elbow=next(shoulder,pose.shoulder,link1,pose.yaw);
    const wrist=next(elbow,pose.shoulder+pose.elbow,link2,pose.yaw);
    const tip=next(wrist,pose.shoulder+pose.elbow+pose.wrist,tool,pose.yaw);
    return [ceiling,shoulder,elbow,wrist,tip];
  }
  function inside(point){
    const tolerance=.0001,half=chamber/2;
    return Math.abs(point.x)<=half+tolerance &&
      Math.abs(point.y)<=half+tolerance &&
      point.z>=-tolerance && point.z<=chamber+tolerance;
  }
  window.robotChamberModel=Object.freeze({
    chamber,mount,link1,link2,tool,presets,radians,joints,inside
  });
})();
