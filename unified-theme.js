/* Shared theme switch for pages without a legacy local switch.
   Uses the same kailani-theme preference as research and workbench. */
(function () {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.cosmic-shared-toggle');
  // Navigation behavior is also shared by the Workbench, which has its own theme button.
  let choice = null;
  try { choice = localStorage.getItem('kailani-theme'); } catch (_) {}
  if (choice !== 'light' && choice !== 'dark') choice = 'light';
  root.dataset.theme = choice;
  function reflect() {
    const dark = root.dataset.theme === 'dark';
    toggles.forEach(function (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.textContent = dark ? '☀ Light mode' : '☾ Dark mode';
    });
  }
  toggles.forEach(function (button) {
    button.addEventListener('click', function () {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('kailani-theme', next); } catch (_) {}
      reflect();
    });
  });
  // Close the mobile disclosure after following a link, including in-page anchors.
  // Escape closes it without navigation and returns focus to its control.
  document.querySelectorAll('.cosmic-mobile-menu').forEach(function (menu) {
    const summary = menu.querySelector('summary');
    menu.querySelectorAll('.cosmic-mobile-links a').forEach(function (link) {
      link.addEventListener('click', function () { menu.open = false; });
    });
    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        if (summary) summary.focus();
        event.preventDefault();
      }
    });
  });
  reflect();
}());