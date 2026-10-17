import { state, payments, sum } from '../models/store.js';
import { fmt, icon } from './ui.js';
import { periodBar, paymentRow } from './parts.js';
import { MONTHS } from '../config.js';

export const pay = {
  view() {
    const list = payments(false);
    const period = `${state.f.month ? MONTHS[state.f.month - 1] : 'All months'} ${state.f.year || ''}`.trim();
    return {
      eyebrow: `Total received · ${period}`,
      big: fmt(sum(list)),
      title: `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`,
      body: `<button class="btn primary wide" data-w data-act="addP">${icon('plus', 20)} Record payment</button>
        <div class="gap"></div>
        ${periodBar(true)}
        <div class="card">${list.map((p) => paymentRow(p)).join('') || '<p class="mut">No payments match these filters.</p>'}</div>`,
    };
  },
};
