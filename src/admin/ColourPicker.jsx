// src/admin/ColourPicker.jsx — pick a product's colours by tapping swatches (no typing).
// The first colour is the one selected by default on the product page. Other colours can be added by name.
import { useState } from 'react'
import { COLOURS, COMBOS, swatch } from '../data/colours.js'
import { IconClose } from '../components/Icons.jsx'

export default function ColourPicker({ value = [], onChange }) {
  const [custom, setCustom] = useState('')
  const has = (n) => value.some((v) => v.toLowerCase() === n.toLowerCase())
  const toggle = (n) => onChange(has(n) ? value.filter((v) => v.toLowerCase() !== n.toLowerCase()) : [...value, n])
  const addCustom = () => {
    const n = custom.trim().replace(/\s+/g, ' ')
    if (n && !has(n)) onChange([...value, n.charAt(0).toUpperCase() + n.slice(1)])
    setCustom('')
  }
  const chip = (n, on) => (
    <button key={n} type="button" onClick={() => toggle(n)} aria-pressed={on}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${on ? 'border-gold bg-gold/15 text-cream' : 'border-plum-line text-muted hover:border-gold/50'}`}>
      <span className="h-5 w-5 shrink-0 rounded-full border border-white/25" style={{ background: swatch(n) }} />
      {n}
    </button>
  )

  return (
    <div className="mt-4 text-sm text-muted">
      <p>Colours <span className="text-xs">(tap to select · the first one is pre-selected for customers)</span></p>

      <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border border-plum-line bg-plum p-2">
        {value.length === 0 && <span className="px-2 text-xs">No colours – customers won't be asked to choose one.</span>}
        {value.map((n, i) => (
          <span key={n} className="flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 py-1 pl-2 pr-1 text-cream">
            <span className="h-5 w-5 rounded-full border border-white/25" style={{ background: swatch(n) }} />
            {n}{i === 0 && <span className="text-[10px] uppercase tracking-wider text-gold">default</span>}
            <button type="button" onClick={() => toggle(n)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-plum-card" aria-label={`Remove ${n}`}>
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">{COLOURS.map(([n]) => chip(n, has(n)))}</div>
      <p className="mt-3 text-xs">Combinations</p>
      <div className="mt-1 flex flex-wrap gap-2">{COMBOS.map((n) => chip(n, has(n)))}</div>

      <div className="mt-3 flex gap-2">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder="Other colour, e.g. Peach & gold" maxLength={40} className="field min-w-0 flex-1 rounded-2xl" />
        <button type="button" onClick={addCustom} disabled={!custom.trim()} className="btn-ghost min-h-11 px-4 disabled:opacity-50">Add</button>
      </div>
    </div>
  )
}
