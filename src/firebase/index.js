// src/firebase/index.js — loads Firebase only when a page needs it (keeps the first page load small).
// Usage: const f = await fb(); if (!f) { /* not set up yet */ }   f.auth, f.db, and the SDK functions in f.Au / f.F
import { firebaseConfig, isConfigured } from './config.js'
import { appCheckSiteKey } from './security.js'

let loading = null

export function fb() {
  if (!isConfigured) return Promise.resolve(null)
  loading ||= Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]).then(([A, Au, F]) => {
    const app = A.getApps().length ? A.getApp() : A.initializeApp(firebaseConfig)
    return startAppCheck(app).then(() => ({ app, auth: Au.getAuth(app), db: F.getFirestore(app), Au, F }))
  })
  return loading
}

// App Check proves each request comes from this website. Off until a site key is added in security.js.
async function startAppCheck(app) {
  if (!appCheckSiteKey || typeof window === 'undefined') return
  try {
    // on your own computer (npm run dev) Firebase prints a debug token in the browser console; add it once in
    // Firebase Console → App Check → Apps → ⋮ → Manage debug tokens, so local testing keeps working
    if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
    const AC = await import('firebase/app-check')
    AC.initializeAppCheck(app, { provider: new AC.ReCaptchaV3Provider(appCheckSiteKey), isTokenAutoRefreshEnabled: true })
  } catch (e) {
    console.warn('App Check could not start', e)
  }
}

export { isConfigured }
