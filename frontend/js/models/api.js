import { state } from './store.js';

// GET when no body, POST when a body is given
export async function call(path, body) {
  const response = await fetch('/api/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token },
    body: body && JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && path !== 'login') {
    document.dispatchEvent(new Event('app:signout'));
    throw new Error('Signed out. Sign in again.');
  }
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
