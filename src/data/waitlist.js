// src/data/waitlist.js — numbers of people outside our delivery area who want to be told when we reach them.
// Until Firebase (Phase 4) they are kept on this device; then they go to the Firestore "waitlist"
// collection, which only the admin can read (and export as CSV).
export async function joinWaitlist({ phone, pincode }) {
  const entry = { phone, pincode, createdAt: new Date().toISOString() }
  try {
    const list = JSON.parse(localStorage.getItem('inv-waitlist') || '[]')
    list.push(entry)
    localStorage.setItem('inv-waitlist', JSON.stringify(list.slice(-20)))
  } catch {}
  return true
}
