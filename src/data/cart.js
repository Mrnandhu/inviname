// src/data/cart.js — the shopping cart. Saved on this phone/computer for guests; after login it is also
// saved to the customer's account (Firestore "carts") and merged, so it follows them to other devices.
// Prices stored here are only for showing; the real total is always worked out again from the catalog.
import { useSyncExternalStore } from 'react'
import { fb } from '../firebase/index.js'

const KEY = 'inv-cart-v1'
const subs = new Set()

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
let items = read()

let saveRemote = null // set while a customer is logged in

function commit(next) {
  items = next
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
  subs.forEach((f) => f())
  saveRemote?.()
}

/** After login: merge this device's cart with the one saved in the account, and keep saving changes. */
export async function attachCartToAccount(uid) {
  const f = await fb()
  if (!f) return
  const ref = f.F.doc(f.db, 'carts', uid)
  const snap = await f.F.getDoc(ref)
  const saved = snap.exists() && Array.isArray(snap.data().items) ? snap.data().items : []
  const merged = [...items]
  for (const it of saved) {
    const i = merged.findIndex((m) => m.key === it.key)
    if (i < 0) merged.push(it)
    else merged[i] = { ...merged[i], qty: Math.max(merged[i].qty, it.qty) } // same item on both: keep the larger amount, don't double it
  }
  let timer = 0
  saveRemote = () => {
    clearTimeout(timer)
    timer = setTimeout(() => f.F.setDoc(ref, { items, updatedAt: f.F.serverTimestamp() }).catch(() => {}), 700)
  }
  commit(merged)
}

/** After logout: stop saving to the account and empty the cart on this device (safer on shared phones). */
export function detachCart() {
  if (!saveRemote) return
  saveRemote = null
  commit([])
}

const lineKey = (productId, variant, colour) => `${productId}|${variant}|${colour || ''}`

/**
 * Add a product (with chosen size/option and colour) to the cart.
 * custom: details for made-to-order pieces ({ photos, text, date, notes }) — each custom request is its own line.
 */
export function addToCart({ product, variant, colour, qty = 1, custom = null }) {
  const key = lineKey(product.id, variant.name, colour) + (custom ? '|' + Date.now().toString(36) : '')
  const max = product.type === 'custom' ? 20 : Math.max(0, product.stock)
  const found = !custom && items.find((i) => i.key === key)
  if (found) {
    commit(items.map((i) => (i.key === key ? { ...i, qty: Math.min(max, i.qty + qty) } : i)))
  } else {
    commit([
      ...items,
      {
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        variant: variant.name,
        colour: colour || '',
        price: variant.price,
        weight: variant.weight,
        type: product.type,
        packingType: product.packingType,
        qty: Math.min(max, qty),
        ...(custom ? { custom } : {}),
      },
    ])
  }
}

export function setQty(key, qty) {
  commit(qty <= 0 ? items.filter((i) => i.key !== key) : items.map((i) => (i.key === key ? { ...i, qty } : i)))
}
export const removeFromCart = (key) => commit(items.filter((i) => i.key !== key))
export const clearCart = () => commit([])

function subscribe(f) {
  subs.add(f)
  // keep several open tabs in sync
  const onStorage = (e) => e.key === KEY && ((items = read()), f())
  window.addEventListener('storage', onStorage)
  return () => {
    subs.delete(f)
    window.removeEventListener('storage', onStorage)
  }
}

/** React hook: the cart items (updates everywhere when something is added). */
export const useCart = () => useSyncExternalStore(subscribe, () => items, () => items)
export const cartCount = (list) => list.reduce((n, i) => n + i.qty, 0)
