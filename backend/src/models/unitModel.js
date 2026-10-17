import { SheetModel } from './sheetModel.js';
import { TABS, TENANT_FIELDS, CHARGE_FIELDS } from '../config/schema.js';
import { fail, newId, toNumber } from '../services/util.js';

// Buildings have no tab of their own: a building exists through the unit rows
// that carry its ID, name and address.
export class UnitModel {
  constructor(env, token) {
    this.sheet = new SheetModel(env, token, TABS.TENANTS);
  }

  list() {
    return this.sheet.all();
  }

  // ---- Units ---------------------------------------------------------------

  // Create or update one unit. `building` is only needed for a brand-new building.
  async save(incoming, building) {
    const rows = await this.sheet.all();
    const id = incoming['Unit ID'];
    const index = id ? rows.findIndex((r) => r['Unit ID'] === id) : -1;
    if (id && index < 0) fail('Unit not found');

    const existing = index >= 0 ? rows[index] : null;
    const record = { ...(existing || {}), ...incoming };

    // Building name/address always come from the building itself
    const sibling = building || rows.find((r) => r['Building ID'] === record['Building ID']);
    if (!sibling) fail('Building not found');
    record['Building ID'] = building ? building.id : sibling['Building ID'];
    record['Building Name'] = building ? building.name : sibling['Building Name'];
    record['Building Address'] = building ? building.address : sibling['Building Address'];

    this.validate(record, rows);

    const now = new Date().toISOString();
    if (!existing) { record['Unit ID'] = newId('Tenants'); record.Created = now; }
    record.Updated = now;

    if (existing) await this.sheet.update(index, record);
    else await this.sheet.insert(record);
    return record;
  }

  validate(record, rows) {
    const number = String(record['Unit Number']).trim();
    if (!number) fail('Unit number is required');
    record['Unit Number'] = number;

    // Unit number is unique inside a building (may repeat across buildings)
    const duplicate = rows.some((r) =>
      r['Unit ID'] !== record['Unit ID'] &&
      r['Building ID'] === record['Building ID'] &&
      String(r['Unit Number']).toLowerCase() === number.toLowerCase());
    if (duplicate) fail('Unit number already exists in this building');

    if (!['Occupied', 'Empty'].includes(record['Occupancy Status'])) {
      fail('Occupancy must be Occupied or Empty');
    }

    if (record['Occupancy Status'] === 'Empty') {
      TENANT_FIELDS.forEach((field) => { record[field] = ''; }); // moved out
      return;
    }
    if (!String(record['First Name']).trim() || !String(record['Last Name']).trim()) {
      fail('Tenant first and last name are required');
    }
    CHARGE_FIELDS.forEach((field) => toNumber(record, field, true));
    record['NID Number'] = String(record['NID Number']); // keep text, e.g. leading zeros
    record.Contact = String(record.Contact);
  }

  // Remove the unit's row from the sheet. Payment records are not touched.
  async removeUnit(unitId) {
    const rows = await this.sheet.all();
    const index = rows.findIndex((r) => r['Unit ID'] === unitId);
    if (index < 0) fail('Unit not found');
    await this.sheet.remove([index]);
  }

  // ---- Buildings -----------------------------------------------------------

  // A building is created together with its first unit
  async addBuilding({ name, address, unitNumber }) {
    if (!String(name || '').trim() || !String(address || '').trim()) {
      fail('Building name and address are required');
    }
    const building = { id: newId('Building'), name: name.trim(), address: address.trim() };
    return this.save({ 'Unit Number': unitNumber ?? '', 'Occupancy Status': 'Empty' }, building);
  }

  async editBuilding({ id, name, address }) {
    if (!String(name || '').trim() || !String(address || '').trim()) {
      fail('Building name and address are required');
    }
    const rows = await this.sheet.all();
    const now = new Date().toISOString();
    const items = [];
    rows.forEach((row, index) => {
      if (row['Building ID'] === id) {
        items.push({ index, record: { ...row, 'Building Name': name.trim(), 'Building Address': address.trim(), Updated: now } });
      }
    });
    if (!items.length) fail('Building not found');
    await this.sheet.updateMany(items);
  }

  // Remove every unit row of the building. Payment records are kept.
  async removeBuilding(id) {
    const rows = await this.sheet.all();
    const indexes = [];
    rows.forEach((row, index) => { if (row['Building ID'] === id) indexes.push(index); });
    if (!indexes.length) fail('Building not found');
    await this.sheet.remove(indexes);
  }
}
