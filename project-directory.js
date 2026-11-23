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
})();
