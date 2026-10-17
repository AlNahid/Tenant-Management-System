import { ID_PREFIX } from '../config/schema.js';

// Throw an error that the router turns into an HTTP 400 response
export function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

// New, never-reused ID such as "U-3F9A12BC"
export const newId = (kind) =>
  `${ID_PREFIX[kind]}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

// Convert record[field] to a number. zeroOk → 0 is allowed; otherwise must be > 0.
export function toNumber(record, field, zeroOk) {
  const value = record[field];
  const invalid = value === '' || !Number.isFinite(Number(value)) ||
    (zeroOk ? Number(value) < 0 : Number(value) <= 0);
  if (invalid) fail(`${field} must be ${zeroOk ? 'zero or more' : 'greater than zero'}`);
  record[field] = Number(value);
}

const encoder = new TextEncoder();

export const base64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const base64urlText = (text) => base64url(encoder.encode(text));
export const bytes = (text) => encoder.encode(text);
