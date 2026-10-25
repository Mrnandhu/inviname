// src/data/cart.js — the shopping cart, saved on this phone/computer so it survives closing the page.
// Phase 3 adds the cart page and delivery charges; Phase 4 merges it with the customer's account.
// Prices stored here are only for showing; the real total is always worked out again from the catalog.
import { useSyncExternalStore } from 'react'

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

function commit(next) {
  items = next
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
  subs.forEach((f) => f())
}

const lineKey = (productId, variant, colour) => `${productId}|${variant}|${colour || ''}`

/** Add a product (with chosen size/option and colour) to the cart. */
export function addToCart({ product, variant, colour, qty = 1 }) {
  const key = lineKey(product.id, variant.name, colour)
  const max = product.type === 'custom' ? 20 : Math.max(0, product.stock)
  const found = items.find((i) => i.key === key)
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
