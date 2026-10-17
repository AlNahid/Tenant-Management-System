// Entry point (Cloudflare Pages Function). Thin router: auth check → controller.
import { routes } from '../../src/routes.js';
import { json } from '../../src/views/json.js';
import { isValidSession } from '../../src/services/session.js';
import { getGoogleToken } from '../../src/services/google.js';

export async function onRequest({ request, env }) {
  const path = new URL(request.url).pathname.replace(/^\/api\//, '');
  const route = routes[`${request.method} ${path}`];
  if (!route) return json({ error: 'Not found' }, 404);

  try {
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
    if (route.public) return await route.handler({ env, body });

    if (!(await isValidSession(request, env))) return json({ error: 'Signed out' }, 401);
    return await route.handler({ env, body, token: await getGoogleToken(env) });
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}
