import { state } from '../models/store.js';
import * as api from '../models/api.js';
import { toast } from '../views/ui.js';
import { OFFLINE_MSG } from '../config.js';
import { sync } from './sessionController.js';

// Writes are blocked offline. Returns true when online.
export function online() {
  if (state.online) return true;
  toast(OFFLINE_MSG, true);
  return false;
}

// Send a change to the backend, refresh from the sheet, show success only if it worked
export async function mutate(path, body, successMessage) {
  if (!online()) return false;
  try {
    await api.call(path, body);
    await sync();
    toast(successMessage);
    return true;
  } catch (e) {
    toast(e.message, true);
    return false;
  }
}
