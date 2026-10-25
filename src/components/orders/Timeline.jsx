// src/components/orders/Timeline.jsx — the order's steps, with the current one highlighted
import { flowFor, CANCELLED } from '../../data/orders.js'
import { IconCheck } from '../Icons.jsx'

export default function Timeline({ order }) {
  if (order.status === CANCELLED) return <p className="rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-blush">This order was cancelled.</p>
  const steps = flowFor(order)
  const at = Math.max(0, steps.indexOf(order.status))
  return (
    <ol className="relative space-y-4 pl-8">
      <span className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-plum-line" aria-hidden="true" />
      {steps.map((s, i) => {
        const done = i < at
        const now = i === at
        const when = (order.history || []).filter((h) => h.status === s).pop()?.at
        return (
          <li key={s} className="relative">
            <span className={`absolute -left-8 top-0.5 grid h-[1.375rem] w-[1.375rem] place-items-center rounded-full border ${done ? 'border-gold bg-gold text-plum' : now ? 'border-gold bg-plum text-gold shadow-[0_0_0_4px_rgb(212_168_87_/_0.2)]' : 'border-plum-line bg-plum'}`}>
              {done ? <IconCheck className="h-3.5 w-3.5" /> : now ? <span className="h-2 w-2 rounded-full bg-gold" /> : null}
            </span>
            <p className={`text-sm ${now ? 'font-medium text-gold' : done ? 'text-cream' : 'text-muted'}`}>{s}</p>
            {when && (done || now) && <p className="text-xs text-muted">{new Date(when).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>}
          </li>
        )
      })}
    </ol>
  )
}
