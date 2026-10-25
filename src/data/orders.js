// src/data/orders.js — placing orders (IDs INV-1001, INV-1002 …), reading them, and payment steps.
// Prices in an order are only what the customer's browser sent; the admin page always recalculates them
// from the catalog and shows any difference before an order is marked paid.
import { fb } from '../firebase/index.js'

export const PENDING = 'Payment pending verification'
export const PAY_AT_PICKUP = 'Confirmed (pay at pickup)'
export const CANCELLED = 'Cancelled'

/** The steps an order goes through, depending on what was ordered and how it is delivered. */
export function flowFor(o) {
  const pickup = o.method === 'pickup'
  const end = pickup ? ['Ready for pickup', 'Picked up'] : ['Ready to ship', 'Shipped', 'Delivered']
  if (o.payWhere === 'pickup' && !(o.totals?.payNow > 0)) return [PAY_AT_PICKUP, 'Ready for pickup', 'Picked up']
  if (o.kind === 'blood') return [PENDING, 'Advance paid', 'Waiting for sample', 'Sample received', 'Making', 'Balance pending', ...end]
  if (o.kind === 'custom' || o.kind === 'wholesale') return [PENDING, 'Advance paid', 'Making', 'Balance pending', ...end]
  return [PENDING, 'Paid', 'Packed', ...end]
}

/** Status after the first payment is verified, and after the balance is verified. */
export const afterFirstPayment = (o) => (['blood', 'custom', 'wholesale'].includes(o.kind) ? 'Advance paid' : 'Paid')
export const afterBalance = (o) => (o.method === 'pickup' ? 'Ready for pickup' : 'Ready to ship')

const now = () => new Date().toISOString()
const clean = (v) => JSON.parse(JSON.stringify(v ?? null)) // drop undefined values (the database refuses them)

/**
 * Creates the order and gives it the next number (INV-1001, INV-1002 …) in one safe step.
 * Returns the order ID.
 */
export async function placeOrder({ user, customer, lines, method, payWhere, q, pay, wholesale }) {
  const f = await fb()
  if (!f) throw new Error('Orders are not set up yet.')
  const { F, db } = f
  const hasBlood = lines.some((l) => l.category === 'blood-art')
  const hasCustom = lines.some((l) => l.type === 'custom')
  const kind = wholesale ? 'wholesale' : hasBlood ? 'blood' : hasCustom ? 'custom' : 'retail'
  const status = pay.now > 0 ? PENDING : PAY_AT_PICKUP
  const data = clean({
    uid: user.uid,
    email: user.email || '',
    customer,
    items: lines.map((l) => ({
      productId: l.productId,
      slug: l.slug,
      name: l.name,
      image: l.image || '',
      category: l.category || '',
      variant: l.variant,
      colour: l.colour || '',
      price: l.price,
      qty: l.qty,
      weight: l.weight,
      type: l.type,
      packingType: l.packingType,
      custom: l.custom || null,
    })),
    method,
    payWhere: method === 'pickup' ? payWhere : 'online',
    pincode: customer.pincode || '',
    kind,
    hasBlood,
    totals: {
      subtotal: q.subtotal,
      discount: q.discount || 0,
      deliveryPacking: q.deliveryPacking || 0,
      total: q.total,
      payNow: pay.now,
      payLater: pay.later,
      payAtPickup: pay.atPickup || 0,
    },
    status,
    payments: [],
    history: [{ status, at: now() }],
    tracking: '',
    createdAt: now(),
    updatedAt: now(),
  })

  return F.runTransaction(db, async (tx) => {
    const counterRef = F.doc(db, 'counters', 'orders')
    const c = await tx.get(counterRef)
    const n = c.exists() ? c.data().next : 1001
    const id = `INV-${n}`
    tx.set(counterRef, { next: n + 1 })
    tx.set(F.doc(db, 'orders', id), { ...data, number: n })
    // lets this customer read the blood-sample mailing address (see firestore.rules)
    if (hasBlood) tx.set(F.doc(db, 'bloodAccess', user.uid), { orderId: id })
    return id
  })
}

export async function getOrder(id) {
  const f = await fb()
  if (!f) return null
  const snap = await f.F.getDoc(f.F.doc(f.db, 'orders', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function myOrders(uid) {
  const f = await fb()
  if (!f) return []
  const snap = await f.F.getDocs(f.F.query(f.F.collection(f.db, 'orders'), f.F.where('uid', '==', uid)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Customer sends the UPI transaction ID (UTR) for a payment. The admin verifies it in the bank app. */
export async function submitPayment(order, { stage, amount, utr, screenshot = '' }) {
  const f = await fb()
  const payments = [...(order.payments || []), { stage, amount, utr, screenshot, at: now(), verified: false }]
  await f.F.updateDoc(f.F.doc(f.db, 'orders', order.id), { payments, updatedAt: now() })
  return { ...order, payments }
}

/** The blood-sample mailing address (only readable by customers with a blood-art order, and admins). */
export async function bloodSampleAddress() {
  const f = await fb()
  if (!f) return ''
  try {
    const snap = await f.F.getDoc(f.F.doc(f.db, 'settings', 'private'))
    return snap.exists() ? snap.data().bloodSampleAddress || '' : ''
  } catch {
    return ''
  }
}

/** UPI payment link (opens GPay / PhonePe / Paytm on phones; the same text is shown as a QR code). */
export function upiLink({ upiId, upiName, amount, note }) {
  const p = new URLSearchParams({ pa: upiId, pn: upiName || 'Inviname Arts', am: Number(amount).toFixed(2), cu: 'INR', tn: note })
  return `upi://pay?${p.toString().replace(/\+/g, '%20')}`
}

export const isUtr = (v) => /^\d{12}$/.test(String(v).trim())

/** What is still to pay for an order, and at which stage. */
export function nextPayment(o) {
  const paid = (stage) => (o.payments || []).some((p) => p.stage === stage)
  if (o.status === CANCELLED) return null
  if (o.status === PENDING && o.totals.payNow > 0 && !paid('first')) return { stage: 'first', amount: o.totals.payNow }
  if (o.status === 'Balance pending' && o.totals.payLater > 0 && !paid('balance')) return { stage: 'balance', amount: o.totals.payLater }
  return null
}
