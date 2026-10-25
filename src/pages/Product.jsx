// src/pages/Product.jsx — one product: photos with zoom, size/option, colour, quantity, Add to Cart / Buy Now,
// delivery check, description, care and related pieces. Custom pieces explain the 50% advance.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useCatalog, formatINR, makingText } from '../data/catalog.js'
import { addToCart } from '../data/cart.js'
import { uploadsReady } from '../data/upload.js'
import CustomDetails, { EMPTY_CUSTOM, needsPhoto } from '../components/shop/CustomDetails.jsx'
import { deliveryArea } from '../data/delivery.js'
import { useSettings } from '../data/settings.js'
import { waLink } from '../config/site.js'
import usePageTitle from '../lib/usePageTitle.js'
import Gallery from '../components/shop/Gallery.jsx'
import ProductCard from '../components/shop/ProductCard.jsx'
import { swatch } from '../components/shop/Filters.jsx'
import { IconMinus, IconPlus, IconTruck, IconClock, IconShield, IconPin, IconWhatsApp, IconCheck, IconCart, IconArrow } from '../components/Icons.jsx'

export default function Product() {
  const { slug } = useParams()
  const cat = useCatalog()
  const p = cat?.products.find((x) => x.slug === slug)
  usePageTitle(p ? p.name : cat ? 'Product not found' : '')

  if (!cat) return <ProductSkeleton />
  if (!p)
    return (
      <section className="container-page py-24 text-center">
        <h1 className="text-4xl">This piece isn’t available</h1>
        <p className="mt-3 text-muted">It may have sold out or been renamed.</p>
        <Link to="/shop" className="btn-rose mt-8">Browse the shop</Link>
      </section>
    )
  return <ProductView key={p.id} p={p} cat={cat} />
}

function ProductView({ p, cat }) {
  const navigate = useNavigate()
  const [vi, setVi] = useState(0)
  const [colour, setColour] = useState(p.colours[0] || '')
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState(false)
  const [tab, setTab] = useState('description')
  const variant = p.variants[vi]
  const maxQty = p.type === 'custom' ? 20 : Math.max(1, p.stock)
  const isBlood = p.category === 'blood-art'

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(false), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const related = useMemo(() => {
    const same = cat.products.filter((x) => x.category === p.category && x.id !== p.id)
    const more = cat.products.filter((x) => x.featured && x.category !== p.category)
    return [...same, ...more].slice(0, 4)
  }, [cat, p])

  const [custom, setCustom] = useState(EMPTY_CUSTOM)
  const [customErr, setCustomErr] = useState('')
  const isCustom = p.type === 'custom'
  // made-to-order pieces that need a photo can only be added once a photo is uploaded (when uploads are set up)
  const ok = async () => {
    if (!isCustom || !needsPhoto(p) || custom.photos.length || !(await uploadsReady())) return true
    setCustomErr('Please add your photo first.')
    document.querySelector('fieldset')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  const add = async () => {
    if (!(await ok())) return
    addToCart({ product: p, variant, colour, qty, custom: isCustom ? custom : null })
    if (isCustom) setCustom(EMPTY_CUSTOM)
    setCustomErr('')
    setToast(true)
  }
  const buyNow = async () => {
    if (!(await ok())) return
    addToCart({ product: p, variant, colour, qty, custom: isCustom ? custom : null })
    navigate('/cart')
  }

  return (
    <div className="product-page pb-28 lg:pb-16">
      <div className="container-page pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link to="/" className="hover:text-gold">Home</Link> <span className="mx-1.5">/</span>
          <Link to="/shop" className="hover:text-gold">Shop</Link> <span className="mx-1.5">/</span>
          <Link to={`/shop?category=${p.category}`} className="hover:text-gold">{p.categoryName}</Link>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* photos */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery images={p.images} name={p.name} />
          </div>

          {/* details */}
          <div>
            <div className="flex flex-wrap gap-2">
              {p.featured && <span className="badge bg-gold text-plum">Bestseller</span>}
              {p.type === 'custom' && <span className="badge border border-blush/30 text-blush">Made to order</span>}
            </div>
            <h1 className="mt-3 text-[2.3rem] leading-[1.05] sm:text-5xl">{p.name}</h1>
            <p className="mt-1 text-sm text-gold/80">{p.categoryName}</p>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-3xl font-medium text-cream sm:text-[2.1rem]">{formatINR(variant.price)}</span>
              {p.type === 'custom' && <span className="pb-1.5 text-sm text-muted">Pay {formatINR(Math.ceil(variant.price / 2))} now (50%)</span>}
            </div>

            <p className="mt-5 max-w-xl text-muted">{p.description}</p>

            {/* size / option */}
            {p.variants.length > 1 && (
              <div className="mt-7">
                <h2 className="opt-title">{p.variants.every((v) => /^\d/.test(v.name)) ? 'Size' : 'Option'}: <span className="text-cream">{variant.name}</span></h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.variants.map((v, i) => (
                    <button key={v.name} type="button" onClick={() => setVi(i)} aria-pressed={i === vi} className={`opt ${i === vi ? 'is-on' : ''}`}>
                      <span>{v.name}</span>
                      {p.variants.some((x) => x.price !== v.price) && <span className="text-xs opacity-75">{formatINR(v.price)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* colour */}
            {p.colours.length > 0 && (
              <div className="mt-6">
                <h2 className="opt-title">Colour: <span className="text-cream">{colour}</span></h2>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {p.colours.map((c) => (
                    <button key={c} type="button" onClick={() => setColour(c)} aria-pressed={c === colour} aria-label={c} title={c}
                      className={`grid h-11 w-11 place-items-center rounded-full border-2 transition ${c === colour ? 'border-gold' : 'border-transparent hover:border-blush/40'}`}>
                      <span className="h-8 w-8 rounded-full border border-white/25" style={{ background: swatch(c) }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isCustom && <CustomDetails product={p} value={custom} onChange={(v) => { setCustom(v); setCustomErr('') }} error={customErr} />}

            {/* quantity + buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="qty" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less" disabled={qty <= 1}><IconMinus className="h-4 w-4" /></button>
                <span aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="More" disabled={qty >= maxQty}><IconPlus className="h-4 w-4" /></button>
              </div>
              {p.available ? (
                <>
                  <button type="button" onClick={add} className="btn-rose shimmer flex-1 sm:flex-none sm:px-9">
                    <IconCart className="h-5 w-5" /> Add to Cart
                  </button>
                  <button type="button" onClick={buyNow} className="btn-gold w-full sm:w-auto sm:px-9">Buy Now</button>
                </>
              ) : (
                <a href={waLink(`Hi Inviname Arts, please tell me when "${p.name}" is back in stock.`)} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">
                  <IconWhatsApp className="h-4 w-4" /> Sold out – notify me
                </a>
              )}
            </div>
            {p.type === 'ready-made' && p.stock > 0 && p.stock <= 5 && <p className="mt-3 text-sm text-rose-light">Only {p.stock} left in stock</p>}

            {/* key facts */}
            <ul className="mt-8 grid gap-3 rounded-3xl border border-plum-line bg-plum-card/60 p-5 text-sm sm:grid-cols-2">
              <li className="flex gap-3"><IconClock className="h-5 w-5 shrink-0 text-gold" /><span>{makingText(p)}</span></li>
              <li className="flex gap-3"><IconTruck className="h-5 w-5 shrink-0 text-gold" /><span>Delivery only to Andhra Pradesh &amp; Telangana</span></li>
              <li className="flex gap-3"><IconPin className="h-5 w-5 shrink-0 text-gold" /><span>Ships from Pothavaram, AP · pickup available</span></li>
              <li className="flex gap-3"><IconShield className="h-5 w-5 shrink-0 text-gold" /><span>Pay by UPI · handmade with real flowers</span></li>
            </ul>

            <PincodeCheck />

            {/* custom pieces */}
            {p.type === 'custom' && (
              <div className="mt-6 rounded-3xl border border-gold/30 bg-gold/[0.06] p-5 text-sm">
                <h2 className="font-sans text-base font-medium text-gold">Made just for you</h2>
                <p className="mt-2 text-cream">Pay 50% now to start making it. Pay the other 50% when your piece is ready to dispatch.</p>
                <p className="mt-2 text-muted">
                  {isBlood
                    ? 'After you order, we show you exactly how to dry and post your sample. Samples are handled with gloves and used only for your order.'
                    : 'Add your photo and details in “Your details” above. After you order, we confirm everything with you on WhatsApp before we start.'}
                </p>
              </div>
            )}

            {/* description / care / delivery */}
            <div className="mt-8">
              <div role="tablist" className="flex gap-1 border-b border-plum-line">
                {[['description', 'Details'], ['care', 'Care'], ['delivery', 'Delivery & returns']].map(([k, l]) => (
                  <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}
                    className={`-mb-px border-b-2 px-3 py-3 text-sm transition sm:px-4 ${tab === k ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-cream'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="py-5 text-sm leading-relaxed text-muted">
                {tab === 'description' && (
                  <ul className="space-y-2">
                    <li>{p.description}</li>
                    <li><span className="text-cream">Option:</span> {variant.name} · <span className="text-cream">Packed weight:</span> about {variant.weight} g</li>
                    <li><span className="text-cream">Type:</span> {p.type === 'custom' ? 'Made to order' : 'Ready-made'}</li>
                    <li>Every piece is handmade, so flowers and flakes vary slightly. No two are exactly alike.</li>
                  </ul>
                )}
                {tab === 'care' && <p>{p.care || 'Keep away from direct sunlight, perfume and sharp objects. Wipe gently with a soft, dry cloth. Store in the pouch it comes in.'}</p>}
                {tab === 'delivery' && (
                  <p>
                    We deliver to Andhra Pradesh and Telangana, or you can pick up from Pothavaram. The delivery &amp; packing charge is shown in the cart.
                    {' '}<Link to="/shipping-policy" className="text-gold hover:underline">Shipping policy</Link> · <Link to="/returns-and-replacement" className="text-gold hover:underline">Returns &amp; replacement</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl">You may also love</h2>
              <Link to={`/shop?category=${p.category}`} className="hidden shrink-0 items-center gap-1 text-sm text-gold hover:underline sm:inline-flex">
                More {p.categoryName} <IconArrow className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {related.map((r) => <li key={r.id}><ProductCard p={r} /></li>)}
            </ul>
          </section>
        )}
      </div>

      {/* phones: price + add to cart stays at the bottom */}
      {p.available && (
        <div className="buy-bar fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-plum/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">{variant.name}{colour && ` · ${colour}`}</p>
              <p className="text-lg font-medium text-cream">{formatINR(variant.price * qty)}</p>
            </div>
            <button type="button" onClick={add} className="btn-rose ml-auto px-5"><IconCart className="h-5 w-5" /> Add</button>
            <button type="button" onClick={buyNow} className="btn-gold px-5">Buy Now</button>
          </div>
        </div>
      )}

      {/* "added" message */}
      <div role="status" className={`toast fixed left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-gold/40 bg-plum-card px-5 py-3 text-sm text-cream shadow-[0_20px_50px_rgb(0_0_0_/_0.6)] transition duration-300 ${toast ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
        <IconCheck className="h-5 w-5 text-gold" /> Added to cart
        <Link to="/cart" className="font-medium text-gold hover:underline">View cart</Link>
      </div>
    </div>
  )
}

function PincodeCheck() {
  const settings = useSettings()
  const [pin, setPin] = useState(() => {
    try {
      return localStorage.getItem('inv-pin') || ''
    } catch {
      return ''
    }
  })
  const [res, setRes] = useState(null)
  const check = (e) => {
    e.preventDefault()
    const r = deliveryArea(pin, settings)
    setRes(r)
    if (r !== 'invalid') {
      try {
        localStorage.setItem('inv-pin', pin) // the cart uses the same pincode
      } catch {}
    }
  }
  return (
    <form onSubmit={check} className="mt-5">
      <label htmlFor="pin" className="opt-title">Check delivery</label>
      <div className="mt-2 flex gap-2">
        <input id="pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setRes(null) }}
          placeholder="Enter pincode" className="field w-40 sm:w-48" />
        <button type="submit" className="btn-ghost min-h-11 px-5">Check</button>
      </div>
      {res === 'ok' && <p className="mt-2 text-sm text-[#8fd19e]">✓ We deliver to {pin}. The delivery charge is shown in the cart.</p>}
      {res === 'soon' && (
        <p className="mt-2 text-sm text-blush">
          Coming soon to your area 💛 <a href={waLink(`Hi Inviname Arts, please tell me when you deliver to ${pin}.`)} target="_blank" rel="noopener noreferrer" className="text-gold underline">Tell me when</a>
        </p>
      )}
      {res === 'invalid' && <p className="mt-2 text-sm text-rose-light">Please enter a valid 6-digit pincode.</p>}
    </form>
  )
}

function ProductSkeleton() {
  return (
    <div className="container-page grid gap-8 pt-14 lg:grid-cols-2" aria-busy="true">
      <div className="skeleton aspect-square rounded-[2rem]" />
      <div className="space-y-4">
        <div className="skeleton h-10 w-3/4 rounded-xl" />
        <div className="skeleton h-8 w-1/4 rounded-xl" />
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-12 w-1/2 rounded-full" />
      </div>
    </div>
  )
}
