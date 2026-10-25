// src/data/delivery.js — delivery & packing rules from the brief (section 8).
// All numbers come from settings (src/data/settings.js), so the admin panel can change them.
import { DEFAULT_SETTINGS } from './settings.js'

/**
 * Which delivery zone a pincode is in.
 * Returns 'A' | 'B' | 'C' when we deliver there, 'soon' when not yet, 'invalid' for a wrong pincode.
 */
export function deliveryZone(pin, settings = DEFAULT_SETTINGS) {
  const d = settings.delivery
  const p = String(pin || '').trim()
  if (!/^[1-9][0-9]{5}$/.test(p)) return 'invalid'
  const prefix = p.slice(0, 3)
  const n = Number(prefix)
  if (d.areas.some((a) => n >= Number(a.from) && n <= Number(a.to))) return d.zoneA.includes(prefix) ? 'A' : 'B'
  return d.zoneCEnabled ? 'C' : 'soon'
}

/** Simple version for the product page: 'ok' | 'soon' | 'invalid' */
export function deliveryArea(pin, settings) {
  const z = deliveryZone(pin, settings)
  return z === 'A' || z === 'B' || z === 'C' ? 'ok' : z
}

/** Delivery charge for a parcel weight (grams) in a zone. */
export function rateFor(weight, zone, settings = DEFAULT_SETTINGS) {
  const { rates, extraPer500 } = settings.delivery
  const slab = rates.find((r) => weight <= r.upTo)
  if (slab) return slab[zone]
  const last = rates[rates.length - 1]
  return last[zone] + Math.ceil((weight - last.upTo) / 500) * extraPer500[zone]
}

/** Packing charge for the whole order: any combo → combo price, else any small → small price, else (only big pieces) → 0. */
export function packingFor(lines, settings = DEFAULT_SETTINGS) {
  const p = settings.delivery.packing
  if (!lines.length) return 0
  if (lines.some((l) => l.packingType === 'combo')) return p.combo
  if (lines.some((l) => l.packingType === 'small')) return p.small
  return p.big
}

/**
 * Works out the cart totals.
 * lines: [{ price, weight, qty, packingType }]   method: 'home' | 'pickup'
 * discount: wholesale discount in ₹   noFree: true for wholesale (no free delivery)
 */
export function quote({ lines, pin, method = 'home', settings = DEFAULT_SETTINGS, discount = 0, noFree = false }) {
  const d = settings.delivery
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const weight = lines.reduce((s, l) => s + l.weight * l.qty, 0)
  const packing = packingFor(lines, settings)
  const zone = method === 'pickup' ? null : deliveryZone(pin, settings)
  const deliverable = method === 'pickup' || ['A', 'B', 'C'].includes(zone)

  // free delivery: big enough order AND a pincode on the free list (home delivery only)
  const freeArea = !noFree && method === 'home' && deliverable && d.freePrefixes.includes(String(pin).slice(0, 3))
  const free = freeArea && subtotal >= d.freeMin
  const toFree = freeArea && !free ? d.freeMin - subtotal : 0

  let delivery = 0
  if (method === 'home' && deliverable) delivery = rateFor(weight, zone, settings)
  const deliveryPacking = !lines.length ? 0 : free ? 0 : method === 'pickup' ? packing : deliverable ? delivery + packing : null

  return {
    subtotal,
    weight,
    zone,
    deliverable,
    delivery,
    packing,
    deliveryPacking, // null = we can't work it out yet (no pincode / area not served)
    free,
    toFree,
    discount,
    total: subtotal - discount + (deliveryPacking || 0),
  }
}
