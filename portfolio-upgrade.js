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
  const buttons=[...document.querySelectorAll('[data-gallery-filter]')];
  const count=document.getElementById('directory-count');
  const empty=document.getElementById('directory-empty');
  let category='all';
  function updateDirectory(){
    const q=(search?.value||'').trim().toLowerCase();
    let visible=0;
    cards.forEach(card=>{
      const matchType=category==='all'||(card.dataset.galleryCategory||'').split(' ').includes(category);
      const matchQuery=!q||card.textContent.toLowerCase().includes(q);
      card.hidden=!(matchType&&matchQuery);
      if(!card.hidden)visible++;
    });
    if(count)count.textContent='Showing '+visible+' of '+cards.length+' engineering projects';
    if(empty)empty.hidden=visible!==0;
  }
  search?.addEventListener('input',updateDirectory);
  buttons.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.galleryFilter;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    updateDirectory();
  }));
  document.getElementById('directory-reset')?.addEventListener('click',()=>{
    if(search)search.value='';
    category='all';
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryFilter==='all')));
    updateDirectory();search?.focus();
  });
  if(cards.length)updateDirectory();

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