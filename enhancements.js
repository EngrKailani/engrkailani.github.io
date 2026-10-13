
'use strict';

// All interactions are progressively enhanced: core content works without JavaScript.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Calm, one-time entrance transitions. Never conceal content without Observer support.
  if ('IntersectionObserver' in window && !reduce.matches) {
    const reveal = [...document.querySelectorAll(
      '.section-heading, .feature-project, .project-card, .repo-card, .robot-console, .timeline-item, .education-panel, .interest-layout, .resume-layout'
    )];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    for (const item of reveal) {
      if (!item.hidden) {
        item.classList.add('motion-reveal');
        observer.observe(item);
      }
    }
    document.documentElement.classList.add('motion-ready');
    reduce.addEventListener?.('change', e => {
      if (e.matches) {
        document.documentElement.classList.remove('motion-ready');
        observer.disconnect();
      }
    });
  }

  // Joint controls supplement the existing four presets.
  // Units are illustrative angles and are NOT hardware limits.
  const sliders = [...document.querySelectorAll('[data-joint-control]')];
  const reset = document.getElementById('reset-robot');
  const updateSliders = values => {
    sliders.forEach((slider, i) => {
      slider.value = String(Math.round(values[i]));
      const min = Number(slider.min), max = Number(slider.max);
      const progress = max > min ? 100 * (Number(slider.value) - min) / (max - min) : 0;
      slider.style.setProperty('--range-progress', Math.max(0, Math.min(100, progress)).toFixed(2) + '%');
      const output = document.getElementById(slider.getAttribute('aria-describedby'));
      if (output) output.textContent = slider.value + '°';
    });
  };
  function applyManual() {
    if (typeof cancelSequence === 'function') cancelSequence();
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    angles = sliders.map(slider => Number(slider.value));
    renderArm(angles);
    poseButtons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    if (arm.status) arm.status.textContent = 'Manual joint position';
    const stop = document.getElementById('stop-button');
    if (stop) stop.hidden = true;
    updateSliders(angles);
  }
  sliders.forEach(slider => slider.addEventListener('input', applyManual));
  reset?.addEventListener('click', () => {
    choosePose('neutral');
    updateSliders(poses.neutral.angles);
  });
  poseButtons.forEach(button => button.addEventListener('click', () => {
    const pose = poses[button.dataset.pose];
    if (pose) updateSliders(pose.angles);
  }));
  if (arm.status && 'MutationObserver' in window) {
    const statusObserver = new MutationObserver(() => {
      const pose = Object.values(poses).find(p => p.label === arm.status.textContent);
      if (pose) updateSliders(pose.angles);
    });
    statusObserver.observe(arm.status, { childList: true, characterData: true, subtree: true });
  }
  updateSliders(poses.neutral.angles);

  // Native <details> is keyboard-accessible, fully readable without JS.
  // Highlight just the active role while preserving the complete timeline.
  document.querySelectorAll('.experience-more').forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('.experience-more').forEach(other => {
        if (other !== details) other.open = false;
      });
    });
  });

  // The small book shelf supports standard tab keyboard navigation.
  const shelfTabs = [...document.querySelectorAll('[data-book-tab]')];
  const shelfPanels = [...document.querySelectorAll('[data-book-panel]')];
  const selectTab = (tab, moveFocus = false) => {
    shelfTabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    shelfPanels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    if (moveFocus) tab.focus();
  };
  shelfTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = shelfTabs[(index + 1) % shelfTabs.length];
      else if (event.key === 'ArrowLeft') next = shelfTabs[(index - 1 + shelfTabs.length) % shelfTabs.length];
      else if (event.key === 'Home') next = shelfTabs[0];
      else if (event.key === 'End') next = shelfTabs[shelfTabs.length - 1];
      else return;
      event.preventDefault();
      selectTab(next, true);
    });
  });
  if (shelfTabs.length) selectTab(shelfTabs[0]);
})();
