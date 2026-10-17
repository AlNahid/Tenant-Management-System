import { base64url, bytes } from './util.js';

async function sign(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', bytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return base64url(await crypto.subtle.sign('HMAC', key, bytes(message)));
}

// Token format: "<expiry-ms>.<signature>" — valid for 30 days
export async function createSessionToken(env) {
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return `${expires}.${await sign(env.SESSION_SECRET, String(expires))}`;
}

export async function isValidSession(request, env) {
  const header = request.headers.get('Authorization') || '';
  const [expires, signature] = header.slice('Bearer '.length).split('.');
  if (!expires || Number(expires) < Date.now()) return false;
  return signature === (await sign(env.SESSION_SECRET, expires));
}
