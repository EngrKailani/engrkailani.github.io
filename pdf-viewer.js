/* Minimal PDF-only page behavior. Does not alter document bytes. */
(function(){
  const host=document.querySelector('[data-pdf-url]');
  if(!host) return;
  const url=host.getAttribute('data-pdf-url');
  const status=host.querySelector('[data-pdf-status]');
  const frame=host.querySelector('[data-pdf-frame]');
  const links=[...host.querySelectorAll('[data-pdf-action]')];
  const setStatus=(message)=>{status.textContent=message;};
  function available(){
    links.forEach(a=>a.hidden=false);
    if(window.matchMedia('(min-width: 701px)').matches){
      frame.src=url+'#view=FitH';
      frame.hidden=false;
    }
    setStatus('PDF available. On mobile, use “Open PDF” for a larger view.');
  }
  function missing(){
    links.forEach(a=>a.hidden=true);
    frame.hidden=true;
    setStatus('The PDF has not yet been uploaded to the website. It must be added to the assets folder before it can be viewed or downloaded here.');
  }
  fetch(url,{method:'HEAD',cache:'no-store'}).then(response=>{
    const type=response.headers.get('content-type')||'';
    if(response.ok && type.toLowerCase().includes('pdf')) available();
    else missing();
  }).catch(()=>{
    links.forEach(a=>a.hidden=false);
    frame.hidden=true;
    setStatus('The PDF could not be verified. Try opening it directly.');
  });
})();