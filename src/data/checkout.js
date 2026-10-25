// src/data/checkout.js — everything the cart and checkout pages share: delivery or pickup, pincode,
// how to pay at pickup, wholesale mode, fresh prices from the catalog, totals and anything blocking checkout.
import { useSyncExternalStore } from 'react'
import { useCatalog } from './catalog.js'
import { useCart } from './cart.js'
import { useSettings } from './settings.js'
import { useWholesale } from './wholesale.js'
import { quote, deliveryZone } from './delivery.js'
import { paymentSplit } from './payment.js'

// ---- remembered choices (pincode, delivery method …), shared live between pages ----
const KEYS = { pin: 'inv-pin', method: 'inv-delivery-method', payWhere: 'inv-pay-where', wholesaleMode: 'inv-wholesale-mode' }
const DEFAULTS = { pin: '', method: 'home', payWhere: 'online', wholesaleMode: '' }
const read = () => {
  const o = { ...DEFAULTS }
  try {
    for (const [k, key] of Object.entries(KEYS)) o[k] = localStorage.getItem(key) ?? DEFAULTS[k]
  } catch {}
  return o
}
let prefs = read()
const subs = new Set()
export function setPref(k, v) {
  prefs = { ...prefs, [k]: v }
  try {
    localStorage.setItem(KEYS[k], v)
  } catch {}
  subs.forEach((f) => f())
}
const usePrefs = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => prefs,
    () => prefs,
  )

export function useCheckout() {
  const cat = useCatalog()
  const items = useCart()
  const settings = useSettings()
  const { approved } = useWholesale()
  const p = usePrefs()
  const wholesale = approved && p.wholesaleMode === '1'
  const W = settings.wholesale

  const lines = !cat
    ? []
    : items.map((it) => {
        const prod = cat.products.find((x) => x.id === it.productId)
        const v = prod?.variants.find((x) => x.name === it.variant)
        if (!prod || !v) return { ...it, gone: true }
        const max = prod.type === 'custom' ? 20 : prod.stock
        const ineligible = wholesale && (prod.type === 'custom' || !prod.wholesaleAllowed || v.wholesale == null)
        return {
          ...it,
          name: prod.name,
          slug: prod.slug,
          image: prod.image,
          category: prod.category,
          price: wholesale && !ineligible ? Number(v.wholesale) : Number(v.price),
          retailPrice: Number(v.price),
          weight: Number(v.weight) || 0,
          packingType: prod.packingType,
          type: prod.type,
          max: wholesale ? 10000 : max,
          gone: !wholesale && max <= 0,
          ineligible,
        }
      })
  const live = lines.filter((l) => !l.gone && !l.ineligible)
  const pieces = live.reduce((n, l) => n + l.qty, 0)
  const designs = new Set(live.map((l) => l.productId)).size
  const goods = live.reduce((s, l) => s + l.price * l.qty, 0)
  const discount = wholesale && pieces >= W.discountAt ? Math.round((goods * W.discountPct) / 100) : 0

  const method = p.method === 'pickup' ? 'pickup' : 'home'
  const q = quote({ lines: live, pin: p.pin, method, settings, discount, noFree: wholesale })
  const zone = method === 'home' ? deliveryZone(p.pin, settings) : null
  const payAtPickup = !wholesale && method === 'pickup' && p.payWhere === 'pickup'
  const pay = paymentSplit(live, q.deliveryPacking, { payAtPickup, wholesale, discount })

  const problems = []
  if (lines.some((l) => l.ineligible)) problems.push('Custom, blood art and some pieces are not available for wholesale. Remove them or switch off wholesale mode.')
  if (wholesale && pieces < W.minPieces) problems.push(`Wholesale orders need at least ${W.minPieces} pieces (you have ${pieces}).`)
  if (wholesale && designs > W.maxDesigns) problems.push(`Wholesale orders can mix up to ${W.maxDesigns} designs (you have ${designs}).`)
  const canCheckout = live.length > 0 && (method === 'pickup' || q.deliverable) && !problems.length

  return {
    ready: !!cat,
    items,
    lines,
    live,
    pieces,
    designs,
    q,
    pay,
    zone,
    method,
    pin: p.pin,
    payWhere: p.payWhere,
    payAtPickup,
    wholesale,
    wholesaleApproved: approved,
    discount,
    problems,
    canCheckout,
    settings,
    setPin: (v) => setPref('pin', v),
    setMethod: (v) => setPref('method', v),
    setPayWhere: (v) => setPref('payWhere', v),
    setWholesaleMode: (on) => setPref('wholesaleMode', on ? '1' : ''),
  }
}
