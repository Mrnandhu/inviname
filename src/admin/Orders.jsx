// src/admin/Orders.jsx — all orders: filter, open one, check the payment against your bank app,
// confirm the amount is right, change status, add the tracking number and message the customer.
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { list, patch } from './db.js'
import { Card, Field, Select, SaveButton, ConfirmButton } from './ui.jsx'
import { needsAction, recalc, waPhone } from './orderTools.js'
import { flowFor, afterFirstPayment, afterBalance, CANCELLED } from '../data/orders.js'
import { formatINR, img } from '../data/catalog.js'
import { useSettings } from '../data/settings.js'
import { IconWhatsApp, IconCheck } from '../components/Icons.jsx'
import { safePhoto } from '../lib/safeUrl.js'

const now = () => new Date().toISOString()

export default function Orders() {
  const [orders, setOrders] = useState(null)
  const [products, setProducts] = useState([])
  const [sp, setSp] = useSearchParams()
  const [filter, setFilter] = useState('action')
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const load = () => Promise.all([list('orders'), list('products')]).then(([o, p]) => {
    setOrders(o.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    setProducts(p)
  })
  useEffect(() => {
    load().catch(() => setOrders([]))
  }, [])

  const openId = sp.get('id')
  const open = orders?.find((o) => o.id === openId)
  const shown = useMemo(() => {
    if (!orders) return []
    const words = q.toLowerCase()
    return orders.filter(
      (o) =>
        (filter === 'all' || (filter === 'action' ? needsAction(o) : o.status === filter)) &&
        (kind === 'all' || o.kind === kind) &&
        (!words || `${o.id} ${o.customer?.name} ${o.customer?.phone} ${o.email}`.toLowerCase().includes(words)),
    )
  }, [orders, filter, kind, q])

  if (!orders) return <div className="skeleton h-64 rounded-3xl" />
  if (open)
    return (
      <OrderDetail
        o={open}
        products={products}
        back={() => setSp({})}
        onChange={(next) => setOrders((all) => all.map((x) => (x.id === next.id ? next : x)))}
      />
    )

  const statuses = [...new Set(orders.map((o) => o.status))]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select label="Show" value={filter} onChange={setFilter} options={[['action', 'Needs action'], ['all', 'All orders'], ...statuses.map((s) => [s, s])]} className="min-w-48" />
        <Select label="Type" value={kind} onChange={setKind} options={[['all', 'All types'], ['retail', 'Ready-made'], ['custom', 'Custom'], ['blood', 'Blood art'], ['wholesale', 'Wholesale']]} className="min-w-40" />
        <Field label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order no., name, phone" className="min-w-56 flex-1" />
      </div>
      {!shown.length ? (
        <p className="rounded-3xl border border-plum-line p-6 text-sm text-muted">{filter === 'action' ? 'Nothing waiting for you ✓' : 'No orders match.'}</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((o) => (
            <li key={o.id}>
              <Link to={`/admin/orders?id=${o.id}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-plum-line bg-plum-card/70 p-4 transition hover:border-gold/50">
                <span className="min-w-0 flex-1">
                  <span className="block text-cream">{o.id} · {o.customer?.name} <span className="text-xs text-muted">· {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></span>
                  <span className="block truncate text-xs text-muted">{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</span>
                </span>
                <span className="text-xs uppercase tracking-wider text-muted">{o.kind}</span>
                <span className={`badge ${needsAction(o) ? 'bg-rose text-white' : 'border border-gold/40 text-gold'}`}>{needsAction(o) ? 'Check payment' : o.status}</span>
                <span className="w-20 text-right text-cream">{formatINR(o.totals.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function OrderDetail({ o, products, back, onChange }) {
  const settings = useSettings()
  const check = useMemo(() => recalc(o, products, settings), [o, products, settings])
  const [status, setStatus] = useState(o.status)
  const [tracking, setTracking] = useState(o.tracking || '')
  const flow = [...flowFor(o), CANCELLED]

  async function save(changes) {
    const next = { ...o, ...changes, updatedAt: now() }
    if (changes.status && changes.status !== o.status) next.history = [...(o.history || []), { status: changes.status, at: now() }]
    await patch('orders', o.id, { ...changes, history: next.history || o.history || [], updatedAt: next.updatedAt })
    onChange(next)
    if (changes.status) setStatus(changes.status)
  }
  async function verify(i) {
    const p = o.payments[i]
    const payments = o.payments.map((x, k) => (k === i ? { ...x, verified: true, verifiedAt: now() } : x))
    const nextStatus = p.stage === 'first' ? afterFirstPayment(o) : p.stage === 'balance' ? afterBalance(o) : o.status
    await save({ payments, status: nextStatus })
  }
  const removePayment = (i) => save({ payments: o.payments.filter((_, k) => k !== i) })
  const paidAtPickup = () => save({ payments: [...(o.payments || []), { stage: 'pickup', amount: o.totals.payAtPickup, utr: 'Paid at pickup', at: now(), verified: true, verifiedAt: now() }], status: 'Picked up' })

  const c = o.customer || {}
  const msg = `Hi ${c.name}, this is Inviname Arts 🌸 Your order ${o.id} is now: ${status}.${tracking ? ` Tracking number: ${tracking} (India Post).` : ''}${status === 'Balance pending' ? ` Your piece is ready! Please pay the balance of ${formatINR(o.totals.payLater)} from My Orders on our website.` : ''} Thank you!`

  return (
    <div className="space-y-5">
      <button type="button" onClick={back} className="text-sm text-gold hover:underline">← All orders</button>
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-serif text-4xl text-blush">{o.id}</h2>
        <span className="badge border border-gold/40 text-gold">{o.status}</span>
        <span className="text-xs uppercase tracking-wider text-muted">{o.kind} · {o.method === 'pickup' ? `pickup${o.payWhere === 'pickup' ? ', pay at pickup' : ''}` : 'home delivery'}</span>
      </div>

      {/* amount check */}
      <Card title={check.ok ? 'Amounts check ✓' : '⚠️ Amounts do not match'} className={check.ok ? '' : 'border-rose/60'}>
        {check.ok ? (
          <p className="text-sm text-muted">Prices and totals match your current products and delivery settings.</p>
        ) : (
          <ul className="space-y-1 text-sm text-blush">{check.issues.map((i) => <li key={i}>• {i}</li>)}</ul>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[['Items', o.totals.subtotal], ['Delivery & packing', o.totals.deliveryPacking], ['Total', o.totals.total], ['Pay now', o.totals.payNow], ['Balance later', o.totals.payLater], ['At pickup', o.totals.payAtPickup], ['Discount', o.totals.discount]]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-plum p-3"><dt className="text-xs text-muted">{k}</dt><dd className="text-cream">{formatINR(v)}</dd></div>
            ))}
        </dl>
      </Card>

      {/* payments */}
      <Card title="Payments">
        {!(o.payments || []).length ? (
          <p className="text-sm text-muted">{o.totals.payNow > 0 ? `Waiting for the customer to pay ${formatINR(o.totals.payNow)} and send the UTR.` : 'Nothing paid online (pay at pickup).'}</p>
        ) : (
          <ul className="space-y-3">
            {o.payments.map((p, i) => (
              <li key={i} className={`rounded-2xl border p-4 text-sm ${p.verified ? 'border-plum-line' : 'border-gold/60 bg-gold/[0.06]'}`}>
                <p className="text-cream">
                  {p.stage === 'first' ? 'First payment' : p.stage === 'balance' ? 'Balance' : 'At pickup'} · <span className="text-gold">{formatINR(p.amount)}</span> · UTR <span className="font-mono tracking-wider">{p.utr}</span>
                </p>
                <p className="text-xs text-muted">{new Date(p.at).toLocaleString('en-IN')} {safePhoto(p.screenshot) && <> · <a href={safePhoto(p.screenshot)} target="_blank" rel="noopener noreferrer" className="text-gold underline">screenshot</a></>}</p>
                {p.verified ? (
                  <p className="mt-2 flex items-center gap-1 text-[#8fd19e]"><IconCheck className="h-4 w-4" /> Verified</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-blush">Open your bank / UPI app and check you received exactly {formatINR(p.amount)} with UTR {p.utr}. Only then mark it verified.</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => verify(i)} className="btn-rose min-h-10 px-4">Money received – mark verified</button>
                      <ConfirmButton onConfirm={() => removePayment(i)} confirmText="Yes, remove">Wrong UTR – remove</ConfirmButton>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {o.totals.payAtPickup > 0 && !(o.payments || []).some((p) => p.stage === 'pickup') && (
          <div className="mt-4"><ConfirmButton onConfirm={paidAtPickup} confirmText={`Yes, received ${formatINR(o.totals.payAtPickup)}`} className="btn-gold min-h-10 px-4">Customer paid {formatINR(o.totals.payAtPickup)} at pickup</ConfirmButton></div>
        )}
      </Card>

      {/* status + tracking */}
      <Card title="Status & tracking">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Status" value={status} onChange={setStatus} options={flow} />
          <Field label="Speed Post / tracking number" value={tracking} onChange={(e) => setTracking(e.target.value.trim())} placeholder="e.g. EE123456789IN" />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <SaveButton onSave={() => save({ status, tracking })} label="Save status" />
          <a href={`https://wa.me/${waPhone(c.phone)}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost min-h-11 px-5">
            <IconWhatsApp className="h-4 w-4 text-[#25D366]" /> Message customer
          </a>
        </div>
        {o.kind !== 'retail' && o.totals.payLater > 0 && <p className="mt-3 text-xs text-muted">When the piece is ready, set the status to “Balance pending” — the customer then sees a “Pay remaining balance” button ({formatINR(o.totals.payLater)}).</p>}
      </Card>

      {/* customer + items */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Customer">
          <p className="text-cream">{c.name}</p>
          <p className="text-sm text-muted">{c.phone} · {o.email}</p>
          {o.method === 'home' ? <p className="mt-2 text-sm text-cream">{[c.address, c.landmark, c.city, c.pincode].filter(Boolean).join(', ')}</p> : <p className="mt-2 text-sm text-cream">Pickup from Pothavaram</p>}
        </Card>
        <Card title="Items">
          <ul className="space-y-3">
            {o.items.map((i, k) => (
              <li key={k} className="flex gap-3 text-sm">
                <img src={img(i.image, true)} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-plum object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="text-cream">{i.name} × {i.qty}</p>
                  <p className="text-xs text-muted">{i.variant}{i.colour && ` · ${i.colour}`} · {formatINR(i.price)} each</p>
                  {i.custom && (
                    <div className="mt-1 space-y-1 text-xs text-blush">
                      {i.custom.text && <p>Text: {i.custom.text}</p>}
                      {i.custom.date && <p>Date: {i.custom.date}</p>}
                      {i.custom.notes && <p>Notes: {i.custom.notes}</p>}
                      {!!i.custom.photos?.length && (
                        <p className="flex flex-wrap gap-1.5">
                          {i.custom.photos.map(safePhoto).filter(Boolean).map((u) => (
                            <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={img(u, true)} alt="Customer photo" className="h-12 w-12 rounded-lg object-cover" /></a>
                          ))}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
