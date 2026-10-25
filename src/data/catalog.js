// src/data/catalog.js — the ONE place every page gets categories, products, prices and photos from.
// Now it reads the sample data; in Phase 4 only this file changes to read from Firestore, and the
// admin panel (Phase 6) edits that same data. Pages never hard-code products.
import { useEffect, useState } from 'react'
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from './sampleCatalog.js'

let cache = null
let loading = null

function prepare(categories, products) {
  const cats = categories.filter((c) => c.active).map((c) => ({ ...c })).sort((a, b) => a.order - b.order)
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]))
  const prods = products
    .filter((p) => p.active && catBySlug[p.category])
    .map((p) => {
      const prices = p.variants.map((x) => x.price)
      return {
        ...p,
        categoryName: catBySlug[p.category].name,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        // custom pieces are made for you, so they are always available
        available: p.type === 'custom' || p.stock > 0,
        image: p.images[0] || '',
      }
    })
  // count products per category (for the filter list)
  for (const c of cats) c.count = prods.filter((p) => p.category === c.slug).length
  return { categories: cats, products: prods, catBySlug }
}

/** Loads the catalog once and keeps it for the whole visit. */
export function loadCatalog() {
  if (cache) return Promise.resolve(cache)
  loading ||= Promise.resolve().then(() => (cache = prepare(SAMPLE_CATEGORIES, SAMPLE_PRODUCTS)))
  return loading
}

/** React hook: returns { categories, products, catBySlug } or null while loading. */
export function useCatalog() {
  const [data, setData] = useState(cache)
  useEffect(() => {
    if (!cache) loadCatalog().then(setData)
  }, [])
  return data
}

/** ₹1,299 style prices */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const formatINR = (n) => inr.format(n)

/**
 * Picture URL at the right size. Local pictures have a small "-sm" copy for phones;
 * Cloudinary pictures (from the admin panel later) are resized by Cloudinary automatically.
 */
export function img(url, small = false) {
  if (!url) return ''
  if (url.includes('res.cloudinary.com/') && url.includes('/upload/')) return url.replace('/upload/', `/upload/f_auto,q_auto,w_${small ? 600 : 1200}/`)
  if (small && url.startsWith('/images/') && !url.includes('-sm.')) return url.replace(/\.(webp|png|jpe?g)$/, '-sm.$1')
  return url
}

/** "Made in 2 days" style text */
export const makingText = (p) =>
  p.type === 'custom' ? `Made to order in ${p.makingDays} days` : p.stock > 0 ? `Ready to ship in ${p.makingDays} ${p.makingDays === 1 ? 'day' : 'days'}` : 'Out of stock'
