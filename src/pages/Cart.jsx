// src/pages/Cart.jsx — the cart: items, quantities, delivery or pickup, one "Delivery & Packing" line, total.
// Prices, weights and packing always come fresh from the catalog (so admin price changes apply here too).
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCatalog, formatINR, img } from '../data/catalog.js'
import { useCart, setQty, removeFromCart, cartCount } from '../data/cart.js'
import { useSettings } from '../data/settings.js'
import { quote, deliveryZone } from '../data/delivery.js'
import { joinWaitlist } from '../data/waitlist.js'
import { paymentSplit } from '../data/payment.js'
import usePageTitle from '../lib/usePageTitle.js'
import ArtImage from '../components/home/ArtImage.jsx'
import ProductCard from '../components/shop/ProductCard.jsx'
import { IconMinus, IconPlus, IconClose, IconTruck, IconPin, IconShield, IconArrow, IconCheck } from '../components/Icons.jsx'

const PIN_KEY = 'inv-pin'
const METHOD_KEY = 'inv-delivery-method'
const remember = (k, v) => {
  try {
    localStorage.setItem(k, v)
  } catch {}
}
const recall = (k, d = '') => {
  try {
    return localStorage.getItem(k) || d
  } catch {
    return d
  }
}

export default function Cart() {
  usePageTitle('Cart')
  const cat = useCatalog()
  const items = useCart()
  const settings = useSettings()
  const navigate = useNavigate()
  const [pin, setPin] = useState(() => recall(PIN_KEY))
  const [method, setMethod] = useState(() => recall(METHOD_KEY, 'home'))
  const [payWhere, setPayWhere] = useState(() => recall('inv-pay-where', 'online'))
  useEffect(() => remember(METHOD_KEY, method), [method])
  useEffect(() => remember('inv-pay-where', payWhere), [payWhere])
  useEffect(() => {
    if (/^\d{6}$/.test(pin)) remember(PIN_KEY, pin)
  }, [pin])

  // join cart items with the catalog for current prices
  const lines = useMemo(() => {
    if (!cat) return []
    return items.map((it) => {
      const p = cat.products.find((x) => x.id === it.productId)
      const v = p?.variants.find((x) => x.name === it.variant)
      if (!p || !v) return { ...it, gone: true }
      const max = p.type === 'custom' ? 20 : p.stock
      return { ...it, name: p.name, slug: p.slug, image: p.image, price: v.price, weight: v.weight, packingType: p.packingType, type: p.type, max, gone: max <= 0 }
    })
  }, [cat, items])
  const live = lines.filter((l) => !l.gone)
  const q = quote({ lines: live, pin, method, settings })
  const zone = method === 'home' ? deliveryZone(pin, settings) : null
  const payAtPickup = method === 'pickup' && payWhere === 'pickup'
  const pay = paymentSplit(live, q.deliveryPacking, { payAtPickup })
  const hasCustom = pay.hasCustom
  const hasReady = pay.ready > 0
  const canCheckout = live.length > 0 && (method === 'pickup' || q.deliverable)

  if (!cat) return <div className="container-page py-20"><div className="skeleton h-64 rounded-3xl" /></div>
  if (!items.length) return <EmptyCart cat={cat} />

  return (
    <div className="pb-32 lg:pb-16">
      <div className="container-page pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link to="/" className="hover:text-gold">Home</Link> <span className="mx-1.5">/</span> <span className="text-cream">Cart</span>
        </nav>
        <h1 className="mt-3 text-4xl sm:text-5xl">
          Your Cart <span className="align-middle font-sans text-base font-normal text-muted">({cartCount(live)} {cartCount(live) === 1 ? 'item' : 'items'})</span>
        </h1>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_24rem] lg:gap-10">
          {/* items */}
          <div className="min-w-0">
            <ul className="divide-y divide-plum-line overflow-hidden rounded-3xl border border-plum-line bg-plum-card/60">
              {lines.map((l) => (
                <li key={l.key} className={`flex gap-3 p-3 sm:gap-5 sm:p-5 ${l.gone ? 'opacity-60' : ''}`}>
                  <Link to={`/product/${l.slug}`} className="shrink-0 overflow-hidden rounded-2xl border border-plum-line bg-plum">
                    <ArtImage src={img(l.image, true)} alt={l.name} className="h-24 w-24 sm:h-28 sm:w-28" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link to={`/product/${l.slug}`} className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-blush hover:text-gold sm:text-xl">{l.name}</Link>
                        <p className="mt-0.5 text-xs text-muted sm:text-sm">
                          {l.variant}{l.colour && ` · ${l.colour}`}
                        </p>
                        {l.type === 'custom' && !l.gone && <span className="badge mt-1.5 border border-blush/30 text-blush">Made to order</span>}
                        {l.gone && <p className="mt-1 text-sm text-rose-light">No longer available</p>}
                      </div>
                      <button type="button" onClick={() => removeFromCart(l.key)} className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-plum hover:text-rose-light" aria-label={`Remove ${l.name}`}>
                        <IconClose className="h-5 w-5" />
                      </button>
                    </div>
                    {!l.gone && (
                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <div className="qty qty-sm" role="group" aria-label={`Quantity of ${l.name}`}>
                          <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Less"><IconMinus className="h-4 w-4" /></button>
                          <span>{l.qty}</span>
                          <button type="button" onClick={() => setQty(l.key, Math.min(l.max, l.qty + 1))} disabled={l.qty >= l.max} aria-label="More"><IconPlus className="h-4 w-4" /></button>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-medium text-cream sm:text-lg">{formatINR(l.price * l.qty)}</p>
                          {l.qty > 1 && <p className="text-xs text-muted">{formatINR(l.price)} each</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-sm text-gold hover:underline">
              <IconArrow className="h-4 w-4 rotate-180" /> Continue shopping
            </Link>
          </div>

          {/* summary */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <section className="rounded-3xl border border-plum-line bg-plum-card/60 p-5">
              <h2 className="opt-title">Delivery</h2>
              <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Delivery method">
                {[['home', 'Home delivery', IconTruck], ['pickup', 'Pick up', IconPin]].map(([v, label, Icon]) => (
                  <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)} className={`opt flex-row gap-2 ${method === v ? 'is-on' : ''}`}>
                    <Icon className="h-5 w-5" /> {label}
                  </button>
                ))}
              </div>

              {method === 'home' ? (
                <div className="mt-4">
                  <label htmlFor="cart-pin" className="text-sm text-muted">Delivery pincode</label>
                  <input id="cart-pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="6-digit pincode" className="field mt-1.5 w-full" />
                  {pin.length === 6 && ['A', 'B', 'C'].includes(zone) && <p className="mt-2 flex items-center gap-1.5 text-sm text-[#8fd19e]"><IconCheck className="h-4 w-4" /> We deliver to {pin}</p>}
                  {zone === 'soon' && <Waitlist pin={pin} />}
                  {pin.length === 6 && zone === 'invalid' && <p className="mt-2 text-sm text-rose-light">Please check the pincode.</p>}
                  <p className="mt-2 text-xs text-muted">We deliver to Andhra Pradesh &amp; Telangana.</p>
                </div>
              ) : (
                <>
                <p className="mt-4 rounded-2xl bg-plum/60 p-3 text-sm text-muted">
                  <span className="text-cream">Pick up from {settings.pickup.place}.</span> No delivery charge, only packing. {settings.pickup.instructions}
                </p>
                <fieldset className="mt-4">
                  <legend className="text-sm text-muted">How would you like to pay?</legend>
                  <div className="mt-2 grid gap-2">
                    {[
                      ['online', 'Pay online now', 'UPI, before we keep your order ready'],
                      ['pickup', 'Pay at pickup', 'Cash or UPI when you collect'],
                    ].map(([v, t, d]) => (
                      <label key={v} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition ${payWhere === v ? 'border-gold bg-gold/10' : 'border-plum-line hover:border-blush/40'}`}>
                        <input type="radio" name="pay-where" value={v} checked={payWhere === v} onChange={() => setPayWhere(v)} className="mt-1 accent-[#D4A857]" />
                        <span>
                          <span className="block text-cream">{t}</span>
                          <span className="block text-xs text-muted">{d}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {payWhere === 'pickup' && hasCustom && <p className="mt-2 text-xs text-muted">Made-to-order pieces still need the 50% advance online so we can start making them.</p>}
                </fieldset>
                </>
              )}
            </section>

            <section className="rounded-3xl border border-plum-line bg-plum-card/60 p-5">
              <h2 className="opt-title">Price details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted">Items ({cartCount(live)})</dt><dd className="text-cream">{formatINR(q.subtotal)}</dd></div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Delivery &amp; Packing</dt>
                  <dd className="text-right">
                    {q.free ? <span className="text-[#8fd19e]">Free delivery 🎉</span> : q.deliveryPacking == null ? <span className="text-muted">{zone === 'soon' ? 'Not available yet' : 'Enter pincode'}</span> : <span className="text-cream">{formatINR(q.deliveryPacking)}</span>}
                  </dd>
                </div>
              </dl>
              {q.toFree > 0 && (
                <div className="mt-4 rounded-2xl bg-gold/10 p-3 text-sm text-gold">
                  Add {formatINR(q.toFree)} more for free delivery
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-plum-line">
                    <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${Math.min(100, (q.subtotal / settings.delivery.freeMin) * 100)}%` }} />
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-baseline justify-between border-t border-plum-line pt-4">
                <span className="text-cream">Total</span>
                <span className="text-2xl font-medium text-cream">{formatINR(q.total)}</span>
              </div>
              {(hasCustom || payAtPickup) && (
                <div className="mt-4 space-y-2 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-cream">Pay now</span>
                    <span className="font-medium text-gold">{formatINR(pay.now)}</span>
                  </div>
                  {pay.later > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">{method === 'pickup' ? 'Pay when ready (online)' : 'Pay when ready to dispatch'}</span>
                      <span className="text-cream">{formatINR(pay.later)}</span>
                    </div>
                  )}
                  {pay.atPickup > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">Pay at pickup</span>
                      <span className="text-cream">{formatINR(pay.atPickup)}</span>
                    </div>
                  )}
                  {hasCustom && !payAtPickup && (
                    <p className="pt-1 text-xs leading-relaxed text-muted">
                      {hasReady ? 'Ready-made pieces are paid in full. ' : ''}Made-to-order pieces: 50% advance now, the other 50% when your piece is ready{method === 'pickup' ? '' : ' to dispatch'}.
                      {hasReady && method === 'home' ? ' Your whole order is sent together in one parcel.' : ''}
                    </p>
                  )}
                </div>
              )}
              <button type="button" disabled={!canCheckout} onClick={() => navigate('/checkout')} className="btn-rose shimmer mt-5 hidden w-full disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex">
                Checkout <IconArrow className="h-4 w-4" />
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><IconShield className="h-4 w-4 text-gold" /> Secure UPI payment · Handmade in AP</p>
            </section>
          </aside>
        </div>
      </div>

      {/* phones: total + checkout stays at the bottom */}
      <div className="buy-bar fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-plum/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-muted">{hasCustom || payAtPickup ? 'Pay now' : q.deliveryPacking == null ? 'Total (without delivery)' : 'Total'}</p>
            <p className="text-lg font-medium text-cream">{formatINR(hasCustom || payAtPickup ? pay.now : q.total)}</p>
          </div>
          <button type="button" disabled={!canCheckout} onClick={() => navigate('/checkout')} className="btn-rose ml-auto px-7 disabled:opacity-50">
            {!canCheckout ? (zone === 'soon' ? 'Not available yet' : 'Enter pincode') : payAtPickup && pay.now === 0 ? 'Place order' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Waitlist({ pin }) {
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)
  if (done) return <p className="mt-3 text-sm text-[#8fd19e]">Thank you! We will message you on WhatsApp when we deliver to {pin} 💛</p>
  return (
    <form
      className="mt-3 rounded-2xl bg-blush/5 p-3"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!/^[6-9]\d{9}$/.test(phone)) return
        await joinWaitlist({ phone, pincode: pin })
        setDone(true)
      }}
    >
      <p className="text-sm text-blush">Coming soon to your area 💛</p>
      <p className="mt-1 text-xs text-muted">Leave your WhatsApp number and we will tell you when we start delivering there.</p>
      <div className="mt-2 flex gap-2">
        <input inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="WhatsApp number" aria-label="WhatsApp number" className="field min-w-0 flex-1" />
        <button type="submit" disabled={!/^[6-9]\d{9}$/.test(phone)} className="btn-gold px-4 disabled:opacity-50">Notify me</button>
      </div>
    </form>
  )
}

function EmptyCart({ cat }) {
  const best = cat.products.filter((p) => p.featured).slice(0, 4)
  return (
    <div className="container-page pb-16 pt-14 text-center">
      <div className="glass-shape mx-auto grid h-24 w-24 place-items-center rounded-[28%]">
        <IconTruck className="h-10 w-10 text-gold" />
      </div>
      <h1 className="mt-6 text-4xl sm:text-5xl">Your cart is empty</h1>
      <p className="mt-3 text-muted">Find a piece of preserved nature you will love.</p>
      <Link to="/shop" className="btn-rose shimmer mt-8">Start shopping <IconArrow className="h-4 w-4" /></Link>
      {best.length > 0 && (
        <section className="mt-16 text-left">
          <h2 className="text-3xl">Best sellers</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {best.map((p) => <li key={p.id}><ProductCard p={p} /></li>)}
          </ul>
        </section>
      )}
    </div>
  )
}
