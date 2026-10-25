// src/components/shop/CustomDetails.jsx — the "your details" form for made-to-order pieces:
// photos (uploaded straight away), names/text, a date and notes. Saved with the item in the cart and order.
import { useEffect, useRef, useState } from 'react'
import { uploadImage, uploadsReady } from '../../data/upload.js'
import { img } from '../../data/catalog.js'
import { IconClose, IconPlus } from '../Icons.jsx'

export const EMPTY_CUSTOM = { photos: [], text: '', date: '', notes: '' }
export const needsPhoto = (p) => p.needsPhoto ?? ['photo-art', 'wall-clocks'].includes(p.category)

export default function CustomDetails({ product, value, onChange, error }) {
  const [canUpload, setCanUpload] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const input = useRef(null)
  const photo = needsPhoto(product)
  const blood = product.category === 'blood-art'
  useEffect(() => {
    uploadsReady().then(setCanUpload)
  }, [])
  const set = (k, v) => onChange({ ...value, [k]: v })

  async function add(files) {
    setMsg('')
    setBusy(true)
    try {
      const urls = []
      for (const file of [...files].slice(0, 3 - value.photos.length)) urls.push(await uploadImage(file, 'custom-orders'))
      set('photos', [...value.photos, ...urls])
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <fieldset className="mt-7 rounded-3xl border border-plum-line bg-plum-card/60 p-5">
      <legend className="px-2 font-sans text-base font-medium text-gold">Your details</legend>
      {photo && (
        <div>
          <p className="text-sm text-cream">Your photo{' '}<span className="text-muted">(up to 3)</span></p>
          {canUpload ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {value.photos.map((u) => (
                <span key={u} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-plum-line">
                  <img src={img(u, true)} alt="Your photo" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => set('photos', value.photos.filter((x) => x !== u))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-plum/80 text-cream" aria-label="Remove photo">
                    <IconClose className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {value.photos.length < 3 && (
                <label className={`grid h-20 w-20 cursor-pointer place-items-center rounded-2xl border border-dashed border-gold/50 text-gold transition hover:bg-gold/10 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
                  {busy ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" /> : <IconPlus className="h-6 w-6" />}
                  <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => e.target.files.length && add(e.target.files)} aria-label="Add your photo" />
                </label>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted">After ordering, send your photo to us on WhatsApp with your order number.</p>
          )}
          {msg && <p className="mt-2 text-xs text-rose-light">{msg}</p>}
        </div>
      )}
      <div className={`grid gap-3 sm:grid-cols-2 ${photo ? 'mt-4' : ''}`}>
        <label className="block text-sm text-muted">
          {blood ? 'Name or initials (optional)' : 'Names / text on the piece'}
          <input value={value.text} onChange={(e) => set('text', e.target.value.slice(0, 80))} placeholder={blood ? 'e.g. S & P' : 'e.g. Sai ♥ Priya'} className="field mt-1 w-full rounded-2xl" />
        </label>
        <label className="block text-sm text-muted">
          Special date (optional)
          <input value={value.date} onChange={(e) => set('date', e.target.value.slice(0, 40))} placeholder="e.g. 14 Feb 2026" className="field mt-1 w-full rounded-2xl" />
        </label>
      </div>
      <label className="mt-3 block text-sm text-muted">
        Notes, colour wishes (optional)
        <textarea value={value.notes} onChange={(e) => set('notes', e.target.value.slice(0, 400))} rows={2} className="field mt-1 w-full rounded-2xl py-2.5" placeholder="Anything we should know" />
      </label>
      {blood && <p className="mt-3 text-xs text-muted">After ordering we show you how to dry and post your sample. Samples are handled with gloves and used only for your order.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-rose-light">{error}</p>}
    </fieldset>
  )
}
