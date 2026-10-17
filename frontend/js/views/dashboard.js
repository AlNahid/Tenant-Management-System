import { state, buildings, units, occupied, payments, sum } from '../models/store.js';
import { fmt } from './ui.js';
import { periodBar, paymentRow } from './parts.js';
import { MONTHS } from '../config.js';

export const dash = {
  view() {
    const list = payments(true);
    const period = `${state.f.month ? MONTHS[state.f.month - 1] : 'All months'} ${state.f.year || ''}`.trim();
    const occ = occupied().length;
    const when = state.syncedAt ? new Date(state.syncedAt).toLocaleString() : 'never';

    return {
      eyebrow: `Rent received · ${period}`,
      big: fmt(sum(list)),
      title: `${list.length} payment ${list.length === 1 ? 'entry' : 'entries'}`,
      body: `
        ${periodBar(false)}
        <div class="grid2">
          <div class="card stat"><span>Buildings</span><b>${buildings().length}</b></div>
          <div class="card stat"><span>Total units</span><b>${units().length}</b></div>
          <div class="card stat mint"><span>Occupied</span><b>${occ}</b></div>
          <div class="card stat dark"><span>Empty</span><b>${units().length - occ}</b></div>
        </div>
        <h2 class="sec">Recent payments</h2>
        <div class="card">${list.slice(0, 5).map((p) => paymentRow(p, false)).join('') || '<p class="mut">No payments in this period.</p>'}</div>
        <p class="mut center">${state.stale ? 'Showing cached data' : 'Synchronized'} · last sync ${when}</p>`,
    };
  },
};
