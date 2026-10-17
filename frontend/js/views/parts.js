// Reusable pieces: period/filter bar, unit rows, payment rows.
import { state, buildings, units, unit, tenantName, payments } from '../models/store.js';
import { esc, fmt, icon, options } from './ui.js';
import { MONTHS } from '../config.js';

export function periodBar(withBuildingUnit) {
  const f = state.f;
  const years = [...new Set([...state.data['Rent Payments'].map((p) => String(p['Date Received']).slice(0, 4)), String(new Date().getFullYear())])]
    .sort().reverse().map((y) => [y, y]);
  const unitList = (f.building ? units().filter((u) => u['Building ID'] === f.building) : units());

  return `<div class="filters">
    ${withBuildingUnit ? `
      <select data-f="building" aria-label="Building">${options(buildings().map((b) => [b.id, b.name]), f.building, 'All buildings')}</select>
      <select data-f="unit" aria-label="Unit">${options(unitList.map((u) => [u['Unit ID'], `${u['Building Name']} · ${u['Unit Number']}`]), f.unit, 'All units')}</select>` : ''}
    <select data-f="month" aria-label="Month">${options(MONTHS.map((m, i) => [i + 1, m]), f.month, 'All months')}</select>
    <select data-f="year" aria-label="Year">${options(years, f.year, 'All years')}</select>
  </div>`;
}

// mode: 'manage' (Generate Rent / Edit / Remove) or 'bill' (Generate Rent only)
export function unitRow(u, mode = 'manage') {
  const id = u['Unit ID'];
  const occ = u['Occupancy Status'] === 'Occupied';
  return `<div class="urow">
    <div class="utile">${esc(u['Unit Number'])}</div>
    <div class="grow">
      <b>${occ ? esc(tenantName(u)) : 'Vacant'}</b>
      <p class="mut"><span class="pill ${u['Occupancy Status']}">${u['Occupancy Status']}</span>${occ ? ` · Meter ${esc(u['Electricity Meter ID'] || '—')}` : ''}</p>
    </div>
    <div class="uacts">
      ${occ ? `<button class="btn primary sm" data-w data-act="gen" data-id="${id}">Generate Rent</button>` : ''}
      ${mode === 'manage' ? `<button class="btn ghost sm" data-w data-act="editU" data-id="${id}">Edit</button><button class="btn danger sm" data-w data-act="remU" data-id="${id}">Remove</button>` : ''}
    </div>
  </div>`;
}

export function paymentRow(p, actions = true) {
  const id = p['Payment ID'];
  return `<div class="prow">
    <span class="circle">${icon('wallet')}</span>
    <div class="grow">
      <b>${esc(p['Building Name'])}</b>
      <p class="mut">Unit ${esc(p['Unit Number'])} · ${esc(p['Date Received'])}${p.Archived ? ' · ' + esc(p.Archived) : ''}</p>
    </div>
    <b class="amt">+${fmt(p['Amount Received'])}</b>
    ${actions ? `<div class="iconrow">
      <button class="iconbtn soft" data-w data-act="editP" data-id="${id}" aria-label="Edit payment">${icon('pencil', 20)}</button>
      <button class="iconbtn danger" data-w data-act="delP" data-id="${id}" aria-label="Delete payment">${icon('trash', 20)}</button>
    </div>` : ''}
  </div>`;
}
