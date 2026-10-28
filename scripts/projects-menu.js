/* Native <details> keeps the project list keyboard-accessible without JS.
   Close the panel on Escape, outside clicks, and mobile-menu navigation. */
(() => {
  'use strict';
  const menu=document.getElementById('projects-nav-menu');
  if(!menu)return;
  const heading=menu.querySelector('summary');
  menu.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.open){
      event.preventDefault();
      menu.open=false;
      heading?.focus();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(menu.open&&!menu.contains(event.target))menu.open=false;
  });
  document.getElementById('menu-toggle')?.addEventListener('click',()=>{
    menu.open=false;
  });
  menu.querySelectorAll('a[href]').forEach(link=>{
    link.addEventListener('click',()=>{menu.open=false});
  });
})();
