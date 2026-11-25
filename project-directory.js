/* Filtering and URL state for the engineering project directory. */
(()=>{
'use strict';
  const search=document.getElementById('directory-search');
  const cards=[...document.querySelectorAll('[data-gallery-category]')];
  const briefs=[...document.querySelectorAll('[data-brief-category]')];
  const briefSection=document.getElementById('additional-project-briefs');
  const briefCount=document.getElementById('directory-brief-count');
  const groups=[...document.querySelectorAll('[data-gallery-group]')];
  const buttons=[...document.querySelectorAll('[data-gallery-filter]')];
  const count=document.getElementById('directory-count');
  const empty=document.getElementById('directory-empty');
  const clearFilters=document.getElementById('directory-clear');
  const copyLink=document.getElementById('directory-copy-link');
  const shareStatus=document.getElementById('directory-share-status');
  const normalize=term=>(term||'').toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+#]+/g,' ').trim();
  // Include visible case-study summaries and individually verified tool/method terms.
  // Cache each index once rather than walking the full card DOM on every keystroke.
  const searchIndex=new Map(cards.map(card=>[card,
    normalize(card.textContent+' '+(card.dataset.galleryKeywords||''))]));
  const briefSearchIndex=new Map(briefs.map(brief=>[brief,
    normalize(brief.textContent+' '+(brief.dataset.briefKeywords||''))]));
  const validCategories=new Set(buttons.map(button=>button.dataset.galleryFilter));
  const filterLabels=new Map(buttons.map(button=>[button,button.textContent.trim()]));
  let category='all';
  let copyAttempt=0;
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
    // Match all query words in any order. Punctuation and accented letters
    // do not prevent discovery of verified technical terms.
    const terms=normalize(search?.value||'').split(/\s+/).filter(Boolean);
    // Counts reflect search matches across every category, even when one is selected.
    const available=new Map([...validCategories].map(name=>[name,0]));
    function tallyMatch(categories){
      available.set('all',available.get('all')+1);
      for(const name of categories.split(/\s+/).filter(Boolean)){
        if(name!=='all' && available.has(name))
          available.set(name,available.get(name)+1);
      }
    }
    let visible=0;
    let visibleBriefs=0;
    cards.forEach(card=>{
      const matchType=category==='all'||(card.dataset.galleryCategory||'').split(' ').includes(category);
      const index=searchIndex.get(card)||'';
      const matchQuery=terms.every(term=>index.includes(term));
      if(matchQuery)tallyMatch(card.dataset.galleryCategory||'');
      card.hidden=!(matchType&&matchQuery);
      if(!card.hidden)visible++;
    });
    groups.forEach(group=>{
      const hasResults=[...group.querySelectorAll('[data-gallery-category]')].some(card=>!card.hidden);
      group.hidden=!hasResults;
    });
    briefs.forEach(brief=>{
      const matchType=category==='all'||(brief.dataset.briefCategory||'').split(' ').includes(category);
      const index=briefSearchIndex.get(brief)||'';
      const matchQuery=terms.every(term=>index.includes(term));
      if(matchQuery)tallyMatch(brief.dataset.briefCategory||'');
      brief.hidden=!(matchType&&matchQuery);
      if(!brief.hidden)visibleBriefs++;
    });
    buttons.forEach(button=>{
      const total=available.get(button.dataset.galleryFilter)||0;
      let badge=button.querySelector('.directory-filter-count');
      if(!badge){
        badge=document.createElement('span');
        badge.className='directory-filter-count';
        badge.setAttribute('aria-hidden','true');
        button.append(badge);
      }
      badge.textContent=String(total);
      const label=filterLabels.get(button);
      button.setAttribute('aria-label',label+': '+total+' matching '+
        (total===1?'project':'projects'));
    });
    if(briefSection)briefSection.hidden=visibleBriefs===0;
    if(briefCount)briefCount.textContent='Showing '+visibleBriefs+' of '+briefs.length+' additional briefs';
    if(count)count.textContent='Showing '+visible+' of '+cards.length+' case studies and '+
      visibleBriefs+' of '+briefs.length+' additional briefs';
    if(empty)empty.hidden=visible+visibleBriefs!==0;
    if(clearFilters)clearFilters.hidden=category==='all'&&!terms.length;
    // A previous asynchronous clipboard write must not overwrite the latest view state.
    copyAttempt++;
    if(copyLink){copyLink.textContent='Copy view link';copyLink.disabled=false;}
    if(shareStatus)shareStatus.textContent='';
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
  copyLink?.addEventListener('click',async()=>{
    const attempt=++copyAttempt;
    const requestedUrl=location.href;
    copyLink.disabled=true;
    copyLink.textContent='Copying link…';
    if(shareStatus)shareStatus.textContent='';
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(requestedUrl);
      if(attempt!==copyAttempt)return;
      copyLink.textContent='Link copied';
      if(shareStatus)shareStatus.textContent='Copied a link to this project view.';
    }catch(_){
      if(attempt!==copyAttempt)return;
      copyLink.textContent='Copy view link';
      if(shareStatus)shareStatus.textContent=
        'Copying is unavailable here. Share this view using the browser address bar.';
    }finally{
      if(attempt===copyAttempt)copyLink.disabled=false;
    }
  });
  window.addEventListener('popstate',()=>{
    if(!cards.length)return;
    restoreDirectoryFromUrl();
    updateDirectory();
  });
  if(cards.length){restoreDirectoryFromUrl();updateDirectory()}
})();
