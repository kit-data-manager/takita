import { initializeNavBar } from './navigation';

// Wait for CETEIcean to emit the custom "ceteiceanload" event,
// because the nav bar relies on the TEI-like document being present.
window.addEventListener('ceteiceanhasloaded', (_ev) => {
  const $navbar = document.getElementById('textNavBar');
  initializeNavBar($navbar);
});
