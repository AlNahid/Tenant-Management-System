// Draws the bill PNG on a canvas. Dark + green style; no payment status. Never stored.
import { total } from '../models/calc.js';
import { tenantName } from '../models/store.js';
import { fmt } from './ui.js';
import { MONTHS } from '../config.js';

const longDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export async function makeBillPng(u, v) {
  try { await document.fonts.load('400 24px Roboto'); } catch { /* fallback font is fine */ }

  const W = 900;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = 1240;
  const x = canvas.getContext('2d');

  x.fillStyle = '#0a0c0b'; x.fillRect(0, 0, W, 1240);
  x.fillStyle = '#10b981'; x.fillRect(0, 0, W, 14);

  const font = (size, weight = 400) => { x.font = `${weight} ${size}px Roboto,'Noto Sans Bengali',Arial,sans-serif`; };
  const text = (s, X, Y, color = '#e7ece9', align = 'left') => { x.fillStyle = color; x.textAlign = align; x.fillText(s, X, Y); };

  font(54, 300); text('Rent Bill', 60, 120);
  font(32, 500); text(u['Building Name'], 60, 190);

  // Wrap the address
  font(24);
  let y = 232, line = '';
  for (const word of String(u['Building Address']).split(' ')) {
    if (x.measureText(line + word).width > 780) { text(line, 60, y, '#8a948f'); y += 34; line = ''; }
    line += word + ' ';
  }
  text(line, 60, y, '#8a948f');
  y = Math.max(y + 70, 320);

  const row = (label, value, color) => {
    font(28); text(label, 60, y, '#8a948f'); text(value, W - 60, y, color || '#e7ece9', 'right');
    y += 58; x.fillStyle = '#262c29'; x.fillRect(60, y - 38, W - 120, 1);
  };

  row('Unit', u['Unit Number']);
  row('Tenant', tenantName(u));
  row('Billing period', `${MONTHS[v.month - 1]} ${v.year}`);
  row('Electricity meter ID', u['Electricity Meter ID'] || '—');
  row('Bill generated', longDate(new Date()));
  row('Due date', longDate(new Date(v.due + 'T00:00')), '#10b981');
  y += 30;
  row('Base rent', fmt(u['Base Rent']));
  row('Water bill', fmt(u['Water Bill']));
  row('Gas bill', fmt(u['Gas Bill']));
  row('Service charge', fmt(u['Service Charge']));
  row('Electricity bill', fmt(v.electricity));

  y += 20;
  x.fillStyle = '#10b981'; x.beginPath(); x.roundRect(60, y, W - 120, 130, 16); x.fill();
  font(30); text('Total payable', 100, y + 78, '#04130c');
  font(48, 500);
  text(fmt(total(u['Base Rent'], u['Water Bill'], u['Gas Bill'], u['Service Charge'], v.electricity)), W - 100, y + 82, '#04130c', 'right');

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject()), 'image/png'));
}
