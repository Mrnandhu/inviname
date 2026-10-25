// src/admin/Reviews.jsx — add the real reviews customers send you (WhatsApp, Instagram …) to show on the home page
import { useEffect, useState } from 'react'
import { list, put, remove, newId } from './db.js'
import { Card, Field, Area, Toggle, SaveButton, ConfirmButton } from './ui.jsx'
import { refreshReviews } from '../data/reviews.js'
import { IconPlus } from '../components/Icons.jsx'

export default function Reviews() {
  const [rows, setRows] = useState(null)
  const load = () => list('reviews').then((r) => setRows(r.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))))
  useEffect(() => {
    load()
  }, [])
  if (!rows) return <div className="skeleton h-48 rounded-3xl" />
  const set = (i, k, v) => setRows((all) => all.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Only add reviews that real customers gave you. They appear on the home page when “Show” is on.</p>
      {rows.map((r, i) => (
        <Card key={r.id}>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
            <Field label="Customer name" value={r.name} onChange={(e) => set(i, 'name', e.target.value)} />
            <Field label="Place / product (optional)" value={r.place || ''} onChange={(e) => set(i, 'place', e.target.value)} placeholder="e.g. Kakinada · Photo frame" />
            <label className="block text-sm text-muted">Stars
              <select value={r.rating || 5} onChange={(e) => set(i, 'rating', Number(e.target.value))} className="select mt-1 w-full rounded-2xl">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}</select>
            </label>
            <Area label="Review" rows={3} value={r.text} onChange={(e) => set(i, 'text', e.target.value)} className="sm:col-span-3" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="min-w-56"><Toggle label="Show on website" checked={r.active} onChange={(v) => set(i, 'active', v)} /></div>
            <SaveButton onSave={async () => { if (!r.name || !r.text) throw new Error('Name and review are needed.'); await put('reviews', r.id, { name: r.name.trim(), place: r.place || '', text: r.text.trim(), rating: r.rating || 5, active: !!r.active, createdAt: r.createdAt || new Date().toISOString() }); refreshReviews() }} label="Save" />
            <ConfirmButton onConfirm={async () => { await remove('reviews', r.id).catch(() => {}); setRows((all) => all.filter((_, j) => j !== i)); refreshReviews() }} className="ml-auto text-sm text-rose-light hover:underline">Delete</ConfirmButton>
          </div>
        </Card>
      ))}
      <button type="button" onClick={() => setRows([{ id: newId('r'), name: '', place: '', text: '', rating: 5, active: true }, ...rows])} className="btn-rose min-h-11 px-5"><IconPlus className="h-4 w-4" /> Add review</button>
    </div>
  )
}
