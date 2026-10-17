// Rent bill flow: details → review → hold to confirm → PNG preview/download/share.
// Nothing here is saved; the PNG exists only for the current preview.
import { state, unit } from '../models/store.js';
import { total, validCharge } from '../models/calc.js';
import { makeBillPng } from '../views/billImage.js';
import { modal, $, esc, fmt, options, toast } from '../views/ui.js';
import { online } from './helpers.js';
import { MONTHS } from '../config.js';
import { tenantName } from '../models/store.js';

export function gen(d) {
  if (!online()) return;
  const u = unit(d.id);
  const now = new Date();
  const el = modal(`<h2>Generate Rent</h2>
    <p class="mut">${esc(u['Building Name'])}<br>${esc(u['Building Address'])}<br>Unit ${esc(u['Unit Number'])} · ${esc(tenantName(u))} · Meter ${esc(u['Electricity Meter ID'] || '—')}</p>
    <div class="g2">
      <label>Month<select id="gm">${options(MONTHS.map((m, i) => [i + 1, m]), now.getMonth() + 1)}</select></label>
      <label>Year<input id="gy" type="number" value="${now.getFullYear()}"></label>
    </div>
    <label>Electricity bill (৳)<input id="ge" type="number" min="0" step="any" inputmode="decimal"></label>
    <label>Due date<input id="gd" type="date"></label>
    <div id="gp" class="breakdown"></div>
    <div id="gx"><button class="btn primary wide" data-act="gnext">Review and confirm</button></div>`);
  el.dataset.id = d.id;

  const preview = () => {
    const cur = unit(d.id), e = $('#ge').value, elec = validCharge(e) ? +e : 0;
    $('#gp').innerHTML = [['Base rent', cur['Base Rent']], ['Water bill', cur['Water Bill']], ['Gas bill', cur['Gas Bill']], ['Service charge', cur['Service Charge']], ['Electricity bill', elec]]
      .map(([l, v]) => `<div class="ln"><span>${l}</span><span>${fmt(v)}</span></div>`).join('') +
      `<div class="tot"><span>Total due</span><span>${fmt(total(cur['Base Rent'], cur['Water Bill'], cur['Gas Bill'], cur['Service Charge'], elec))}</span></div>`;
  };
  preview();
  $('#ge').oninput = preview;
}

export function gnext() {
  const electricity = $('#ge').value, due = $('#gd').value, year = +$('#gy').value;
  if (!validCharge(electricity)) return toast('Enter the electricity bill (zero or more).', true);
  if (!due || isNaN(Date.parse(due)) || +due.slice(0, 4) < 2000 || +due.slice(0, 4) > 2100) return toast('Select a valid due date.', true);
  if (!(year >= 2000 && year <= 2100)) return toast('Enter a valid billing year.', true);

  ['gm', 'gy', 'ge', 'gd'].forEach((id) => { $('#' + id).disabled = true; });
  $('#gx').innerHTML = `<button id="hold" class="hold" aria-describedby="hh"><span class="fill"></span><b>Hold to Generate Bill</b></button>
    <p id="hh" class="mut center">Hold for 1.5 seconds (touch, mouse, or Space/Enter).</p>
    <button class="textbtn" data-act="gnohold">Can't hold? Confirm without holding</button>`;

  // Hold-to-confirm: releasing early cancels
  const button = $('#hold'), fill = button.firstChild;
  let start = 0, frame = 0;
  const tick = (t) => {
    const p = Math.min((t - start) / 1500, 1);
    fill.style.width = p * 100 + '%';
    if (p >= 1) { start = 0; run(); } else frame = requestAnimationFrame(tick);
  };
  const begin = () => { if (start || state.running) return; start = performance.now(); frame = requestAnimationFrame(tick); };
  const stop = () => { if (start) { cancelAnimationFrame(frame); start = 0; fill.style.width = 0; } };
  button.onpointerdown = begin;
  button.onpointerup = button.onpointerleave = button.onpointercancel = stop;
  button.onkeydown = (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); begin(); } };
  button.onkeyup = stop;
  button.onblur = stop;
}

export async function run() {
  if (state.running || !online()) return;
  state.running = true;
  const id = $('.mo').dataset.id;
  const values = { month: +$('#gm').value, year: +$('#gy').value, electricity: +$('#ge').value, due: $('#gd').value };
  try {
    const u = unit(id); // current details at the moment of generation
    const blob = await makeBillPng(u, values);
    const url = URL.createObjectURL(blob);
    const el = modal(`<h2>Bill preview</h2><img class="pv" src="${url}" alt="Rent bill for unit ${esc(u['Unit Number'])}">
      <div class="acts"><button class="btn ghost" data-act="close">Close</button><button class="btn soft" data-act="dl">Download PNG</button><button class="btn primary" data-act="share">Share</button></div>`);
    state.bill = { blob, url, name: `rent-bill-${u['Unit Number']}-${values.year}-${String(values.month).padStart(2, '0')}.png` };
    toast('Rent bill generated successfully.');
  } catch { toast('Could not generate the bill image. Try again.', true); }
  state.running = false;
}

export function dl() {
  if (!state.bill) return;
  const a = document.createElement('a');
  a.href = state.bill.url; a.download = state.bill.name; a.click();
  toast('PNG prepared for download.');
}

export async function share() {
  if (!state.bill) return;
  const file = new File([state.bill.blob], state.bill.name, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); toast('PNG ready to share.'); }
    catch (e) { if (e.name !== 'AbortError') dl(); }
  } else dl();
}
