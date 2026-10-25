// src/admin/WholesaleApps.jsx — approve or reject shops that apply for wholesale
import { useEffect, useState } from 'react'
import { list, patch } from './db.js'
import { Card } from './ui.jsx'
import { waPhone } from './orderTools.js'
import { IconWhatsApp } from '../components/Icons.jsx'

export default function WholesaleApps() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    list('wholesaleApplications').then((r) => setRows(r.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))))
  }, [])
  if (!rows) return <div className="skeleton h-48 rounded-3xl" />
  if (!rows.length) return <p className="rounded-3xl border border-plum-line p-6 text-sm text-muted">No applications yet.</p>
  async function setStatus(r, status) {
    await patch('wholesaleApplications', r.id, { status })
    setRows((all) => all.map((x) => (x.id === r.id ? { ...x, status } : x)))
  }
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-lg text-cream">{r.shopName}</p>
              <p className="text-muted">{r.ownerName} · {r.phone} · {r.city}{r.gst ? ` · GST ${r.gst}` : ''}</p>
              <p className="text-xs text-muted">Applied {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <span className={`badge ${r.status === 'approved' ? 'bg-gold text-plum' : r.status === 'rejected' ? 'bg-rose text-white' : 'border border-gold/40 text-gold'}`}>{r.status}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {r.status !== 'approved' && <button type="button" onClick={() => setStatus(r, 'approved')} className="btn-rose min-h-10 px-4">Approve</button>}
            {r.status !== 'rejected' && <button type="button" onClick={() => setStatus(r, 'rejected')} className="btn-ghost min-h-10 px-4">Reject</button>}
            <a href={`https://wa.me/${waPhone(r.phone)}?text=${encodeURIComponent(`Hi ${r.ownerName}, this is Inviname Arts. ${r.status === 'approved' ? 'Your wholesale account is approved! Log in and switch on Wholesale mode in your cart to see wholesale prices.' : 'Thank you for your wholesale application.'}`)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost min-h-10 px-4"><IconWhatsApp className="h-4 w-4 text-[#25D366]" /> Message</a>
          </div>
        </Card>
      ))}
    </div>
  )
}
