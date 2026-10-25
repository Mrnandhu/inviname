// src/data/wholesale.js — wholesale applications (one per customer account) and approval status.
import { useEffect, useState } from 'react'
import { fb } from '../firebase/index.js'
import { useAuth } from './auth.js'

export async function getApplication(uid) {
  const f = await fb()
  if (!f || !uid) return null
  const snap = await f.F.getDoc(f.F.doc(f.db, 'wholesaleApplications', uid))
  return snap.exists() ? snap.data() : null
}

export async function applyWholesale(uid, form) {
  const f = await fb()
  const data = {
    shopName: form.shopName.trim(),
    ownerName: form.ownerName.trim(),
    phone: form.phone.trim(),
    city: form.city.trim(),
    gst: (form.gst || '').trim().toUpperCase(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  await f.F.setDoc(f.F.doc(f.db, 'wholesaleApplications', uid), data)
  return data
}

/** React hook: this customer's wholesale application ({ status: 'pending' | 'approved' | 'rejected', … }) or null. */
export function useWholesale() {
  const { user } = useAuth()
  const [app, setApp] = useState(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let live = true
    setReady(false)
    if (!user) {
      setApp(null)
      setReady(true)
      return
    }
    getApplication(user.uid)
      .catch(() => null)
      .then((a) => live && (setApp(a), setReady(true)))
    return () => {
      live = false
    }
  }, [user])
  return { app, approved: app?.status === 'approved', ready, setApp }
}
