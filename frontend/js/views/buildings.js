import { state, buildings } from '../models/store.js';
import { esc, icon } from './ui.js';
import { unitRow } from './parts.js';

function card(b) {
  const open = state.open.has(b.id);
  const occ = b.units.filter((u) => u['Occupancy Status'] === 'Occupied').length;
  return `<section class="card">
    <div class="bhead">
      <span class="tile">${icon('building', 26)}</span>
      <div class="grow">
        <h3>${esc(b.name)}</h3>
        <p class="mut">${esc(b.address)}</p>
        <p class="mut">${b.units.length} ${b.units.length === 1 ? 'unit' : 'units'} · ${occ} occupied</p>
      </div>
      <button class="iconbtn soft ${open ? 'flip' : ''}" data-act="toggle" data-id="${b.id}" aria-expanded="${open}" aria-label="${open ? 'Collapse' : 'Expand'} units">${icon('chevron')}</button>
    </div>
    <div class="btnrow">
      <button class="btn soft" data-w data-act="addU" data-id="${b.id}">${icon('plus', 18)} Add unit</button>
      <button class="btn ghost" data-w data-act="editB" data-id="${b.id}">Edit</button>
      <button class="btn danger" data-w data-act="remB" data-id="${b.id}">Remove</button>
    </div>
    ${open ? b.units.map((u) => unitRow(u)).join('') : ''}
  </section>`;
}

export const bld = {
  view() {
    const list = buildings();
    return {
      eyebrow: 'Manage',
      title: 'Buildings & Units',
      body: `<button class="btn primary wide" data-w data-act="addB">${icon('plus', 20)} Add building</button>
        <div class="gap"></div>
        ${list.map(card).join('') || '<p class="mut center">No buildings yet. Add your first building.</p>'}`,
    };
  },
};
