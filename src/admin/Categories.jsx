// src/admin/Categories.jsx — add, rename, reorder, hide or delete categories and change their photos
import { useEffect, useState } from 'react'
import { list, put, remove, newId, slugify } from './db.js'
import { Card, Field, Num, Toggle, SaveButton, ConfirmButton, ImageField } from './ui.jsx'
import { refreshCatalog } from '../data/catalog.js'
import { IconPlus } from '../components/Icons.jsx'

export default function Categories() {
  const [cats, setCats] = useState(null)
  const [counts, setCounts] = useState({})
  const [msg, setMsg] = useState('')
  const load = () => Promise.all([list('categories'), list('products')]).then(([c, p]) => {
    setCats(c.sort((a, b) => a.order - b.order))
    setCounts(Object.fromEntries(c.map((x) => [x.slug, p.filter((y) => y.category === x.slug).length])))
  })
  useEffect(() => {
    load()
  }, [])
  if (!cats) return <div className="skeleton h-64 rounded-3xl" />
  const set = (i, k, v) => setCats((all) => all.map((c, j) => (j === i ? { ...c, [k]: v } : c)))

  async function saveAll() {
    for (const c of cats) {
      if (!c.name.trim()) throw new Error('Every category needs a name.')
      const slug = c.slug || slugify(c.name)
      await put('categories', c.id, { slug, name: c.name.trim(), line: c.line || '', image: c.image || '', order: Number(c.order) || 0, active: !!c.active })
    }
    await load()
    refreshCatalog()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Lower “order” numbers show first. A category’s web address (slug) is fixed once it has products.</p>
      {cats.map((c, i) => (
        <Card key={c.id} className={c.active ? '' : 'opacity-70'}>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={c.name} onChange={(e) => set(i, 'name', e.target.value)} />
              <Field label="Short line" value={c.line || ''} onChange={(e) => set(i, 'line', e.target.value)} placeholder="e.g. Carry memories" />
              <Field label="Web address (slug)" value={c.slug} disabled={counts[c.slug] > 0} onChange={(e) => set(i, 'slug', slugify(e.target.value))} hint={`${counts[c.slug] || 0} products`} />
              <Num label="Order" value={c.order} onChange={(v) => set(i, 'order', v)} />
              <div className="sm:col-span-2"><Toggle label="Visible" checked={c.active} onChange={(v) => set(i, 'active', v)} /></div>
            </div>
            <div className="flex flex-col justify-between gap-3">
              <ImageField label="Photo" value={c.image} onChange={(v) => set(i, 'image', v)} folder="categories" />
              {counts[c.slug] > 0 ? (
                <p className="text-xs text-muted">To delete this category, first move or delete its {counts[c.slug]} products.</p>
              ) : (
                <ConfirmButton onConfirm={async () => { if (cats[i].saved !== false) await remove('categories', c.id).catch(() => {}); setCats((all) => all.filter((_, j) => j !== i)); refreshCatalog() }} className="self-start text-sm text-rose-light hover:underline">Delete category</ConfirmButton>
              )}
            </div>
          </div>
        </Card>
      ))}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setCats([...cats, { id: newId('c'), slug: '', name: '', line: '', image: '', order: (cats.at(-1)?.order || 0) + 1, active: true, saved: false }])} className="btn-ghost min-h-11 px-5"><IconPlus className="h-4 w-4" /> Add category</button>
        <SaveButton onSave={async () => { await saveAll(); setMsg('') }} label="Save all categories" />
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>
    </div>
  )
}
