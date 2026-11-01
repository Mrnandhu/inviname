// src/admin/Products.jsx — add, edit, hide and delete products: photos, sizes with retail / wholesale price
// and weight, colours, stock, making days, featured, wholesale allowed.
import { useEffect, useMemo, useState } from 'react'
import { list, put, remove, newId, slugify } from './db.js'
import { Card, Field, Area, Num, Toggle, Select, SaveButton, ConfirmButton, ImagesField } from './ui.jsx'
import { refreshCatalog, formatINR, img } from '../data/catalog.js'
import { IconPlus, IconClose } from '../components/Icons.jsx'
import ColourPicker from './ColourPicker.jsx'

const BLANK = {
  name: '', slug: '', category: '', description: '', care: '', images: [],
  variants: [{ name: 'Standard', price: 0, wholesale: 0, weight: 50 }], colours: [],
  type: 'ready-made', packingType: 'small', stock: 0, makingDays: 2,
  featured: false, wholesaleAllowed: true, active: true, needsPhoto: false,
}

export default function Products() {
  const [products, setProducts] = useState(null)
  const [cats, setCats] = useState([])
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const load = () => Promise.all([list('products'), list('categories')]).then(([p, c]) => {
    setProducts(p.sort((a, b) => a.name.localeCompare(b.name)))
    setCats(c.sort((a, b) => a.order - b.order))
  })
  useEffect(() => {
    load()
  }, [])
  const shown = useMemo(() => (products || []).filter((p) => (cat === 'all' || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())), [products, q, cat])

  if (!products) return <div className="skeleton h-64 rounded-3xl" />
  if (editing)
    return (
      <Editor
        product={editing}
        cats={cats}
        all={products}
        done={async (changed) => {
          setEditing(null)
          if (changed) {
            await load()
            refreshCatalog()
          }
        }}
      />
    )

  async function quick(p, k, v) {
    const next = { ...p, [k]: v }
    await put('products', p.id, next)
    setProducts((all) => all.map((x) => (x.id === p.id ? next : x)))
    refreshCatalog()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Search" value={q} onChange={(e) => setQ(e.target.value)} className="min-w-48 flex-1" />
        <Select label="Category" value={cat} onChange={setCat} options={[['all', 'All categories'], ...cats.map((c) => [c.slug, c.name])]} className="min-w-44" />
        <button type="button" onClick={() => setEditing({ ...BLANK, category: cats[0]?.slug || '' })} className="btn-rose min-h-12 px-6"><IconPlus className="h-4 w-4" /> Add product</button>
      </div>
      <p className="text-xs text-muted">{products.length} products · hidden ones are not shown in the shop.</p>
      <ul className="space-y-2">
        {shown.map((p) => {
          const prices = (p.variants || []).map((v) => Number(v.price))
          return (
            <li key={p.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border border-plum-line bg-plum-card/70 p-3 ${p.active ? '' : 'opacity-60'}`}>
              <img src={img(p.images?.[0], true) || '/favicon.svg'} alt="" className="h-14 w-14 rounded-xl bg-plum object-contain" />
              <button type="button" onClick={() => setEditing(p)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-cream hover:text-gold">{p.name}</span>
                <span className="block text-xs text-muted">
                  {cats.find((c) => c.slug === p.category)?.name || p.category} · {prices.length ? formatINR(Math.min(...prices)) : '—'}
                  {p.type === 'ready-made' ? ` · stock ${p.stock}` : ' · made to order'}
                </span>
              </button>
              <label className="flex items-center gap-2 text-xs text-muted">Featured <input type="checkbox" className="switch" checked={!!p.featured} onChange={(e) => quick(p, 'featured', e.target.checked)} /></label>
              <label className="flex items-center gap-2 text-xs text-muted">Visible <input type="checkbox" className="switch" checked={!!p.active} onChange={(e) => quick(p, 'active', e.target.checked)} /></label>
              <button type="button" onClick={() => setEditing(p)} className="btn-ghost min-h-10 px-4">Edit</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Editor({ product, cats, all, done }) {
  const isNew = !product.id
  const [p, setP] = useState({ ...BLANK, ...product })
  const [err, setErr] = useState('')
  const set = (k, v) => setP((o) => ({ ...o, [k]: v }))
  const setVariant = (i, k, v) => set('variants', p.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)))

  async function save() {
    const slug = slugify(p.slug || p.name)
    if (!p.name.trim()) throw new Error('Please enter a name.')
    if (!p.category) throw new Error('Please choose a category.')
    if (!p.variants.length || p.variants.some((v) => !v.name || !(Number(v.price) > 0))) throw new Error('Every size/option needs a name and a price.')
    if (all.some((x) => x.slug === slug && x.id !== p.id)) throw new Error('Another product already uses this web address (slug). Change the name or slug.')
    const id = p.id || newId('p')
    const data = {
      ...p,
      slug,
      name: p.name.trim(),
      variants: p.variants.map((v) => ({ name: v.name.trim(), price: Number(v.price), wholesale: v.wholesale === '' || v.wholesale == null || p.category === 'blood-art' ? null : Number(v.wholesale), weight: Number(v.weight) || 0 })),
      colours: p.colours.map((c) => c.trim()).filter(Boolean),
      stock: Number(p.stock) || 0,
      makingDays: Number(p.makingDays) || 1,
      createdAt: p.createdAt || new Date().toISOString().slice(0, 10),
    }
    await put('products', id, data)
    setErr('')
    done(true)
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => done(false)} className="text-sm text-gold hover:underline">← All products</button>
      <h2 className="font-serif text-3xl text-blush">{isNew ? 'New product' : p.name}</h2>

      <Card title="Basics">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={p.name} onChange={(e) => set('name', e.target.value)} />
          <Select label="Category" value={p.category} onChange={(v) => set('category', v)} options={cats.map((c) => [c.slug, c.name])} />
          <Field label="Web address (slug)" value={p.slug} onChange={(e) => set('slug', e.target.value)} placeholder={slugify(p.name) || 'made from the name'} hint={`inviname.in/product/${slugify(p.slug || p.name) || '…'}`} />
          <Select label="Type" value={p.type} onChange={(v) => set('type', v)} options={[['ready-made', 'Ready-made (in stock)'], ['custom', 'Made to order (custom)']]} />
          <Area label="Description" value={p.description} onChange={(e) => set('description', e.target.value)} className="sm:col-span-2" />
          <Area label="Care instructions (optional)" rows={2} value={p.care || ''} onChange={(e) => set('care', e.target.value)} className="sm:col-span-2" />
        </div>
      </Card>

      <Card title="Photos">
        <ImagesField value={p.images} onChange={(v) => set('images', v)} />
      </Card>

      <Card title="Sizes / options and prices">
        <div className="space-y-2">
          {p.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
              <Field label="Size / option" value={v.name} onChange={(e) => setVariant(i, 'name', e.target.value)} placeholder="e.g. 8 inch, Pair, 2.6" className="col-span-2 sm:col-span-1" />
              <Num label="Price ₹" value={v.price} onChange={(x) => setVariant(i, 'price', x)} />
              <Num label="Wholesale ₹" value={v.wholesale ?? ''} onChange={(x) => setVariant(i, 'wholesale', x)} placeholder="blank = no" />
              <Num label="Packed weight (g)" value={v.weight} onChange={(x) => setVariant(i, 'weight', x)} />
              <button type="button" onClick={() => set('variants', p.variants.filter((_, j) => j !== i))} disabled={p.variants.length === 1} className="grid h-12 w-12 place-items-center rounded-full border border-plum-line text-muted hover:text-rose-light disabled:opacity-30" aria-label="Remove option">
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set('variants', [...p.variants, { name: '', price: p.variants[0]?.price || 0, wholesale: p.variants[0]?.wholesale ?? 0, weight: p.variants[0]?.weight || 50 }])} className="btn-ghost mt-3 min-h-10 px-4"><IconPlus className="h-4 w-4" /> Add size / option</button>
        <ColourPicker value={p.colours} onChange={(v) => set('colours', v)} />
      </Card>

      <Card title="Stock, packing and display">
        <div className="grid gap-3 sm:grid-cols-3">
          {p.type === 'ready-made' && <Num label="Pieces in stock" value={p.stock} onChange={(v) => set('stock', v)} />}
          <Num label="Making days" value={p.makingDays} onChange={(v) => set('makingDays', v)} />
          <Select label="Packing" value={p.packingType} onChange={(v) => set('packingType', v)} options={[['small', 'Small item'], ['combo', 'Combo / set'], ['big', 'Big (photo art, clocks) – packing included']]} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Toggle label="Visible in the shop" checked={p.active} onChange={(v) => set('active', v)} />
          <Toggle label="Featured (Best Sellers)" checked={p.featured} onChange={(v) => set('featured', v)} />
          <Toggle label="Allowed for wholesale" checked={p.wholesaleAllowed && p.category !== 'blood-art'} onChange={(v) => set('wholesaleAllowed', v)} />
          {p.type === 'custom' && <Toggle label="Customer must upload a photo" checked={p.needsPhoto ?? ['photo-art', 'wall-clocks'].includes(p.category)} onChange={(v) => set('needsPhoto', v)} />}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton onSave={save} label={isNew ? 'Add product' : 'Save product'} />
        <button type="button" onClick={() => done(false)} className="btn-ghost min-h-11 px-5">Cancel</button>
        {!isNew && (
          <ConfirmButton onConfirm={async () => { await remove('products', p.id); done(true) }} className="ml-auto min-h-11 rounded-full px-5 text-sm text-rose-light hover:bg-rose/10">
            Delete product
          </ConfirmButton>
        )}
        {err && <span className="text-sm text-rose-light">{err}</span>}
      </div>
      <p className="text-xs text-muted">Tip: to stop selling something for a while, switch off “Visible” instead of deleting it.</p>
    </div>
  )
}
