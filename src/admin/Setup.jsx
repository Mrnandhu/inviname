// src/admin/Setup.jsx — one-time setup: upload the sample categories, products and settings,
// and start order numbers at INV-1001.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fb } from '../firebase/index.js'
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../data/sampleCatalog.js'
import { DEFAULT_SETTINGS, refreshSettings } from '../data/settings.js'
import { refreshCatalog } from '../data/catalog.js'
import { Card } from './ui.jsx'
import { IconCheck } from '../components/Icons.jsx'

export default function Setup() {
  const [counts, setCounts] = useState(null)
  const [state, setState] = useState('idle')
  const [msg, setMsg] = useState('')

  async function count() {
    const f = await fb()
    const [c, p, s, n] = await Promise.all([
      f.F.getDocs(f.F.collection(f.db, 'categories')),
      f.F.getDocs(f.F.collection(f.db, 'products')),
      f.F.getDoc(f.F.doc(f.db, 'settings', 'public')),
      f.F.getDoc(f.F.doc(f.db, 'counters', 'orders')),
    ])
    setCounts({ categories: c.size, products: p.size, settings: s.exists(), next: n.exists() ? n.data().next : null })
  }
  useEffect(() => {
    count().catch((e) => setMsg('Could not read the database: ' + (e.code || e.message)))
  }, [])

  async function upload() {
    setState('working')
    setMsg('')
    try {
      const { F, db } = await fb()
      const batch = F.writeBatch(db)
      for (const { id, ...data } of SAMPLE_CATEGORIES) batch.set(F.doc(db, 'categories', id), data)
      for (const { id, ...data } of SAMPLE_PRODUCTS) batch.set(F.doc(db, 'products', id), data)
      if (!counts?.settings) batch.set(F.doc(db, 'settings', 'public'), DEFAULT_SETTINGS) // never overwrite your saved settings
      batch.set(F.doc(db, 'settings', 'private'), { bloodSampleAddress: '' }, { merge: true })
      if (!counts?.next) batch.set(F.doc(db, 'counters', 'orders'), { next: 1001 })
      await batch.commit()
      await Promise.all([refreshCatalog(), refreshSettings()])
      await count()
      setState('done')
    } catch (e) {
      setState('error')
      setMsg('Upload failed: ' + (e.code || e.message) + '. Check that the latest Firestore rules are published.')
    }
  }

  async function startCounter() {
    try {
      const { F, db } = await fb()
      await F.setDoc(F.doc(db, 'counters', 'orders'), { next: 1001 })
      await count()
    } catch (e) {
      setMsg('Could not start order numbers: ' + (e.code || e.message))
    }
  }

  const hasData = counts && (counts.categories || counts.products)
  return (
    <div className="space-y-5">
      <Card title="Shop data in the database">
        {counts ? (
          <ul className="space-y-1.5 text-sm text-cream">
            <li>Categories: <span className="text-gold">{counts.categories}</span></li>
            <li>Products: <span className="text-gold">{counts.products}</span></li>
            <li>Settings: <span className="text-gold">{counts.settings ? 'saved' : 'not yet'}</span></li>
            <li>Next order number: <span className="text-gold">{counts.next ? `INV-${counts.next}` : 'not started'}</span></li>
          </ul>
        ) : (
          <div className="skeleton h-16 rounded-xl" />
        )}
        <p className="mt-4 text-sm text-muted">
          Uploads the {SAMPLE_CATEGORIES.length} sample categories and {SAMPLE_PRODUCTS.length} sample products (same IDs are replaced; your own products stay). Saved settings are never overwritten.
        </p>
        {state === 'done' && <p className="mt-3 flex items-center gap-2 text-sm text-[#8fd19e]"><IconCheck className="h-5 w-5" /> Done.</p>}
        {msg && <p role="alert" className="mt-3 rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-blush">{msg}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          {state === 'confirm' ? (
            <>
              <button type="button" onClick={upload} className="btn-rose">Yes, upload now</button>
              <button type="button" onClick={() => setState('idle')} className="btn-ghost">Cancel</button>
            </>
          ) : (
            <button type="button" disabled={state === 'working' || !counts} onClick={() => setState('confirm')} className="btn-rose disabled:opacity-60">
              {state === 'working' ? 'Uploading…' : hasData ? 'Upload sample data again' : 'Upload sample data'}
            </button>
          )}
          {counts && !counts.next && <button type="button" onClick={startCounter} className="btn-gold">Start order numbers at INV-1001</button>}
          <Link to="/shop" className="btn-ghost">View shop</Link>
        </div>
      </Card>
    </div>
  )
}
