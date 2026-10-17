import { state } from '../models/store.js';
import { esc } from './ui.js';

export const set = {
  view() {
    return {
      eyebrow: 'Preferences',
      title: 'Settings',
      body: `
        <section class="card">
          <h3>Synchronization</h3>
          <p class="mut">${state.stale ? 'Showing cached data' : 'Synchronized'} · ${state.syncedAt ? new Date(state.syncedAt).toLocaleString() : 'never'}</p>
          ${state.error ? `<p class="errtext">${esc(state.error)}</p>` : ''}
          <div class="btnrow">
            <button class="btn primary" data-act="sync">Sync now</button>
            <button class="btn ghost" data-w data-act="setup">Prepare spreadsheet</button>
          </div>
        </section>
        <section class="card">
          <h3>Account</h3>
          <p class="mut">Signing out also clears the data cached on this device.</p>
          <div class="btnrow"><button class="btn danger" data-act="out">Sign out and clear cache</button></div>
        </section>`,
    };
  },
};
