import { state, occupied, tenantName } from '../models/store.js';
import { esc, fmt } from './ui.js';

const match = (u) => `${tenantName(u)} ${u['Unit Number']} ${u.Contact} ${u['Building Name']}`.toLowerCase().includes(state.q.toLowerCase());

const card = (u) => `<section class="card">
  <div class="bhead">
    <div class="grow">
      <h3>${esc(tenantName(u))}</h3>
      <p class="mut">${esc(u['Building Name'])} · Unit ${esc(u['Unit Number'])}</p>
    </div>
    <button class="btn ghost sm" data-w data-act="editU" data-id="${u['Unit ID']}">Edit</button>
  </div>
  <div class="facts">
    <div><span>Contact</span>${esc(u.Contact || '—')}</div>
    <div><span>NID</span>${esc(u['NID Number'] || '—')}</div>
    <div><span>Meter ID</span>${esc(u['Electricity Meter ID'] || '—')}</div>
    <div><span>Joined</span>${esc(u['Joining Date'] || '—')}</div>
    <div><span>Base rent</span>${fmt(u['Base Rent'])}</div>
    <div><span>Water</span>${fmt(u['Water Bill'])}</div>
    <div><span>Gas</span>${fmt(u['Gas Bill'])}</div>
    <div><span>Service</span>${fmt(u['Service Charge'])}</div>
  </div></section>`;

export const ten = {
  list: () => occupied().filter(match).map(card).join('') || '<p class="mut center">No tenants found.</p>',
  view() {
    return {
      eyebrow: 'Occupied units',
      title: 'Tenants',
      body: `<input id="q" class="search" placeholder="Search tenants" value="${esc(state.q)}"><div class="gap"></div><div id="list">${ten.list()}</div>`,
    };
  },
};
