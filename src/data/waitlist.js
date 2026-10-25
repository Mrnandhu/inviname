// src/data/waitlist.js — numbers of people outside our delivery area who want to be told when we reach them.
// Saved to the Firestore "waitlist" collection (anyone can add, only the admin can read and export it).
import { fb } from '../firebase/index.js'

export async function joinWaitlist({ phone, pincode }) {
  const f = await fb()
  if (f) {
    await f.F.addDoc(f.F.collection(f.db, 'waitlist'), { phone, pincode, createdAt: f.F.serverTimestamp() })
    return true
  }
  // Firebase not set up yet: keep it on this device so nothing is lost while testing
  try {
    const list = JSON.parse(localStorage.getItem('inv-waitlist') || '[]')
    list.push({ phone, pincode, createdAt: new Date().toISOString() })
    localStorage.setItem('inv-waitlist', JSON.stringify(list.slice(-20)))
  } catch {}
  return true
}
