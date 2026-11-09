/* Load feedback for real case-study media. Never delay an already cached image. */
(() => {
  'use strict';
  for (const image of document.querySelectorAll('.selected-project-preview img')) {
    const preview = image.closest('.selected-project-preview');
    if (!preview) continue;
    const loaded = () => {
      preview.classList.remove('media-loading');
      preview.classList.add('media-ready');
    };
    const failed = () => {
      preview.classList.remove('media-loading');
      preview.classList.add('media-error');
    };
    if (image.complete) {
      if (image.naturalWidth > 0) loaded();
      else failed();
    } else {
      preview.classList.add('media-loading');
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failed, { once: true });
    }
  }
})();
