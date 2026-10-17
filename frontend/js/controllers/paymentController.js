import { buildings, units, unit } from '../models/store.js';
import { form, field, ask, options, fmt } from '../views/ui.js';
import { state } from '../models/store.js';
import { online, mutate } from './helpers.js';

export function addP() {
  if (!online()) return;
  const el = form('Record payment',
    `<label>Building<select name="Building ID" id="pb" required>${options(buildings().map((b) => [b.id, b.name]), '', 'Select building')}</select></label>
     <label>Unit<select name="Unit ID" id="pu" required><option value="">Select building first</option></select></label>` +
    field('Amount received (৳)', 'Amount Received', '', 'type="number" step="any" min="0.01" required') +
    field('Date received', 'Date Received', new Date().toISOString().slice(0, 10), 'type="date" required'),
    (v) => {
      const u = unit(v['Unit ID']);
      ask(`Save ${fmt(v['Amount Received'])} received on ${v['Date Received']} for ${u['Building Name']}, unit ${u['Unit Number']}?`,
        () => mutate('payment/save', { record: v }, 'Payment recorded successfully.'), 'Confirm and save');
      return false;
    }, 'Review');

  el.querySelector('#pb').onchange = (e) => {
    el.querySelector('#pu').innerHTML = options(
      units().filter((u) => u['Building ID'] === e.target.value).map((u) => [u['Unit ID'], `Unit ${u['Unit Number']}`]), '', 'Select unit');
  };
}

export function editP(d) {
  if (!online()) return;
  const p = state.data['Rent Payments'].find((x) => x['Payment ID'] === d.id);
  form('Edit payment',
    field('Amount received (৳)', 'Amount Received', p['Amount Received'], 'type="number" step="any" min="0.01" required') +
    field('Date received', 'Date Received', p['Date Received'], 'type="date" required'),
    (v) => mutate('payment/save', { record: { 'Payment ID': d.id, ...v, Archived: 'Corrected' } }, 'Payment updated successfully.'));
}

// Deleting removes the row from the sheet as well
export const delP = (d) => online() && ask(
  'Delete this payment? It is removed from the app and from the Google Sheet.',
  () => mutate('payment/remove', { id: d.id }, 'Payment deleted.'), 'Delete payment');
