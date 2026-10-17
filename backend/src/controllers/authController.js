import { json } from '../views/json.js';
import { createSessionToken } from '../services/session.js';

export async function login({ env, body }) {
  if (!body.password || body.password !== env.LANDLORD_PASSWORD) {
    return json({ error: 'Wrong password' }, 401);
  }
  return json({ token: await createSessionToken(env) });
}
