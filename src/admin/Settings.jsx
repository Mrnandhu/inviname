// src/admin/Settings.jsx — contact details, UPI, pickup, blood-sample address, delivery charges and zones,
// packing, free delivery, wholesale rules, photo uploads (Cloudinary), tracking link and brand colours.
import { useEffect, useState } from 'react'
import { put, get } from './db.js'
import { Card, Field, Area, Num, Toggle, SaveButton } from './ui.jsx'
import { loadSettings, refreshSettings, DEFAULT_THEME, applySettings } from '../data/settings.js'
import { IconPlus, IconClose } from '../components/Icons.jsx'

const list = (v) => v.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean)

export default function Settings() {
  const [s, setS] = useState(null)
  const [priv, setPriv] = useState({ bloodSampleAddress: '' })
  useEffect(() => {
    loadSettings().then((x) => setS(structuredClone(x)))
    get('settings', 'private').then((p) => p && setPriv(p)).catch(() => {})
  }, [])
  if (!s) return <div className="skeleton h-64 rounded-3xl" />
  const at = (path, v) =>
    setS((old) => {
      const n = structuredClone(old)
      let o = n
      for (const k of path.slice(0, -1)) o = o[k]
      o[path.at(-1)] = v
      return n
    })
  const d = s.delivery

  async function save() {
    if (s.payment.upiId && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(s.payment.upiId.trim())) throw new Error('UPI ID looks wrong (it should look like name@bank).')
    const clean = { ...s, payment: { ...s.payment, upiId: s.payment.upiId.trim() }, contact: { ...s.contact, whatsapp: String(s.contact.whatsapp).replace(/\D/g, '') } }
    await put('settings', 'public', clean)
    await put('settings', 'private', { bloodSampleAddress: priv.bloodSampleAddress || '' })
    await refreshSettings()
  }

  return (
    <div className="space-y-5">
      <Card title="Contact">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="WhatsApp number (with 91)" value={s.contact.whatsapp} onChange={(e) => at(['contact', 'whatsapp'], e.target.value)} hint="e.g. 919390635033 — used by every WhatsApp button" />
          <Field label="Phone number as shown" value={s.contact.phoneDisplay} onChange={(e) => at(['contact', 'phoneDisplay'], e.target.value)} />
          <Field label="Instagram link" value={s.contact.instagram} onChange={(e) => at(['contact', 'instagram'], e.target.value.trim())} placeholder="https://instagram.com/…" />
          <Field label="Email" type="email" value={s.contact.email} onChange={(e) => at(['contact', 'email'], e.target.value.trim())} />
        </div>
      </Card>

      <Card title="UPI payments">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="UPI ID" value={s.payment.upiId} onChange={(e) => at(['payment', 'upiId'], e.target.value)} placeholder="yourname@okaxis" hint="Customers pay to this. Double-check it!" />
          <Field label="Name shown in UPI apps" value={s.payment.upiName} onChange={(e) => at(['payment', 'upiName'], e.target.value)} />
        </div>
      </Card>

      <Card title="Pickup & blood art">
        <div className="grid gap-3">
          <Field label="Pickup place (shown to everyone)" value={s.pickup.place} onChange={(e) => at(['pickup', 'place'], e.target.value)} />
          <Area label="Pickup instructions" rows={2} value={s.pickup.instructions} onChange={(e) => at(['pickup', 'instructions'], e.target.value)} />
          <Area label="Blood-sample mailing address (private)" rows={3} value={priv.bloodSampleAddress} onChange={(e) => setPriv({ bloodSampleAddress: e.target.value })} hint="Only shown to customers after they place a blood-art order." />
        </div>
      </Card>

      <Card title="Delivery areas & zones">
        <p className="text-sm text-muted">Pincodes are matched by their first 3 digits.</p>
        <div className="mt-3 space-y-2">
          {d.areas.map((a, i) => (
            <div key={i} className="flex items-end gap-2">
              <Num label="From" value={a.from} onChange={(v) => at(['delivery', 'areas', i, 'from'], v)} className="w-28" />
              <Num label="To" value={a.to} onChange={(v) => at(['delivery', 'areas', i, 'to'], v)} className="w-28" />
              <button type="button" onClick={() => at(['delivery', 'areas'], d.areas.filter((_, j) => j !== i))} className="grid h-12 w-12 place-items-center rounded-full border border-plum-line text-muted" aria-label="Remove area"><IconClose className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => at(['delivery', 'areas'], [...d.areas, { from: 0, to: 0 }])} className="btn-ghost min-h-10 px-4"><IconPlus className="h-4 w-4" /> Add area</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Zone A (near) — first 3 digits" value={d.zoneA.join(', ')} onChange={(e) => at(['delivery', 'zoneA'], list(e.target.value))} hint="All other areas above are zone B" />
          <Toggle label="Zone C: deliver to the rest of India" checked={d.zoneCEnabled} onChange={(v) => at(['delivery', 'zoneCEnabled'], v)} />
        </div>
      </Card>

      <Card title="Delivery charges by parcel weight (₹)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="pb-2">Up to (grams)</th><th>Zone A</th><th>Zone B</th><th>Zone C</th></tr></thead>
            <tbody>
              {d.rates.map((r, i) => (
                <tr key={i}>
                  {['upTo', 'A', 'B', 'C'].map((k) => (
                    <td key={k} className="py-1 pr-2"><input inputMode="numeric" value={r[k]} onChange={(e) => at(['delivery', 'rates', i, k], Number(e.target.value.replace(/\D/g, '')) || 0)} className="field w-full rounded-xl" aria-label={`${k} row ${i + 1}`} /></td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-1 pr-2 text-xs text-muted">Each extra 500 g</td>
                {['A', 'B', 'C'].map((k) => (
                  <td key={k} className="py-1 pr-2"><input inputMode="numeric" value={d.extraPer500[k]} onChange={(e) => at(['delivery', 'extraPer500', k], Number(e.target.value.replace(/\D/g, '')) || 0)} className="field w-full rounded-xl" aria-label={`extra ${k}`} /></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Num label="Packing: small items only" value={d.packing.small} onChange={(v) => at(['delivery', 'packing', 'small'], v)} />
          <Num label="Packing: any combo" value={d.packing.combo} onChange={(v) => at(['delivery', 'packing', 'combo'], v)} />
          <Num label="Packing: only big pieces" value={d.packing.big} onChange={(v) => at(['delivery', 'packing', 'big'], v)} />
          <Num label="Free delivery from ₹" value={d.freeMin} onChange={(v) => at(['delivery', 'freeMin'], v)} />
          <Field label="Free delivery pincodes (first 3 digits)" value={d.freePrefixes.join(', ')} onChange={(e) => at(['delivery', 'freePrefixes'], list(e.target.value))} className="sm:col-span-2" />
        </div>
      </Card>

      <Card title="Wholesale">
        <div className="grid gap-3 sm:grid-cols-4">
          <Num label="Minimum pieces" value={s.wholesale.minPieces} onChange={(v) => at(['wholesale', 'minPieces'], v)} />
          <Num label="Max designs" value={s.wholesale.maxDesigns} onChange={(v) => at(['wholesale', 'maxDesigns'], v)} />
          <Num label="Discount from (pieces)" value={s.wholesale.discountAt} onChange={(v) => at(['wholesale', 'discountAt'], v)} />
          <Num label="Discount %" value={s.wholesale.discountPct} onChange={(v) => at(['wholesale', 'discountPct'], v)} />
        </div>
      </Card>

      <Card title="Photos (Cloudinary, free)">
        <p className="text-sm text-muted">Needed to upload product photos here and for customers’ custom-order photos. In cloudinary.com: Settings → Upload → Add upload preset → Signing mode “Unsigned”.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Cloud name" value={s.cloudinary.cloudName} onChange={(e) => at(['cloudinary', 'cloudName'], e.target.value.trim())} />
          <Field label="Unsigned upload preset" value={s.cloudinary.uploadPreset} onChange={(e) => at(['cloudinary', 'uploadPreset'], e.target.value.trim())} />
        </div>
      </Card>

      <Card title="Tracking & colours">
        <Field label="Parcel tracking page link" value={s.trackingUrl} onChange={(e) => at(['trackingUrl'], e.target.value.trim())} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.keys(DEFAULT_THEME).map((k) => (
            <label key={k} className="text-sm capitalize text-muted">
              {k === 'plum' ? 'Background' : k === 'blush' ? 'Headings' : k === 'rose' ? 'Buttons' : k === 'gold' ? 'Accents' : 'Text'}
              <span className="mt-1 flex items-center gap-2">
                <input type="color" value={s.theme[k]} onChange={(e) => { at(['theme', k], e.target.value); applySettings({ ...s, theme: { ...s.theme, [k]: e.target.value } }) }} className="h-11 w-14 cursor-pointer rounded-xl border border-plum-line bg-transparent" />
                <span className="text-xs">{s.theme[k]}</span>
              </span>
            </label>
          ))}
        </div>
        <button type="button" onClick={() => { at(['theme'], { ...DEFAULT_THEME }); applySettings({ ...s, theme: DEFAULT_THEME }) }} className="mt-3 text-sm text-gold hover:underline">Reset colours to original</button>
      </Card>

      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-full border border-gold/30 bg-plum/95 p-2 pl-5 backdrop-blur">
        <span className="text-sm text-muted">Changes apply to the website as soon as you save.</span>
        <SaveButton onSave={save} label="Save settings" className="ml-auto" />
      </div>
    </div>
  )
}
