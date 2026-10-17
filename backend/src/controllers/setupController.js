import { json } from '../views/json.js';
import { sheetsApi } from '../services/google.js';
import { HEADERS } from '../config/schema.js';

// Creates the two tabs, writes headers, adds the Occupied/Empty dropdown
export async function run({ env, token }) {
  const api = (path, body, method) => sheetsApi(env, token, path, body, method);

  const existing = (await api('?fields=sheets.properties')).sheets.map((s) => s.properties.title);
  const missing = Object.keys(HEADERS)
    .filter((tab) => !existing.includes(tab))
    .map((tab) => ({ addSheet: { properties: { title: tab } } }));
  if (missing.length) await api(':batchUpdate', { requests: missing });

  for (const tab in HEADERS) {
    await api(`/values/${encodeURIComponent(tab)}!A1?valueInputOption=RAW`, { values: [HEADERS[tab]] }, 'PUT');
  }

  const sheetId = (await api('?fields=sheets.properties'))
    .sheets.find((s) => s.properties.title === 'Tenants').properties.sheetId;

  await api(':batchUpdate', {
    requests: [{
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, startColumnIndex: 5, endColumnIndex: 6 },
        rule: {
          condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'Occupied' }, { userEnteredValue: 'Empty' }] },
          showCustomUi: true,
          strict: true,
        },
      },
    }],
  });
  return json({ ok: true });
}
