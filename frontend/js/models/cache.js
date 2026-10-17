// Offline cache (IndexedDB): last synchronized data for read-only viewing.
const open = () => new Promise((resolve) => {
  const req = indexedDB.open('landlord', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('kv');
  req.onsuccess = () => resolve(req.result);
});

async function run(mode, action) {
  const db = await open();
  return new Promise((resolve) => {
    const tx = db.transaction('kv', mode);
    const req = action(tx.objectStore('kv'));
    tx.oncomplete = () => resolve(req?.result);
  });
}

export const get = (key) => run('readonly', (s) => s.get(key));
export const set = (key, value) => run('readwrite', (s) => s.put(value, key));
export const clear = () => run('readwrite', (s) => s.clear());
