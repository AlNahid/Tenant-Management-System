import { HEADERS } from '../config/schema.js';
import { sheetsApi } from '../services/google.js';

const enc = encodeURIComponent;

// Generic table access for one tab. Row index i (0-based) = spreadsheet row i + 2.
export class SheetModel {
  constructor(env, token, tab) {
    this.env = env;
    this.token = token;
    this.tab = tab;
    this.headers = HEADERS[tab];
  }

  call(path, body, method) {
    return sheetsApi(this.env, this.token, path, body, method);
  }

  toRow(record) {
    return this.headers.map((name) => record[name] ?? '');
  }

  async all() {
    const data = await this.call(`/values/${enc(this.tab)}?valueRenderOption=UNFORMATTED_VALUE`);
    return (data.values || []).slice(1).map((row) =>
      Object.fromEntries(this.headers.map((name, i) => [name, row[i] ?? ''])),
    );
  }

  insert(record) {
    return this.call(
      `/values/${enc(this.tab)}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { values: [this.toRow(record)] },
    );
  }

  update(index, record) {
    return this.call(
      `/values/${enc(this.tab)}!A${index + 2}?valueInputOption=RAW`,
      { values: [this.toRow(record)] },
      'PUT',
    );
  }

  // items: [{ index, record }]
  async updateMany(items) {
    if (!items.length) return;
    await this.call('/values:batchUpdate', {
      valueInputOption: 'RAW',
      data: items.map(({ index, record }) => ({
        range: `'${this.tab}'!A${index + 2}`,
        values: [this.toRow(record)],
      })),
    });
  }

  // Physically delete rows from the sheet (highest first so indexes stay valid)
  async remove(indexes) {
    const meta = await this.call('?fields=sheets.properties');
    const sheetId = meta.sheets.find((s) => s.properties.title === this.tab).properties.sheetId;
    const requests = [...indexes].sort((a, b) => b - a).map((i) => ({
      deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: i + 1, endIndex: i + 2 } },
    }));
    await this.call(':batchUpdate', { requests });
  }
}
