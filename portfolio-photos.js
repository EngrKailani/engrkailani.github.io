/* Optional NASA and honors photography.
 * Image files are uploaded separately to assets/. Hide missing photos,
 * and reveal each card only after its actual file loads successfully. */
(() => {
  'use strict';
  const images = [...document.querySelectorAll('img[data-portfolio-photo-src]')];
  const gallery = document.getElementById('portfolio-photo-gallery');
  if (!images.length) return;

  let galleryLoaded = 0;
  images.forEach(image => {
    const figure = image.closest('figure');
    const filename = image.dataset.portfolioPhotoSrc;
    if (!figure || !filename) return;

    const preloader = new Image();
    preloader.onload = () => {
      // Only show real images. Browsers may load this a second time from cache.
      image.src = filename;
      figure.hidden = false;
      if (gallery && gallery.contains(figure)) {
        galleryLoaded += 1;
        gallery.dataset.photoCount = String(galleryLoaded);
        gallery.hidden = false;
      }
    };
    preloader.onerror = () => {
      // A missing asset is expected until the photo is uploaded.
      figure.hidden = true;
    };
    preloader.src = filename;
  });
})();
