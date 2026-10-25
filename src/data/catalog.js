// src/data/catalog.js — the ONE place every page gets categories, products, prices and photos from.
// It reads the online database (Firestore "categories" and "products"), which the admin panel edits.
// While testing on your computer before the data is uploaded, it shows the sample products instead.
import { createStore } from '../lib/store.js'
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from './sampleCatalog.js'
import { fb } from '../firebase/index.js'

function prepare(categories, products) {
  const cats = categories.filter((c) => c.active).map((c) => ({ ...c })).sort((a, b) => a.order - b.order)
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]))
  const prods = products
    .map((p) => ({ images: [], colours: [], variants: [], stock: 0, makingDays: 3, createdAt: '', ...p }))
    .filter((p) => p.active && catBySlug[p.category] && p.variants.length)
    .map((p) => {
      const prices = p.variants.map((x) => Number(x.price) || 0)
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

async function fromDatabase() {
  const f = await fb()
  if (!f) return null
  const { F, db } = f
  const active = (name) => F.getDocs(F.query(F.collection(db, name), F.where('active', '==', true)))
  const [cs, ps] = await Promise.all([active('categories'), active('products')])
  return {
    categories: cs.docs.map((d) => ({ ...d.data(), id: d.id })),
    products: ps.docs.map((d) => ({ ...d.data(), id: d.id })),
  }
}

const store = createStore(async () => {
  let data = null
  try {
    data = await fromDatabase()
  } catch (e) {
    console.warn('Could not load products from the database:', e?.code || e)
  }
  // Sample products are only used on your computer (npm run dev) until the real data is uploaded.
  const useSample = !data || (!data.categories.length && import.meta.env.DEV)
  const c = useSample ? prepare(SAMPLE_CATEGORIES, SAMPLE_PRODUCTS) : prepare(data.categories, data.products)
  c.source = useSample ? 'sample' : 'database'
  return c
})

/** Loads the catalog once and keeps it for the whole visit. */
export const loadCatalog = store.load
/** Load again (the admin panel calls this after saving changes). */
export const refreshCatalog = store.refresh
/** React hook: returns { categories, products, catBySlug } or null while loading. */
export const useCatalog = store.use

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
