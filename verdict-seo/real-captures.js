/* Show the original app screenshot, online or in the complete offline edition. */
(function () {
  'use strict';
  const figures = [...document.querySelectorAll('figure.real-capture')];
  let dialog, zoomImage, opener, sizeButton, title, surface, caption;
  function source(figure) {
    const image = figure.querySelector('img');
    return figure.dataset.captureOriginal || (image && (image.currentSrc || image.src));
  }
  function sync(figure) {
    const url = source(figure);
    if (!url) return;
    figure.querySelectorAll('[data-capture-zoom]').forEach(link => {
      link.href = url;
      link.removeAttribute('aria-disabled');
    });
  }
  function setNative(native) {
    dialog.classList.toggle('is-native', native);
    sizeButton.setAttribute('aria-pressed', String(native));
    sizeButton.textContent = native ? 'Adapter à l’écran' : 'Taille réelle';
  }
  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'real-capture-dialog';
    dialog.id = 'realCaptureDialog';
    dialog.setAttribute('aria-labelledby', 'realCaptureTitle');
    const header = document.createElement('header');
    title = document.createElement('h2');
    title.id = 'realCaptureTitle';
    const actions = document.createElement('div');
    sizeButton = document.createElement('button');
    sizeButton.type = 'button';
    sizeButton.onclick = () => {
      setNative(!dialog.classList.contains('is-native'));
      surface.focus({ preventScroll: true });
    };
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Fermer ×';
    close.setAttribute('aria-label', 'Fermer la capture agrandie');
    close.onclick = () => dialog.close();
    actions.append(sizeButton, close);
    header.append(title, actions);
    surface = document.createElement('div');
    surface.className = 'real-capture-zoom-surface';
    surface.tabIndex = 0;
    surface.setAttribute('role', 'region');
    surface.setAttribute('aria-label', 'Capture originale. En taille réelle, utilisez les flèches pour parcourir l’image.');
    zoomImage = document.createElement('img');
    surface.append(zoomImage);
    caption = document.createElement('p');
    caption.className = 'real-capture-dialog-caption';
    dialog.append(header, surface, caption);
    dialog.addEventListener('close', () => {
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    document.body.append(dialog);
  }
  figures.forEach(figure => {
    const image = figure.querySelector('img');
    if (!image) return;
    image.addEventListener('load', () => sync(figure));
    if (image.complete) sync(figure);
    figure.querySelectorAll('[data-capture-zoom]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof HTMLDialogElement === 'undefined') return;
        event.preventDefault();
        ensureDialog();
        opener = link;
        title.textContent = figure.dataset.captureTitle || figure.querySelector('figcaption strong')?.textContent || 'L’application Verdict, en vrai';
        zoomImage.src = source(figure);
        zoomImage.alt = image.alt;
        caption.textContent = figure.dataset.captureCaption || 'Capture réelle de l’application · données de démonstration · image entière.';
        setNative(false);
        surface.scrollTop = surface.scrollLeft = 0;
        dialog.showModal();
        surface.focus({ preventScroll: true });
      });
    });
  });
  window.addEventListener('resize', () => figures.forEach(sync), { passive: true });
})();
