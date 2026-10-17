import { state } from './models/store.js';
import * as cache from './models/cache.js';
import { views } from './views/index.js';
import { layout, loginView } from './views/layout.js';
import { closeModal, $ } from './views/ui.js';
import { actions } from './controllers/index.js';
import { sync, login, signOut } from './controllers/sessionController.js';

function render() {
  document.body.classList.toggle('off', !state.online);
  $('#app').innerHTML = state.token ? layout(views[state.view].view()) : loginView();
}

// Events
document.addEventListener('app:render', render);
document.addEventListener('app:signout', signOut);
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el) actions[el.dataset.act]?.(el.dataset);
});
document.addEventListener('change', (e) => {
  const key = e.target.dataset.f;
  if (!key) return;
  state.f[key] = e.target.value;
  if (key === 'building') state.f.unit = '';
  render();
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'q') { state.q = e.target.value; $('#list').innerHTML = views[state.view].list(); }
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'lf') { e.preventDefault(); login($('#pw').value); }
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
addEventListener('online', () => { state.online = true; sync(); });
addEventListener('offline', () => { state.online = false; render(); });

// Boot: show cached data immediately, then refresh if online
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
(async () => {
  const cached = await cache.get('data');
  if (cached) { state.data = cached.data; state.syncedAt = cached.at; }
  render();
  if (state.token) sync();
})();
