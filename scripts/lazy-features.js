/* Progressive loader for interactive sections below the initial viewport.
   Start as a section approaches; load immediately on deep-link navigation. */
(() => {
  'use strict';
  const assets=[
    // Bookshelf is essential and now loads as a deferred script on the homepage.
    // Never initialize the same reader twice via this progressive loader.
    {id:'explorer',selector:'#case-explorer',url:'case-explorer.js?v=20261012-v2'},
    {id:'robot',selector:'#robot-lab',url:'robot-3d.js?v=20261012-dock1'}
  ];
  function load(item){
    if(item.started)return;
    item.started=true;
    const script=document.createElement('script');
    script.src=item.url;
    script.async=true;
    script.onerror=()=>console.error('Could not load interactive feature:',item.id);
    document.body.appendChild(script);
  }
  if(!('IntersectionObserver' in window)){
    assets.forEach(load);
    return;
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const item=assets.find(x=>x.element===entry.target);
      if(item){load(item);observer.unobserve(entry.target)}
    }
  },{rootMargin:'1100px 0px'});
  for(const item of assets){
    item.element=document.querySelector(item.selector);
    if(item.element)observer.observe(item.element);
  }
  function loadTarget(){
    const hash=location.hash;
    if(!hash)return;
    const target=document.getElementById(decodeURIComponent(hash.slice(1)));
    if(!target)return;
    for(const item of assets){
      if(item.element && (item.element===target||item.element.contains(target)))load(item);
    }
  }
  addEventListener('hashchange',loadTarget);
  loadTarget();
})();
