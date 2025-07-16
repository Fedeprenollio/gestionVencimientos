// src/utils/indexedDB.js
import { openDB } from "idb";

const DB_NAME = "inventarioDB";
const STORE_NAME = "movimientos";

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true }); // ❌ quitamos keyPath
      }
    },
  });
}


export async function saveMovimientos(data) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // Limpiar antes de guardar
  await store.clear();
  data.forEach((item) => store.add(item));

  await tx.done;
}

export async function getMovimientos() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearMovimientos() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
}
