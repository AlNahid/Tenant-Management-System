// Shared UI helpers: escaping, money, icons, toasts, modals, form builder.
import { state } from '../models/store.js';

export const $ = (s) => document.querySelector(s);
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
  building: 'M5 21V4h9v17M14 9h5v12M9 8h1M9 12h1M9 16h1M3 21h18',
  users: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 010 6M18 14c2 .7 3 2.7 3 6',
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  wallet: 'M3 7h15a3 3 0 013 3v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l11-3v3M16 14h2',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a7.6 7.6 0 000-2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-1.7-1L15 3h-4l-.4 2.9a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1L11 21h4l.4-2.9c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4z',
  pencil: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  plus: 'M12 5v14M5 12h14',
  chevron: 'M6 9l6 6 6-6',
};
export const icon = (name, size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;

export function toast(message, isError) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' err' : '');
  el.textContent = message;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), isError ? 5500 : 3400);
}

export const options = (pairs, selected, allLabel) =>
  (allLabel ? `<option value="">${allLabel}</option>` : '') +
  pairs.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(selected) ? 'selected' : ''}>${esc(l)}</option>`).join('');

// ---- Modals (bottom sheet on phones) ---------------------------------------
export function modal(html) {
  closeModal();
  const el = document.createElement('div');
  el.className = 'mo';
  el.innerHTML = `<div class="md" role="dialog" aria-modal="true">${html}</div>`;
  el.onclick = (e) => { if (e.target === el) closeModal(); };
  document.body.append(el);
  el.querySelector('input,select')?.focus();
  return el;
}

export function closeModal() {
  document.querySelector('.mo')?.remove();
  if (state.bill) { URL.revokeObjectURL(state.bill.url); state.bill = null; }
}

// Confirmation dialog. onConfirm returns true to close.
export function ask(title, onConfirm, label = 'Confirm') {
  const el = modal(`<h2>${title}</h2><div class="acts"><button class="btn ghost" data-act="close">Cancel</button><button class="btn primary" id="ok">${label}</button></div>`);
  el.querySelector('#ok').onclick = async (e) => {
    e.target.disabled = true;
    if (await onConfirm()) closeModal(); else e.target.disabled = false;
  };
}

export const field = (label, name, value = '', attrs = '') =>
  `<label>${label}<input name="${name}" value="${esc(value)}" ${attrs}></label>`;

// Form modal. onSubmit(values) returns true to close. Blocks double submits.
export function form(title, body, onSubmit, button = 'Save') {
  const el = modal(`<h2>${title}</h2><form>${body}<div class="acts"><button type="button" class="btn ghost" data-act="close">Cancel</button><button class="btn primary">${button}</button></div></form>`);
  const f = el.querySelector('form');
  let busy = false;
  f.onsubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    const submit = f.querySelector('.primary');
    submit.disabled = true;
    const ok = await onSubmit(Object.fromEntries(new FormData(f)));
    busy = false;
    submit.disabled = false;
    if (ok) closeModal();
  };
  return el;
}
