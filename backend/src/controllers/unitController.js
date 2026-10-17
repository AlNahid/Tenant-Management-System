import { json } from '../views/json.js';
import { UnitModel } from '../models/unitModel.js';

export const saveUnit = async ({ env, token, body }) =>
  json(await new UnitModel(env, token).save(body.record));

export const removeUnit = async ({ env, token, body }) => {
  await new UnitModel(env, token).removeUnit(body.id);
  return json({ ok: true });
};

export const addBuilding = async ({ env, token, body }) =>
  json(await new UnitModel(env, token).addBuilding(body));

export const editBuilding = async ({ env, token, body }) => {
  await new UnitModel(env, token).editBuilding(body);
  return json({ ok: true });
};

export const removeBuilding = async ({ env, token, body }) => {
  await new UnitModel(env, token).removeBuilding(body.id);
  return json({ ok: true });
};
