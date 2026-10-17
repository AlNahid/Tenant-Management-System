import { base64url, base64urlText, bytes } from './util.js';

// Service account → short-lived Google access token
export async function getGoogleToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64urlText('{"alg":"RS256","typ":"JWT"}');
  const claims = base64urlText(JSON.stringify({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  // Accepts the key with \n text, real line breaks, or one long line
  const pem = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/-----[^-]+-----|\s/g, '');
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign'],
  );
  const signature = base64url(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, bytes(`${header}.${claims}`)),
  );

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${claims}.${signature}`,
  });
  const data = await response.json();
  if (!data.access_token) throw new Error('Google authentication failed — check service account settings');
  return data.access_token;
}

// Call the Sheets API. POST when a body is given, unless `method` is set.
export async function sheetsApi(env, token, path, body, method) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}${path}`, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Google Sheets error');
  return data;
}
