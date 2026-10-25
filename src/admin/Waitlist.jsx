// src/admin/Waitlist.jsx — WhatsApp numbers of people outside your delivery area (download as CSV)
import { useEffect, useState } from 'react'
import { list, remove } from './db.js'
import { downloadCsv, ConfirmButton } from './ui.jsx'

export default function Waitlist() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    list('waitlist').then((r) => setRows(r.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))))
  }, [])
  if (!rows) return <div className="skeleton h-48 rounded-3xl" />
  const when = (v) => (v?.toDate ? v.toDate() : new Date(v)).toLocaleDateString('en-IN')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">{rows.length} people want delivery to their area.</p>
        <button type="button" disabled={!rows.length} onClick={() => downloadCsv('inviname-waitlist.csv', [['WhatsApp', 'Pincode', 'Date'], ...rows.map((r) => [r.phone, r.pincode, when(r.createdAt)])])} className="btn-rose ml-auto min-h-11 px-5 disabled:opacity-50">Download CSV</button>
      </div>
      <ul className="divide-y divide-plum-line rounded-3xl border border-plum-line bg-plum-card/70">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
            <span className="text-cream">{r.phone}</span>
            <span className="text-muted">{r.pincode}</span>
            <span className="text-xs text-muted">{when(r.createdAt)}</span>
            <ConfirmButton onConfirm={async () => { await remove('waitlist', r.id); setRows((a) => a.filter((x) => x.id !== r.id)) }} className="ml-auto text-xs text-rose-light hover:underline">Delete</ConfirmButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
