/* Preserve legacy deep links into the optional portfolio, including on reload. */
(() => {
  'use strict';
  function reveal(hash, scroll=false) {
    if (!hash || hash==='#') return;
    let id;
    try { id=decodeURIComponent(hash.slice(1)); } catch { return; }
    const target=document.getElementById(id);
    if (!target) return;
    let parent=target.parentElement;
    while (parent) {
      if (parent.matches('details')) parent.open=true;
      parent=parent.parentElement;
    }
    if (scroll) requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if (link) reveal(link.hash);
  });
  addEventListener('hashchange',()=>reveal(location.hash,true));
  reveal(location.hash,true);
})();
