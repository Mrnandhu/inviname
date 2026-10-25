// src/data/settings.js — shop settings the admin panel edits (Admin → Settings): contact details, UPI,
// delivery areas/zones/charges, packing, free delivery, pickup, wholesale rules, photo uploads, colours.
// Saved in Firestore "settings/public"; anything missing there falls back to these defaults.
import { fb } from '../firebase/index.js'
import { SITE } from '../config/site.js'
import { createStore } from '../lib/store.js'

export const DEFAULT_SETTINGS = {
  delivery: {
    // pincodes we deliver to, by their first 3 digits: Andhra Pradesh 515–535, Telangana 500–509
    // (saved as { from, to } because the database can't store a list inside a list)
    areas: [
      { from: 515, to: 535 },
      { from: 500, to: 509 },
    ],
    zoneA: ['533', '534'], // near (within ~200 km); every other AP/Telangana pincode is zone B
    zoneCEnabled: false, // rest of India — switch on later from the admin panel
    // charge by total parcel weight (grams) for zones A / B / C
    rates: [
      { upTo: 200, A: 45, B: 50, C: 85 },
      { upTo: 500, A: 60, B: 75, C: 110 },
      { upTo: 1000, A: 80, B: 110, C: 165 },
      { upTo: 1500, A: 95, B: 145, C: 225 },
      { upTo: 2000, A: 115, B: 180, C: 285 },
    ],
    extraPer500: { A: 20, B: 35, C: 60 }, // each extra 500 g above the last slab
    packing: { small: 20, combo: 40, big: 0 }, // per order; big pieces include packing in their price
    freeMin: 1000, // free delivery from this subtotal…
    freePrefixes: ['533', '534', '520', '521', '530', '531'], // …for pincodes starting with these
  },
  pickup: {
    place: 'Pothavaram, Andhra Pradesh',
    instructions: 'After you order, we will message you on WhatsApp when your order is ready, with the pickup address and timing.',
  },
  contact: {
    whatsapp: '919390635033', // country code + number, no + or spaces
    phoneDisplay: '93906 35033',
    instagram: '', // full link, e.g. https://instagram.com/inviname.arts
    email: '',
  },
  payment: {
    upiId: '', // e.g. yourname@okicici — shown as a QR code at checkout
    upiName: 'Inviname Arts',
  },
  wholesale: { minPieces: 50, discountAt: 100, discountPct: 5, maxDesigns: 5 },
  // free photo uploads (cloudinary.com → Settings → Upload → an "unsigned" upload preset)
  cloudinary: { cloudName: '', uploadPreset: '' },
  trackingUrl: 'https://www.indiapost.gov.in/',
  theme: { plum: '#1E1219', blush: '#F3CFC6', rose: '#B76E79', gold: '#D4A857', cream: '#EDE3DF' },
}

export const DEFAULT_THEME = DEFAULT_SETTINGS.theme

/** Puts settings into effect across the site (WhatsApp number in all links, brand colours). */
export function applySettings(s) {
  SITE.whatsapp = String(s.contact.whatsapp || SITE.whatsapp).replace(/\D/g, '')
  SITE.phoneDisplay = s.contact.phoneDisplay || SITE.phoneDisplay
  SITE.instagram = s.contact.instagram || ''
  SITE.email = s.contact.email || ''
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    for (const [k, v] of Object.entries(s.theme || {})) {
      if (/^#[0-9a-f]{6}$/i.test(v) && v.toLowerCase() !== String(DEFAULT_THEME[k]).toLowerCase()) root.style.setProperty(`--color-${k}`, v)
      else root.style.removeProperty(`--color-${k}`)
    }
  }
}

// saved values on top of the defaults (one level deep: delivery, pickup, …)
export function withDefaults(saved = {}) {
  const out = { ...DEFAULT_SETTINGS }
  for (const [k, v] of Object.entries(saved)) out[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...DEFAULT_SETTINGS[k], ...v } : v
  return out
}

const store = createStore(async () => {
  let saved = null
  try {
    const f = await fb()
    if (f) {
      const snap = await f.F.getDoc(f.F.doc(f.db, 'settings', 'public'))
      saved = snap.exists() ? snap.data() : null
    }
  } catch {
    /* offline or not set up: use the defaults */
  }
  const s = withDefaults(saved || {})
  applySettings(s)
  return s
}, DEFAULT_SETTINGS)

export const loadSettings = store.load
export const refreshSettings = store.refresh
/** React hook: the shop settings (defaults straight away, so pages never wait). */
export const useSettings = store.use
