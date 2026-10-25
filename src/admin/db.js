// src/admin/db.js — small database helpers used by the admin panel
import { fb } from '../firebase/index.js'

const clean = (v) => JSON.parse(JSON.stringify(v ?? null))

export async function list(name) {
  const f = await fb()
  const snap = await f.F.getDocs(f.F.collection(f.db, name))
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
}
export async function get(name, id) {
  const f = await fb()
  const snap = await f.F.getDoc(f.F.doc(f.db, name, id))
  return snap.exists() ? { ...snap.data(), id: snap.id } : null
}
/** Saves a whole document (replaces it). */
export async function put(name, id, data) {
  const f = await fb()
  const { id: _drop, ...rest } = data
  await f.F.setDoc(f.F.doc(f.db, name, id), clean(rest))
}
/** Changes only some fields of a document. */
export async function patch(name, id, data) {
  const f = await fb()
  await f.F.updateDoc(f.F.doc(f.db, name, id), clean(data))
}
export async function remove(name, id) {
  const f = await fb()
  await f.F.deleteDoc(f.F.doc(f.db, name, id))
}
export const newId = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
