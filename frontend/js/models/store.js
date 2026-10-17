// App state + read-only selectors. Buildings are derived from unit rows.
const now = new Date();

export const state = {
  data: { 'Tenants': [], 'Rent Payments': [] },
  view: 'dash',
  token: localStorage.tok || null,
  online: navigator.onLine,
  stale: true,
  syncedAt: null,
  error: null,
  open: new Set(),          // expanded building IDs
  q: '',                    // search text (Tenants / Generate lists)
  f: { building: '', unit: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()) },
  bill: null,               // { blob, url, name } — temporary, never stored
  running: false,
};

export const render = () => document.dispatchEvent(new Event('app:render'));

const natural = (a, b) =>
  String(a['Unit Number']).localeCompare(String(b['Unit Number']), undefined, { numeric: true });

export const units = () => state.data['Tenants'];
export const unit = (id) => units().find((u) => u['Unit ID'] === id) || {};
export const tenantName = (u) => `${u['First Name']} ${u['Last Name']}`.trim();
export const occupied = () => units().filter((u) => u['Occupancy Status'] === 'Occupied');

export function buildings() {
  const map = new Map();
  for (const u of units()) {
    const id = u['Building ID'];
    if (!map.has(id)) map.set(id, { id, name: u['Building Name'], address: u['Building Address'], units: [] });
    map.get(id).units.push(u);
  }
  const list = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  list.forEach((b) => b.units.sort(natural));
  return list;
}
export const building = (id) => buildings().find((b) => b.id === id);

// Payments filtered by the period bar. periodOnly ignores building/unit filters.
export function payments(periodOnly) {
  const { building: b, unit: u, month, year } = state.f;
  return state.data['Rent Payments'].filter((p) => {
    const date = String(p['Date Received']);
    return (periodOnly || !b || p['Building ID'] === b) &&
      (periodOnly || !u || p['Unit ID'] === u) &&
      (!month || +date.slice(5, 7) === +month) &&
      (!year || date.slice(0, 4) === year);
  }).sort((x, y) => String(y['Date Received']).localeCompare(x['Date Received']));
}
export const sum = (list) => list.reduce((s, p) => s + Number(p['Amount Received'] || 0), 0);
