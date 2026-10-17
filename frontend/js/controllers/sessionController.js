import { state, render } from '../models/store.js';
import * as api from '../models/api.js';
import * as cache from '../models/cache.js';
import { toast } from '../views/ui.js';
import { OFFLINE_MSG } from '../config.js';

// Pull the latest data from the sheet and cache it for offline viewing
export async function sync(manual) {
  if (!state.online) return;
  try {
    state.data = await api.call('data');
    state.stale = false;
    state.error = null;
    state.syncedAt = Date.now();
    await cache.set('data', { data: state.data, at: state.syncedAt });
    if (manual) toast('Changes synchronized with Google Sheets.');
  } catch (e) {
    state.error = e.message;
    if (manual) toast(e.message, true);
  }
  render();
}

export async function login(password) {
  try {
    const result = await api.call('login', { password });
    state.token = localStorage.tok = result.token;
    await sync();
  } catch (e) { toast(e.message, true); }
}

export function signOut() {
  cache.clear();
  localStorage.clear();
  state.token = null;
  state.data = { 'Tenants': [], 'Rent Payments': [] };
  state.syncedAt = null;
  render();
}

export async function prepareSheet() {
  if (!state.online) return toast(OFFLINE_MSG, true);
  try {
    await api.call('setup', {});
    toast('Spreadsheet tabs and Occupancy dropdown prepared.');
  } catch (e) { toast(e.message, true); }
}
