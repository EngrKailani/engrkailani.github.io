/* Shared theme switch for pages without a legacy local switch.
   Uses the same kailani-theme preference as research and workbench. */
(function () {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.cosmic-shared-toggle');
  if (!toggles.length) return;
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
  reflect();
}());