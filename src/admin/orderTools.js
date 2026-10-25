// src/admin/orderTools.js — checks the admin panel runs on orders
import { PENDING } from '../data/orders.js'
import { quote } from '../data/delivery.js'
import { paymentSplit } from '../data/payment.js'

/** An order needs you when a customer has sent a UTR that you haven't verified yet. */
export const needsAction = (o) => (o.payments || []).some((p) => !p.verified) || (o.status === PENDING && (o.payments || []).length > 0)

/**
 * Works the order out again from TODAY's products and settings and compares it with what the
 * customer's browser saved — catches tampered prices (or prices you changed after they ordered).
 */
export function recalc(o, products, settings) {
  const issues = []
  const lines = o.items.map((it) => {
    const p = products.find((x) => x.id === it.productId)
    const v = p?.variants?.find((x) => x.name === it.variant)
    if (!p || !v) {
      issues.push(`${it.name} (${it.variant}) is no longer in your products — price not checked.`)
      return { ...it }
    }
    const unit = Number(o.kind === 'wholesale' ? v.wholesale : v.price)
    if (unit !== Number(it.price)) issues.push(`${it.name} (${it.variant}): order says ₹${it.price}, product price is ₹${unit}.`)
    return { ...it, price: unit, weight: Number(v.weight) || it.weight, packingType: p.packingType, type: p.type }
  })
  const W = settings.wholesale
  const pieces = lines.reduce((n, l) => n + l.qty, 0)
  const goods = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const discount = o.kind === 'wholesale' && pieces >= W.discountAt ? Math.round((goods * W.discountPct) / 100) : 0
  const q = quote({ lines, pin: o.pincode, method: o.method, settings, discount, noFree: o.kind === 'wholesale' })
  const pay = paymentSplit(lines, q.deliveryPacking, { payAtPickup: o.payWhere === 'pickup' && o.method === 'pickup', wholesale: o.kind === 'wholesale', discount })
  const expected = { subtotal: q.subtotal, discount, deliveryPacking: q.deliveryPacking ?? 0, total: q.total, payNow: pay.now, payLater: pay.later }
  for (const [k, label] of [['subtotal', 'Items'], ['deliveryPacking', 'Delivery & packing'], ['total', 'Total'], ['payNow', 'First payment']]) {
    if (Number(o.totals[k] || 0) !== Number(expected[k] || 0)) issues.push(`${label}: order says ₹${o.totals[k] || 0}, should be ₹${expected[k] || 0}.`)
  }
  return { ok: !issues.length, issues, expected }
}

export const waPhone = (p) => '91' + String(p || '').replace(/\D/g, '').slice(-10)
