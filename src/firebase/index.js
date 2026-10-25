// src/firebase/index.js — loads Firebase only when a page needs it (keeps the first page load small).
// Usage: const f = await fb(); if (!f) { /* not set up yet */ }   f.auth, f.db, and the SDK functions in f.Au / f.F
import { firebaseConfig, isConfigured } from './config.js'

let loading = null

export function fb() {
  if (!isConfigured) return Promise.resolve(null)
  loading ||= Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]).then(([A, Au, F]) => {
    const app = A.getApps().length ? A.getApp() : A.initializeApp(firebaseConfig)
    return { app, auth: Au.getAuth(app), db: F.getFirestore(app), Au, F }
  })
  return loading
}

export { isConfigured }
