/* Progressive enhancement: expose print actions only after the handler is bound.
   Browser print CSS already handles Save as PDF in light and dark modes. */
(function(){
  'use strict';
  document.querySelectorAll('button[data-print-page]').forEach(function(button){
    button.addEventListener('click',function(){window.print()});
    button.hidden=false;
  });
}());
