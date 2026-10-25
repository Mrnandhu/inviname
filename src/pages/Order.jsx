// src/pages/Order.jsx — one order: payment step (UPI QR + UTR), confirmation, status timeline,
// pickup / blood-sample instructions, tracking, and "send order details on WhatsApp".
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { getOrder, submitPayment, nextPayment, bloodSampleAddress, PENDING } from '../data/orders.js'
import { formatINR, img } from '../data/catalog.js'
import { useSettings } from '../data/settings.js'
import { waLink } from '../config/site.js'
import usePageTitle from '../lib/usePageTitle.js'
import UpiPay from '../components/orders/UpiPay.jsx'
import Timeline from '../components/orders/Timeline.jsx'
import ArtImage from '../components/home/ArtImage.jsx'
import { CustomSummary } from './Cart.jsx'
import { IconCheck, IconWhatsApp, IconTruck, IconPin } from '../components/Icons.jsx'

export default function Order() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const isNew = sp.get('new') === '1'
  usePageTitle(`Order ${id}`)
  const settings = useSettings()
  const [o, setO] = useState(undefined)
  const [blood, setBlood] = useState('')

  useEffect(() => {
    getOrder(id)
      .then(setO)
      .catch(() => setO(null))
  }, [id])
  useEffect(() => {
    if (o?.hasBlood) bloodSampleAddress().then(setBlood)
  }, [o?.hasBlood])

  if (o === undefined) return <div className="container-page py-16"><div className="skeleton h-72 rounded-3xl" /></div>
  if (!o)
    return (
      <section className="container-page py-24 text-center">
        <h1 className="text-4xl">Order not found</h1>
        <p className="mt-3 text-muted">Please check the order number, or log in with the account you ordered from.</p>
        <Link to="/my-orders" className="btn-rose mt-8">My orders</Link>
      </section>
    )

  const due = nextPayment(o)
  const waiting = (o.payments || []).filter((p) => !p.verified)
  const waText = [
    `Hi Inviname Arts, my order ${o.id}:`,
    ...o.items.map((i) => `• ${i.name} (${i.variant}${i.colour ? ', ' + i.colour : ''}) × ${i.qty}`),
    `Total: ${formatINR(o.totals.total)}`,
    o.totals.payNow ? `Paid now: ${formatINR(o.totals.payNow)}` : 'Paying at pickup',
    ...(o.payments || []).map((p) => `UTR (${p.stage}): ${p.utr}`),
  ].join('\n')

  return (
    <div className="container-page pb-16 pt-8 sm:pt-12">
      {isNew && (
        <div className="mb-8 flex items-start gap-4 rounded-3xl border border-gold/30 bg-gold/[0.07] p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-plum"><IconCheck className="h-5 w-5" /></span>
          <div>
            <p className="font-serif text-2xl text-blush">Thank you! Your order is placed.</p>
            <p className="mt-1 text-sm text-muted">{due ? 'Complete the payment below so we can start.' : 'We will message you on WhatsApp with updates.'}</p>
          </div>
        </div>
      )}
      <p className="label">Order</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-4xl sm:text-5xl">{o.id}</h1>
        <span className="badge border border-gold/40 text-gold">{o.status}</span>
      </div>
      <p className="mt-2 text-sm text-muted">Placed {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-10">
        <div className="min-w-0 space-y-6">
          {due && <UpiPay amount={due.amount} orderId={o.id} stage={due.stage} onSubmit={async (p) => setO(await submitPayment(o, { stage: due.stage, amount: due.amount, ...p }))} />}
          {waiting.length > 0 && (
            <div className="rounded-3xl border border-plum-line bg-plum-card/60 p-5 text-sm">
              <p className="text-cream">Payment received for checking ✓</p>
              <p className="mt-1 text-muted">UTR {waiting.map((p) => p.utr).join(', ')} · We verify it in our bank app and update your order (usually within a few hours).</p>
            </div>
          )}
          {o.status === PENDING && !due && !waiting.length && <p className="text-sm text-muted">We are checking your payment.</p>}

          {o.method === 'pickup' && (
            <div className="rounded-3xl border border-plum-line bg-plum-card/60 p-5 text-sm">
              <p className="flex items-center gap-2 text-cream"><IconPin className="h-5 w-5 text-gold" /> Pickup from {settings.pickup.place}</p>
              <p className="mt-2 text-muted">{settings.pickup.instructions}</p>
              {o.totals.payAtPickup > 0 && <p className="mt-2 text-gold">Pay {formatINR(o.totals.payAtPickup)} when you collect (cash or UPI).</p>}
            </div>
          )}

          {o.hasBlood && (
            <div className="rounded-3xl border border-gold/30 bg-gold/[0.05] p-5 text-sm leading-relaxed">
              <h2 className="font-sans text-base font-medium text-gold">How to send your blood sample</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-cream">
                <li>Wash your hands. Put a few drops on a clean white paper.</li>
                <li>Let it dry fully (a few hours) away from dust and sunlight.</li>
                <li>Seal the paper in a small zip bag.</li>
                <li>Put it in an envelope and write your order number <span className="text-gold">{o.id}</span> on it.</li>
                <li>Send it by post to the address below.</li>
              </ol>
              <p className="mt-4 whitespace-pre-line rounded-2xl bg-plum/70 p-4 text-cream">{blood || 'We will send you the mailing address on WhatsApp.'}</p>
              <p className="mt-3 text-muted">Samples are handled with gloves and used only for your order.</p>
            </div>
          )}

          <div className="rounded-3xl border border-plum-line bg-plum-card/60 p-5">
            <h2 className="opt-title">Items</h2>
            <ul className="mt-4 space-y-4">
              {o.items.map((i, k) => (
                <li key={k} className="flex gap-3">
                  <ArtImage src={img(i.image, true)} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-plum-line bg-plum" />
                  <div className="min-w-0 flex-1 text-sm">
                    <Link to={`/product/${i.slug}`} className="line-clamp-1 text-cream hover:text-gold">{i.name}</Link>
                    <p className="text-xs text-muted">{i.variant}{i.colour && ` · ${i.colour}`} · × {i.qty}</p>
                    {i.custom && <CustomSummary custom={i.custom} />}
                  </div>
                  <span className="text-sm text-cream">{formatINR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-plum-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Items</dt><dd className="text-cream">{formatINR(o.totals.subtotal)}</dd></div>
              {o.totals.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="text-[#8fd19e]">−{formatINR(o.totals.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Delivery &amp; Packing</dt><dd className="text-cream">{o.totals.deliveryPacking ? formatINR(o.totals.deliveryPacking) : 'Free'}</dd></div>
              <div className="flex justify-between text-base"><dt className="text-cream">Total</dt><dd className="font-medium text-cream">{formatINR(o.totals.total)}</dd></div>
              {o.totals.payLater > 0 && <div className="flex justify-between text-xs"><dt className="text-muted">Balance before dispatch</dt><dd className="text-cream">{formatINR(o.totals.payLater)}</dd></div>}
            </dl>
          </div>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-plum-line bg-plum-card/60 p-5">
            <h2 className="opt-title">Status</h2>
            <div className="mt-4"><Timeline order={o} /></div>
            {o.tracking && (
              <p className="mt-5 flex flex-wrap items-center gap-2 border-t border-plum-line pt-4 text-sm">
                <IconTruck className="h-5 w-5 text-gold" /> Tracking: <span className="font-medium text-cream">{o.tracking}</span>
                <a href={settings.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Track on India Post</a>
              </p>
            )}
          </div>
          {o.method === 'home' && (
            <div className="rounded-3xl border border-plum-line bg-plum-card/60 p-5 text-sm">
              <h2 className="opt-title">Delivering to</h2>
              <p className="mt-2 text-cream">{o.customer.name} · {o.customer.phone}</p>
              <p className="mt-1 text-muted">{[o.customer.address, o.customer.landmark, o.customer.city, o.customer.pincode].filter(Boolean).join(', ')}</p>
            </div>
          )}
          <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
            <IconWhatsApp className="h-4 w-4 text-[#25D366]" /> Send order details on WhatsApp
          </a>
          <Link to="/my-orders" className="block text-center text-sm text-gold hover:underline">All my orders</Link>
        </aside>
      </div>
    </div>
  )
}
