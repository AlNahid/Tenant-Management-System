// App shell: dark header (logo + settings icon), light content sheet, bottom nav.
import { state } from '../models/store.js';
import { icon } from './ui.js';
import { OFFLINE_MSG } from '../config.js';

const TABS = [
  ['dash', 'Home', 'home'],
  ['bld', 'Buildings', 'building'],
  ['ten', 'Tenants', 'users'],
  ['gen', 'Generate', 'receipt'],
  ['pay', 'Payments', 'wallet'],
];

// page: { eyebrow, title, big, body }
export const layout = (page) => `
  <div class="top">
    <div class="bar">
      <div class="brand"><span class="logo">${icon('building', 20)}</span>Landlord</div>
      <div class="barright">
        <span class="chip ${state.stale ? 'stale' : 'ok'}">${state.stale ? 'Cached' : 'Synced'}</span>
        <button class="iconbtn" data-act="tab" data-id="set" aria-label="Settings">${icon('gear')}</button>
      </div>
    </div>
    ${state.online ? '' : `<div class="offbanner">${OFFLINE_MSG}</div>`}
    <p class="eyebrow">${page.eyebrow || ''}</p>
    ${page.big ? `<div class="big">${page.big}</div><h1 class="sub">${page.title}</h1>` : `<h1>${page.title}</h1>`}
  </div>
  <main class="sheet">${page.body}</main>
  <nav class="tabs" aria-label="Main">
    ${TABS.map(([key, label, ic]) => `<button class="${key === state.view ? 'on' : ''}" data-act="tab" data-id="${key}" ${key === state.view ? 'aria-current="page"' : ''}>${icon(ic, 24)}<span>${label}</span></button>`).join('')}
  </nav>`;

export const loginView = () => `
  <form id="lf" class="login">
    <span class="logo big-logo">${icon('building', 30)}</span>
    <h1>Landlord</h1>
    <p class="mut">Sign in to manage your buildings.</p>
    <input id="pw" type="password" placeholder="Password" autocomplete="current-password" required>
    <button class="btn primary wide">Sign in</button>
  </form>`;
