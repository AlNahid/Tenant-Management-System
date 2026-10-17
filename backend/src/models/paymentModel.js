import { SheetModel } from './sheetModel.js';
import { UnitModel } from './unitModel.js';
import { TABS } from '../config/schema.js';
import { fail, newId, toNumber } from '../services/util.js';

export class PaymentModel {
  constructor(env, token) {
    this.env = env;
    this.token = token;
    this.sheet = new SheetModel(env, token, TABS.PAYMENTS);
  }

  list() {
    return this.sheet.all();
  }

  async save(incoming) {
    const rows = await this.sheet.all();
    const id = incoming['Payment ID'];
    const index = id ? rows.findIndex((r) => r['Payment ID'] === id) : -1;
    if (id && index < 0) fail('Payment not found');

    const existing = index >= 0 ? rows[index] : null;
    const record = { ...(existing || {}), ...incoming };

    // New payments must point at a real building + unit; names are snapshotted
    if (!existing) {
      const units = await new UnitModel(this.env, this.token).list();
      const unit = units.find((u) => u['Unit ID'] === record['Unit ID']);
      if (!unit || unit['Building ID'] !== record['Building ID']) fail('Select a valid building and unit');
      record['Building Name'] = unit['Building Name'];
      record['Unit Number'] = unit['Unit Number'];
    }

    toNumber(record, 'Amount Received', false);
    const date = String(record['Date Received']);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) fail('Enter a valid date received');

    const now = new Date().toISOString();
    if (!existing) { record['Payment ID'] = newId('Rent Payments'); record.Created = now; }
    record.Updated = now;

    if (existing) await this.sheet.update(index, record);
    else await this.sheet.insert(record);
    return record;
  }

  // Delete the payment's row from the sheet
  async remove(paymentId) {
    const rows = await this.sheet.all();
    const index = rows.findIndex((r) => r['Payment ID'] === paymentId);
    if (index < 0) fail('Payment not found');
    await this.sheet.remove([index]);
  }
}
