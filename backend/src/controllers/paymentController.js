import { json } from '../views/json.js';
import { PaymentModel } from '../models/paymentModel.js';

export const savePayment = async ({ env, token, body }) =>
  json(await new PaymentModel(env, token).save(body.record));

export const removePayment = async ({ env, token, body }) => {
  await new PaymentModel(env, token).remove(body.id);
  return json({ ok: true });
};
