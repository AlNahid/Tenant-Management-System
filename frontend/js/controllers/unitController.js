import { unit, building } from '../models/store.js';
import { validCharge } from '../models/calc.js';
import { form, field, ask, toast } from '../views/ui.js';
import { online, mutate } from './helpers.js';

function unitForm(u) {
  const isNew = !u['Unit ID'];
  const occupied = u['Occupancy Status'] === 'Occupied';
  const charges = ['Base Rent', 'Water Bill', 'Gas Bill', 'Service Charge'];

  form(isNew ? 'Add unit' : `Edit unit ${u['Unit Number']}`,
    field('Unit number', 'Unit Number', u['Unit Number'], 'required') +
    `<label>Occupancy<select name="Occupancy Status"><option ${occupied ? 'selected' : ''}>Occupied</option><option ${occupied ? '' : 'selected'}>Empty</option></select></label>
     <p class="mut">Choose Empty when a tenant moves out. Payment history is kept.</p>` +
    field('First name', 'First Name', u['First Name']) +
    field('Last name', 'Last Name', u['Last Name']) +
    field('Joining date', 'Joining Date', u['Joining Date'], 'type="date"') +
    field('Contact', 'Contact', u.Contact) +
    field('NID number', 'NID Number', u['NID Number'], 'inputmode="numeric"') +
    field('Electricity meter ID', 'Electricity Meter ID', u['Electricity Meter ID']) +
    charges.map((k) => field(`${k} (৳)`, k, u[k] ?? 0, 'type="number" step="any" min="0"')).join(''),
    async (v) => {
      if (v['Occupancy Status'] === 'Occupied') {
        if (!v['First Name'].trim() || !v['Last Name'].trim()) return toast('Enter the tenant first and last name.', true), false;
        for (const k of charges) if (!validCharge(v[k])) return toast(`${k} must be zero or more.`, true), false;
      }
      return mutate('unit/save', { record: { ...u, ...v } }, isNew ? 'Unit added successfully.' : 'Tenant information saved.');
    });
}

export const addU = (d) => online() && unitForm({ 'Building ID': d.id, 'Occupancy Status': 'Empty' });
export const editU = (d) => online() && unitForm(unit(d.id));

export const remU = (d) => {
  if (!online()) return;
  const u = unit(d.id);
  const last = building(u['Building ID'])?.units.length === 1;
  ask(`Remove unit ${u['Unit Number']}?${last ? ' It is the last unit, so the building is removed too.' : ''} Payment records are kept.`,
    () => mutate('unit/remove', { id: d.id }, 'Unit removed successfully.'), 'Remove unit');
};
