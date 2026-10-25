// src/components/shop/Filters.jsx — the filter panel (left column on laptops, bottom sheet on phones)
import { formatINR } from '../../data/catalog.js'
import { IconCheck } from '../Icons.jsx'

// colour names → swatch colours ("Pink & gold" becomes a two-colour swatch)
const SWATCH = { pink: '#f2a7ba', lilac: '#c7a6e6', white: '#f6efe6', blue: '#8fb3e6', gold: '#d4a857', red: '#b8323f', clear: 'rgba(255,255,255,0.15)' }
export function swatch(name) {
  const parts = name.toLowerCase().split('&').map((s) => SWATCH[s.trim()] || '#b9a9a5')
  return parts.length > 1 ? `linear-gradient(135deg, ${parts[0]} 50%, ${parts[1]} 50%)` : parts[0]
}

function Section({ title, children }) {
  return (
    <fieldset className="border-b border-plum-line py-5 first:pt-0 last:border-0">
      <legend className="mb-3 float-left w-full text-xs font-medium uppercase tracking-[0.2em] text-gold">{title}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  )
}

function Chip({ on, onClick, children, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition ${on ? 'border-gold bg-gold/15 text-gold' : 'border-plum-line text-cream hover:border-blush/50'}`}
    >
      {dot && <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: dot }} />}
      {children}
    </button>
  )
}

export default function Filters({ f, update, categories, options, priceCap }) {
  const toggle = (key, val) => update({ [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] })
  const lo = f.min || 0
  const hi = f.max || priceCap

  return (
    <div>
      <Section title="Category">
        <ul className="space-y-1">
          {categories.map((c) => {
            const on = f.category.includes(c.slug)
            return (
              <li key={c.slug}>
                <button type="button" onClick={() => toggle('category', c.slug)} aria-pressed={on} className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm text-cream hover:text-gold">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${on ? 'border-gold bg-gold text-plum' : 'border-plum-line'}`}>
                    {on && <IconCheck className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted">{c.count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Price">
        <div className="mb-3 flex justify-between text-sm text-cream">
          <span>{formatINR(lo)}</span>
          <span>{hi >= priceCap ? `${formatINR(priceCap)}+` : formatINR(hi)}</span>
        </div>
        <div className="range-dual" style={{ '--lo': `${(lo / priceCap) * 100}%`, '--hi': `${(hi / priceCap) * 100}%` }}>
          <input type="range" min="0" max={priceCap} step="50" value={lo} aria-label="Minimum price" onChange={(e) => update({ min: Math.min(+e.target.value, hi - 50) || 0 })} />
          <input type="range" min="0" max={priceCap} step="50" value={hi} aria-label="Maximum price" onChange={(e) => {
            const v = Math.max(+e.target.value, lo + 50)
            update({ max: v >= priceCap ? 0 : v })
          }} />
        </div>
      </Section>

      {options.sizes.length > 0 && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((s) => (
              <Chip key={s} on={f.size.includes(s)} onClick={() => toggle('size', s)}>{s}</Chip>
            ))}
          </div>
        </Section>
      )}

      <Section title="Colour">
        <div className="flex flex-wrap gap-2">
          {options.colours.map((c) => (
            <Chip key={c} on={f.colour.includes(c)} onClick={() => toggle('colour', c)} dot={swatch(c)}>{c}</Chip>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-wrap gap-2">
          <Chip on={f.type === 'ready-made'} onClick={() => update({ type: f.type === 'ready-made' ? '' : 'ready-made' })}>Ready-made</Chip>
          <Chip on={f.type === 'custom'} onClick={() => update({ type: f.type === 'custom' ? '' : 'custom' })}>Made to order</Chip>
        </div>
      </Section>

      <Section title="Availability">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-cream">
          In stock / available now
          <input type="checkbox" className="switch" checked={f.stock} onChange={(e) => update({ stock: e.target.checked })} />
        </label>
      </Section>
    </div>
  )
}
