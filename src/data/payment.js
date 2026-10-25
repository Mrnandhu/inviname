// src/data/payment.js — how much is paid now and how much later.
//   Ready-made pieces: paid in full when ordering.
//   Custom (made-to-order) pieces: 50% advance when ordering, the other 50% when the piece is ready to dispatch.
//   Delivery & packing: paid with the first payment.
//   Pickup orders: the customer can pay online now, or pay at the pickup place when collecting
//   (custom pieces still need the 50% advance online, so we can start making them).
// The checkout (Phase 5) and the admin order check use this same function, so the numbers always match.
export const ADVANCE_SHARE = 0.5

//   Wholesale: 50% of the goods (after discount) + delivery & packing now, the rest before dispatch.
export function paymentSplit(lines, deliveryPacking = 0, { payAtPickup = false, wholesale = false, discount = 0 } = {}) {
  if (wholesale) {
    const goods = lines.reduce((s, l) => s + l.price * l.qty, 0) - discount
    const half = Math.ceil(goods * ADVANCE_SHARE)
    return { ready: 0, custom: goods, advance: half, hasCustom: true, payAtPickup: false, now: half + (deliveryPacking || 0), later: goods - half, atPickup: 0 }
  }
  const ready = lines.filter((l) => l.type !== 'custom').reduce((s, l) => s + l.price * l.qty, 0)
  const custom = lines.filter((l) => l.type === 'custom').reduce((s, l) => s + l.price * l.qty, 0)
  const advance = Math.ceil(custom * ADVANCE_SHARE)
  const extra = deliveryPacking || 0
  const base = { ready, custom, advance, hasCustom: custom > 0, payAtPickup }
  if (payAtPickup) {
    // only the custom advance online; everything else when collecting
    return { ...base, now: advance, later: 0, atPickup: ready + extra + (custom - advance) }
  }
  return { ...base, now: ready + advance + extra, later: custom - advance, atPickup: 0 }
}
