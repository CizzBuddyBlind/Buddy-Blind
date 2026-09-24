const DB = "bb-media";
const STORE = "files";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putMedia(id, dataUrl) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(dataUrl, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getMedia(id) {
  const db = await openDb();
  const value = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || "");
    req.onerror = () => reject(req.error);
  });
  db.close();
  return value;
}

export function storeLink() {
  const apple = /iPhone|iPad|Macintosh/.test(navigator.userAgent || "");
  return apple
    ? "https://apps.apple.com/search?term=Buddy%20Blind"
    : "https://play.google.com/store/search?q=Buddy%20Blind&c=apps";
}
