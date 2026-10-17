import { json } from '../views/json.js';
import { UnitModel } from '../models/unitModel.js';
import { PaymentModel } from '../models/paymentModel.js';
import { TABS } from '../config/schema.js';

// Everything the app needs in one call (rows without an ID are skipped)
export async function index({ env, token }) {
  const [units, payments] = await Promise.all([
    new UnitModel(env, token).list(),
    new PaymentModel(env, token).list(),
  ]);
  return json({
    [TABS.TENANTS]: units.filter((r) => r['Unit ID']),
    [TABS.PAYMENTS]: payments.filter((r) => r['Payment ID']),
  });
}
