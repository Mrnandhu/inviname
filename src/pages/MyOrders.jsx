// src/pages/MyOrders.jsx — the customer's orders with status, and anything still to pay.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../data/auth.js'
import { myOrders, nextPayment } from '../data/orders.js'
import { formatINR, img } from '../data/catalog.js'
import usePageTitle from '../lib/usePageTitle.js'
import ArtImage from '../components/home/ArtImage.jsx'
import { IconArrow, IconTruck } from '../components/Icons.jsx'

export default function MyOrders() {
  usePageTitle('My orders')
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)
  useEffect(() => {
    if (user) myOrders(user.uid).then(setOrders).catch(() => setOrders([]))
  }, [user])

  return (
    <section className="container-page pb-16 pt-8 sm:pt-12">
      <p className="label">Your account</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">My Orders</h1>
      {!orders ? (
        <div className="mt-8 space-y-3">{[0, 1].map((i) => <div key={i} className="skeleton h-28 rounded-3xl" />)}</div>
      ) : !orders.length ? (
        <div className="card mt-8 p-8 text-center">
          <p className="text-cream">No orders yet.</p>
          <Link to="/shop" className="btn-rose mt-6">Start shopping</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => {
            const due = nextPayment(o)
            return (
              <li key={o.id}>
                <Link to={`/order/${o.id}`} className="group block rounded-3xl border border-plum-line bg-plum-card/60 p-4 transition hover:border-gold/50 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex shrink-0 -space-x-3">
                      {o.items.slice(0, 3).map((i, k) => (
                        <ArtImage key={k} src={img(i.image, true)} alt="" className="h-12 w-12 rounded-full border-2 border-plum-card bg-plum sm:h-14 sm:w-14" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="text-cream">{o.id}</span>
                        <span className="shrink-0 text-cream">{formatINR(o.totals.total)}</span>
                      </p>
                      <p className="truncate text-xs text-muted sm:text-sm">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.map((i) => i.name).join(', ')}
                      </p>
                    </div>
                    <IconArrow className="hidden h-5 w-5 shrink-0 text-gold transition group-hover:translate-x-1 sm:block" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="badge border border-gold/40 text-gold">{o.status}</span>
                    {o.tracking && <span className="flex items-center gap-1 text-muted"><IconTruck className="h-4 w-4" /> {o.tracking}</span>}
                    {due && <span className="ml-auto rounded-full bg-rose px-3 py-1.5 text-white">{due.stage === 'balance' ? 'Pay remaining balance' : 'Complete payment'} · {formatINR(due.amount)}</span>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
