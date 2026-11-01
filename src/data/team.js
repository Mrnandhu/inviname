// src/data/team.js — the admin team: the owner invites helpers with a one-time link that works for 15 minutes.
// The database rules (firestore.rules) enforce everything below: only the owner can invite or remove admins,
// and a link can be used once, by one account, within 15 minutes of being made.
import { fb } from '../firebase/index.js'

export const INVITE_MINUTES = 15

const ms = (t) => (t?.toMillis ? t.toMillis() : t ? Date.parse(t) : 0)

/** A long random code nobody can guess (128 bits). */
function newCode() {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export const inviteLink = (code) => `${location.origin}/join-admin/${code}`
/** Milliseconds left before an invite stops working (0 = expired). */
export const inviteLeft = (inv) => Math.max(0, ms(inv.createdAt) + INVITE_MINUTES * 60_000 - Date.now())

export async function createInvite(name, ownerUid) {
  const f = await fb()
  const code = newCode()
  await f.F.setDoc(f.F.doc(f.db, 'adminInvites', code), {
    name: name.trim().slice(0, 60),
    createdBy: ownerUid,
    createdAt: f.F.serverTimestamp(),
    used: false,
    usedBy: '',
  })
  return code
}

export async function listInvites() {
  const f = await fb()
  const snap = await f.F.getDocs(f.F.collection(f.db, 'adminInvites'))
  return snap.docs.map((d) => ({ code: d.id, ...d.data() }))
}

export async function cancelInvite(code) {
  const f = await fb()
  await f.F.deleteDoc(f.F.doc(f.db, 'adminInvites', code))
}

export async function listAdmins() {
  const f = await fb()
  const snap = await f.F.getDocs(f.F.collection(f.db, 'admins'))
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}

export async function removeAdmin(uid) {
  const f = await fb()
  await f.F.deleteDoc(f.F.doc(f.db, 'admins', uid))
}

/** The invite behind a link, or null if it does not exist / was used / expired. */
export async function getInvite(code) {
  const f = await fb()
  try {
    const snap = await f.F.getDoc(f.F.doc(f.db, 'adminInvites', code))
    if (!snap.exists()) return null
    const inv = { code, ...snap.data() }
    return inv.used || inviteLeft(inv) <= 0 ? null : inv
  } catch {
    return null // the rules hide used or expired invites
  }
}

/** Joins the admin team: adds this account as an admin and marks the link used, both at once. */
export async function acceptInvite(code, user, name) {
  const f = await fb()
  const batch = f.F.writeBatch(f.db)
  batch.set(f.F.doc(f.db, 'admins', user.uid), { role: 'admin', name: (name || user.name || '').slice(0, 60), invite: code, addedAt: f.F.serverTimestamp() })
  batch.update(f.F.doc(f.db, 'adminInvites', code), { used: true, usedBy: user.uid, usedAt: f.F.serverTimestamp() })
  await batch.commit()
}

export const when = (t) => (ms(t) ? new Date(ms(t)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '')
