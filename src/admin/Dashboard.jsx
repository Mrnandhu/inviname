// src/admin/Dashboard.jsx — today's orders, payments to check, orders to ship, this month's sales
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { list } from './db.js'
import { formatINR } from '../data/catalog.js'
import { needsAction } from './orderTools.js'

export default function Dashboard() {
  const [orders, setOrders] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    list('orders')
      .then((o) => setOrders(o.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((e) => setErr(e.code || e.message))
  }, [])
  if (err) return <p className="text-rose-light">Could not load orders: {err}</p>
  if (!orders) return <div className="skeleton h-48 rounded-3xl" />

  const today = new Date().toDateString()
  const month = new Date().toISOString().slice(0, 7)
  const sales = orders.flatMap((o) => o.payments || []).filter((p) => p.verified && (p.at || '').startsWith(month)).reduce((s, p) => s + p.amount, 0)
  const toCheck = orders.filter(needsAction)
  const toShip = orders.filter((o) => ['Paid', 'Packed', 'Ready to ship', 'Ready for pickup'].includes(o.status))
  const cards = [
    ["Today's orders", orders.filter((o) => new Date(o.createdAt).toDateString() === today).length],
    ['Payments to check', toCheck.length],
    ['To pack / ship', toShip.length],
    ['Sales this month', formatINR(sales)],
  ]
  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([t, v]) => (
          <li key={t} className="rounded-3xl border border-plum-line bg-plum-card/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{t}</p>
            <p className="mt-2 font-serif text-4xl text-blush">{v}</p>
          </li>
        ))}
      </ul>
      <section className="rounded-3xl border border-plum-line bg-plum-card/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-sans text-lg font-medium text-cream">Needs your attention</h2>
          <Link to="/admin/orders" className="text-sm text-gold hover:underline">All orders</Link>
        </div>
        {[...toCheck, ...toShip].length ? (
          <ul className="divide-y divide-plum-line">
            {[...toCheck, ...toShip].slice(0, 10).map((o) => (
              <li key={o.id}>
                <Link to={`/admin/orders?id=${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:text-gold">
                  <span className="text-cream">{o.id} · {o.customer?.name}</span>
                  <span className="badge border border-gold/40 text-gold">{needsAction(o) ? 'Check payment' : o.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">All caught up ✓</p>
        )}
      </section>
      <p className="text-xs text-muted">Tip: open this page on your phone and add it to your home screen for quick access.</p>
    </div>
  )
}
