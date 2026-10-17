import { building } from '../models/store.js';
import { form, field, ask, toast } from '../views/ui.js';
import { online, mutate } from './helpers.js';

export const addB = () => online() && form('Add building',
  field('Building name', 'name', '', 'required') +
  field('Full address', 'address', '', 'required') +
  field('First unit number', 'unitNumber', '', 'required placeholder="e.g. 1A"') +
  '<p class="mut">A building is created together with its first unit. Add more units afterwards.</p>',
  (v) => mutate('building/add', v, 'Building added successfully.'));

export const editB = (d) => online() && form('Edit building',
  field('Building name', 'name', building(d.id).name, 'required') +
  field('Full address', 'address', building(d.id).address, 'required'),
  (v) => mutate('building/edit', { id: d.id, ...v }, 'Building updated successfully.'));

export const remB = (d) => {
  if (!online()) return;
  const b = building(d.id);
  ask(`Remove ${b.name}? Its ${b.units.length} unit row(s) are deleted from the sheet. Payment records are kept.`,
    () => mutate('building/remove', { id: d.id }, 'Building removed successfully.'), 'Remove building');
};
