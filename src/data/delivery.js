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

/** The free-delivery area (Pothavaram / within 10 km / within 30 km) a pincode belongs to, or null. */
export function freeTierFor(pin, settings = DEFAULT_SETTINGS) {
  const p = String(pin || '').trim()
  if (!/^[1-9][0-9]{5}$/.test(p)) return null
  const tiers = (settings.delivery.freeTiers || []).filter((t) => String(t.pins || '').split(/[\s,]+/).includes(p))
  return tiers.sort((a, b) => Number(a.min) - Number(b.min))[0] || null
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
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const weight = lines.reduce((s, l) => s + l.weight * l.qty, 0)
  const packing = packingFor(lines, settings)
  const zone = method === 'pickup' ? null : deliveryZone(pin, settings)
  const deliverable = method === 'pickup' || ['A', 'B', 'C'].includes(zone)

  // free delivery: a pincode in one of the free areas AND the order is big enough for that area (home delivery only)
  const tier = !noFree && method === 'home' && deliverable ? freeTierFor(pin, settings) : null
  const freeMin = tier ? Number(tier.min) || 0 : 0
  const free = !!tier && subtotal >= freeMin
  const toFree = tier && !free ? freeMin - subtotal : 0

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
    freeMin, // the minimum for this pincode's free-delivery area (0 = no free delivery here)
    freeArea: tier?.name || '',
    discount,
    total: subtotal - discount + (deliveryPacking || 0),
  }
}
