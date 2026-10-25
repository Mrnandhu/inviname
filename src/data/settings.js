// src/data/settings.js — shop rules the admin panel will edit (Phase 6): delivery areas, zones,
// charges by weight, packing, free delivery and pickup. Now these are the defaults from the brief;
// in Phase 4 they are read from Firestore, and pages keep working without any change.
import { useEffect, useState } from 'react'

export const DEFAULT_SETTINGS = {
  delivery: {
    // pincodes we deliver to, by their first 3 digits: Andhra Pradesh 515–535, Telangana 500–509
    areas: [
      [515, 535],
      [500, 509],
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
}

let cache = null
let loading = null

export function loadSettings() {
  if (cache) return Promise.resolve(cache)
  loading ||= Promise.resolve().then(() => (cache = DEFAULT_SETTINGS))
  return loading
}

/** React hook: the shop settings (defaults straight away, so pages never wait). */
export function useSettings() {
  const [s, setS] = useState(cache || DEFAULT_SETTINGS)
  useEffect(() => {
    if (!cache) loadSettings().then(setS)
  }, [])
  return s
}
