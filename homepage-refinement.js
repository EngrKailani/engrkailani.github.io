/* Preserve legacy deep links into the optional portfolio, including on reload. */
(() => {
  'use strict';
  function reveal(hash, scroll=false) {
    if (!hash || hash==='#') return;
    let id;
    try { id=decodeURIComponent(hash.slice(1)); } catch { return; }
    const target=document.getElementById(id);
    if (!target) return;
    // Legacy links to the archive itself should expand its contents.
    if (target.matches('details')) target.open=true;
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
  const archive=document.getElementById('explore');
  archive?.addEventListener('toggle',()=>{
    if (!archive.open) return;
    // The two robot views and the repository orbit depend on container dimensions.
    // Recalculate once the disclosure is laid out, without auto-playing demos.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      dispatchEvent(new Event('resize'));
      // A deep-link target might have moved after the panel became measurable.
      if (location.hash && location.hash !== '#explore') reveal(location.hash,true);
    }));
  });
  addEventListener('hashchange',()=>reveal(location.hash,true));
  reveal(location.hash,true);
})();
