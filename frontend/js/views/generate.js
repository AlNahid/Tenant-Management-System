import { state, occupied, tenantName } from '../models/store.js';
import { esc } from './ui.js';
import { unitRow } from './parts.js';

const match = (u) => `${tenantName(u)} ${u['Unit Number']} ${u['Building Name']}`.toLowerCase().includes(state.q.toLowerCase());

export const gen = {
  list: () => occupied().filter(match).map((u) => `<section class="card"><p class="mut">${esc(u['Building Name'])}</p>${unitRow(u, 'bill')}</section>`).join('')
    || '<p class="mut center">No occupied units to bill.</p>',
  view() {
    return {
      eyebrow: 'Bills are created on demand',
      title: 'Generate Rent',
      body: `<input id="q" class="search" placeholder="Search units or tenants" value="${esc(state.q)}"><div class="gap"></div><div id="list">${gen.list()}</div>`,
    };
  },
};
