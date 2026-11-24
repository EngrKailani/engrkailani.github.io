/* Filtering and URL state for the engineering project directory. */
(()=>{
'use strict';
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
  function saveDirectoryToUrl(method='replace'){
    if(!cards.length)return;
    const url=new URL(location.href);
    if(category==='all')url.searchParams.delete('area');
    else url.searchParams.set('area',category);
    const query=search?.value.trim()||'';
    if(query)url.searchParams.set('q',query);
    else url.searchParams.delete('q');
    const next=url.pathname+url.search+url.hash;
    const current=location.pathname+location.search+location.hash;
    if(next!==current)history[method==='push'?'pushState':'replaceState'](history.state,'',next);
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
    const changed=category!=='all'||!!search?.value.trim();
    if(search)search.value='';
    category='all';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.galleryFilter==='all')));
    updateDirectory();
    saveDirectoryToUrl(changed?'push':'replace');
    search?.focus();
  }
  search?.addEventListener('input',()=>{updateDirectory();saveDirectoryToUrl()});
  search?.addEventListener('keydown',event=>{
    if(event.key==='Escape' && search.value){
      event.preventDefault();
      search.value='';
      updateDirectory();
      saveDirectoryToUrl('push');
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='/' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !search)return;
    const focused=document.activeElement;
    if(focused && (focused.matches('input, textarea, select') || focused.isContentEditable))return;
    event.preventDefault();
    search.focus();
  });
  buttons.forEach(button=>button.addEventListener('click',()=>{
    if(category===button.dataset.galleryFilter)return;
    category=button.dataset.galleryFilter;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    updateDirectory();
    saveDirectoryToUrl('push');
  }));
  document.getElementById('directory-reset')?.addEventListener('click',resetDirectory);
  clearFilters?.addEventListener('click',resetDirectory);
  window.addEventListener('popstate',()=>{
    if(!cards.length)return;
    restoreDirectoryFromUrl();
    updateDirectory();
  });
  if(cards.length){restoreDirectoryFromUrl();updateDirectory()}
})();
