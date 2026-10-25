// src/data/auth.js — customer accounts: Google sign-in, email + password, forgot password, log out.
// useAuth() gives { user, ready, isAdmin, disabled } anywhere in the site.
import { useSyncExternalStore } from 'react'
import { fb, isConfigured } from '../firebase/index.js'
import { attachCartToAccount, detachCart } from './cart.js'

let state = { user: null, ready: !isConfigured, isAdmin: false, adminChecked: false, disabled: !isConfigured }
const subs = new Set()
const set = (patch) => {
  state = { ...state, ...patch }
  subs.forEach((f) => f())
}
let started = false

function start() {
  if (started || !isConfigured) return
  started = true
  fb()
    .then((f) => {
      f.Au.onAuthStateChanged(f.auth, async (u) => {
        if (!u) {
          detachCart()
          set({ user: null, ready: true, isAdmin: false, adminChecked: true })
          return
        }
        const user = { uid: u.uid, email: u.email, name: u.displayName || (u.email || '').split('@')[0], photo: u.photoURL }
        set({ user, ready: true, adminChecked: false })
        // background work after login: profile, saved cart, admin check
        saveProfile(f, u).catch(() => {})
        attachCartToAccount(u.uid).catch(() => {})
        try {
          const snap = await f.F.getDoc(f.F.doc(f.db, 'admins', u.uid))
          set({ isAdmin: snap.exists(), adminChecked: true })
        } catch {
          set({ isAdmin: false, adminChecked: true })
        }
      })
    })
    .catch(() => set({ ready: true, disabled: true }))
}

const subscribe = (fn) => {
  subs.add(fn)
  return () => subs.delete(fn)
}

/** React hook: { user, ready, isAdmin, adminChecked, disabled } */
export function useAuth() {
  start()
  return useSyncExternalStore(subscribe, () => state, () => state)
}

async function saveProfile(f, u, name) {
  const ref = f.F.doc(f.db, 'users', u.uid)
  const snap = await f.F.getDoc(ref)
  const data = { name: name || u.displayName || '', email: u.email || '', updatedAt: f.F.serverTimestamp() }
  if (!snap.exists()) data.createdAt = f.F.serverTimestamp()
  await f.F.setDoc(ref, data, { merge: true })
}

async function need() {
  const f = await fb()
  if (!f) throw Object.assign(new Error('Login is not set up yet.'), { code: 'not-configured' })
  return f
}

export async function signInWithGoogle() {
  const f = await need()
  const provider = new f.Au.GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    await f.Au.signInWithPopup(f.auth, provider)
  } catch (e) {
    // some phones block pop-ups: fall back to a full-page Google sign-in
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') await f.Au.signInWithRedirect(f.auth, provider)
    else throw e
  }
}

export async function signInWithEmail(email, password) {
  const f = await need()
  await f.Au.signInWithEmailAndPassword(f.auth, email.trim(), password)
}

export async function signUpWithEmail({ name, email, password }) {
  const f = await need()
  const cred = await f.Au.createUserWithEmailAndPassword(f.auth, email.trim(), password)
  await f.Au.updateProfile(cred.user, { displayName: name.trim() })
  await saveProfile(f, cred.user, name.trim())
  set({ user: { ...state.user, uid: cred.user.uid, email: cred.user.email, name: name.trim() } })
}

export async function resetPassword(email) {
  const f = await need()
  await f.Au.sendPasswordResetEmail(f.auth, email.trim())
}

export async function logOut() {
  const f = await need()
  await f.Au.signOut(f.auth)
}

/** Friendly message for Firebase sign-in errors */
export function authMessage(e) {
  const M = {
    'not-configured': 'Login is not set up yet. Please try again later.',
    'auth/invalid-credential': 'Email or password is not correct.',
    'auth/wrong-password': 'Email or password is not correct.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/email-already-in-use': 'An account already exists with this email. Please log in.',
    'auth/weak-password': 'Please use a password of at least 6 characters.',
    'auth/missing-password': 'Please enter your password.',
    'auth/too-many-requests': 'Too many tries. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'No internet connection. Please check and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'auth/cancelled-popup-request': 'Google sign-in was closed before finishing.',
    'auth/unauthorized-domain': 'This address is not allowed for login yet (add it in Firebase → Authentication → Settings → Authorized domains).',
  }
  return M[e?.code] || 'Something went wrong. Please try again.'
}

/** Only allow going back to pages on this site after login (never to another website). */
export const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/')
