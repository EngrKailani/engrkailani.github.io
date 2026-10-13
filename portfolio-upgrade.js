/* Progressive enhancements: color mode, project discovery and menu polish.
 * Functional content remains accessible without this script. */
(() => {
  'use strict';
  const root=document.documentElement;
  const toggle=document.getElementById('theme-toggle');
  const dark=window.matchMedia('(prefers-color-scheme: dark)');
  const stored=()=>{try{return localStorage.getItem('kailani-theme')}catch{return null}};
  function setTheme(theme,save=false){
    root.dataset.theme=theme==='dark'?'dark':'light';
    if(toggle){
      const on=root.dataset.theme==='dark';
      toggle.textContent=on?'☀ Light mode':'☾ Dark mode';
      toggle.setAttribute('aria-pressed',String(on));
      toggle.setAttribute('aria-label',on?'Switch to light mode':'Switch to dark mode');
    }
    if(save){try{localStorage.setItem('kailani-theme',root.dataset.theme)}catch{/* storage optional */}}
  }
  setTheme(stored()||(dark.matches?'dark':'light'));
  toggle?.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark',true));
  dark.addEventListener?.('change',event=>{if(!stored())setTheme(event.matches?'dark':'light')});

  const search=document.getElementById('directory-search');
  const cards=[...document.querySelectorAll('[data-gallery-category]')];
  const groups=[...document.querySelectorAll('[data-gallery-group]')];
  const buttons=[...document.querySelectorAll('[data-gallery-filter]')];
  const count=document.getElementById('directory-count');
  const empty=document.getElementById('directory-empty');
  const clearFilters=document.getElementById('directory-clear');
  const validCategories=new Set(buttons.map(button=>button.dataset.galleryFilter));
  let category='all';
  // A filtered project directory has its own shareable address.
  function restoreDirectoryFromUrl(){
    if(!cards.length)return;
    const query=new URLSearchParams(location.search);
    const requested=query.get('area')||'all';
    category=validCategories.has(requested)?requested:'all';
    if(search)search.value=query.get('q')||'';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.galleryFilter===category)));
  }
  function saveDirectoryToUrl(){
    if(!cards.length)return;
    const url=new URL(location.href);
    if(category==='all')url.searchParams.delete('area');
    else url.searchParams.set('area',category);
    const query=search?.value.trim()||'';
    if(query)url.searchParams.set('q',query);
    else url.searchParams.delete('q');
    history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }
  function updateDirectory(){
    const q=(search?.value||'').trim().toLowerCase();
    let visible=0;
    cards.forEach(card=>{
      const matchType=category==='all'||(card.dataset.galleryCategory||'').split(' ').includes(category);
      const matchQuery=!q||card.textContent.toLowerCase().includes(q);
      card.hidden=!(matchType&&matchQuery);
      if(!card.hidden)visible++;
    });
    groups.forEach(group=>{
      const hasResults=[...group.querySelectorAll('[data-gallery-category]')].some(card=>!card.hidden);
      group.hidden=!hasResults;
    });
    if(count)count.textContent='Showing '+visible+' of '+cards.length+' engineering projects';
    if(empty)empty.hidden=visible!==0;
    if(clearFilters)clearFilters.hidden=category==='all'&&!q;
  }
  function resetDirectory(){
    if(search)search.value='';
    category='all';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.galleryFilter==='all')));
    updateDirectory();
    saveDirectoryToUrl();
    search?.focus();
  }
  search?.addEventListener('input',()=>{updateDirectory();saveDirectoryToUrl()});
  buttons.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.galleryFilter;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    updateDirectory();
    saveDirectoryToUrl();
  }));
  document.getElementById('directory-reset')?.addEventListener('click',resetDirectory);
  clearFilters?.addEventListener('click',resetDirectory);
  window.addEventListener('popstate',()=>{
    if(!cards.length)return;
    restoreDirectoryFromUrl();
    updateDirectory();
  });
  if(cards.length){restoreDirectoryFromUrl();updateDirectory()}

  const menu=document.getElementById('menu-toggle');
  const links=document.getElementById('nav-links');
  function closeMenu(){
    if(!menu||!links)return;
    links.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open menu');
  }
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&links?.classList.contains('open')){
      closeMenu();menu.focus();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(links?.classList.contains('open')&&!event.target.closest('.site-header'))closeMenu();
  });
})();
/* Keep the original 2D learning exercise available alongside the new 3D viewer. */
(() => {
  'use strict';
  const consoleEl=document.querySelector('.robot-console');
  const layout=document.querySelector('.robot-layout');
  const controls=document.getElementById('robot-2d-controls');
  const controls3d=document.getElementById('robot-3d-controls');
  const viewport2d=document.getElementById('robot-2d-viewport');
  const viewport3d=document.getElementById('robot-3d-viewport');
  const description=document.getElementById('robot-view-description');
  const buttons=[...document.querySelectorAll('[data-robot-view]')];
  if(!consoleEl||!layout||!buttons.length)return;
  function show(mode){
    const chosen=mode==='2d'?'2d':'3d';
    consoleEl.dataset.view=chosen;
    layout.dataset.robotMode=chosen;
    if(controls)controls.hidden=chosen!=='2d';
    if(controls3d)controls3d.hidden=chosen!=='3d';
    viewport2d?.setAttribute('aria-hidden',String(chosen!=='2d'));
    viewport3d?.setAttribute('aria-hidden',String(chosen!=='3d'));
    if(description)description.textContent=chosen==='2d'
      ? '2D side projection of the same generic robot-motion sketch. The generic joints stay synchronized with 3D; base rotation and tool orientation are retained but not shown.'
      : '3D perspective of the same generic robot-motion sketch. Geometry is normalized and intentionally arbitrary. This is an educational centerline visualization, not a validated motion plan or representation of project hardware.';
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.robotView===chosen)));
    document.dispatchEvent(new CustomEvent('robot:view-change',{detail:{mode:chosen}}));
  }
  buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.robotView)));
  document.querySelectorAll('.pose-button,[data-joint-control],#animate-button').forEach(el=>{
    el.addEventListener(el.matches('input')?'input':'click',()=>show('2d'));
  });
  document.querySelectorAll('[data-3d-pose]').forEach(el=>el.addEventListener('click',()=>show('3d')));
  show('3d');
})();
