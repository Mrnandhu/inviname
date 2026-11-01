// src/admin/AdminApp.jsx — the admin panel: a menu on the left (a scrolling row on phones) and the chosen section.
// Address: /admin/<section>, e.g. /admin/orders, /admin/products, /admin/website, /admin/settings
import { lazy, Suspense, useEffect } from 'react'
import InstallAdminApp from './InstallAdminApp.jsx'
import { Link, useLocation } from 'react-router'
import Dashboard from './Dashboard.jsx'
import { logOut } from '../data/auth.js'

// For safety the admin is logged out after 30 minutes without any activity in a browser (e.g. a laptop left open).
// Not in the installed admin app on your own phones.
const IDLE_MS = 30 * 60 * 1000
function useIdleLogout() {
  useEffect(() => {
    // the installed "Inviname Admin" app on your own phones stays logged in; browsers still log out when idle
    const installedApp = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true
    if (installedApp) return
    let timer
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => logOut().finally(() => location.assign('/login?next=/admin')), IDLE_MS)
    }
    const events = ['pointerdown', 'keydown', 'scroll', 'visibilitychange']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [])
}

const SECTIONS = [
  ['', 'Dashboard', Dashboard],
  ['orders', 'Orders', lazy(() => import('./Orders.jsx'))],
  ['products', 'Products', lazy(() => import('./Products.jsx'))],
  ['categories', 'Categories', lazy(() => import('./Categories.jsx'))],
  ['website', 'Website content', lazy(() => import('./Website.jsx'))],
  ['settings', 'Settings', lazy(() => import('./Settings.jsx'))],
  ['reviews', 'Reviews', lazy(() => import('./Reviews.jsx'))],
  ['wholesale', 'Wholesale', lazy(() => import('./WholesaleApps.jsx'))],
  ['waitlist', 'Waitlist', lazy(() => import('./Waitlist.jsx'))],
  ['team', 'Team', lazy(() => import('./Team.jsx'))],
  ['setup', 'Setup', lazy(() => import('./Setup.jsx'))],
]

export default function AdminApp() {
  useIdleLogout()
  // while in the admin panel, Chrome's "Install app" installs "Inviname Admin" (not the customer app)
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]')
    if (!link) return
    const before = link.getAttribute('href')
    link.setAttribute('href', '/admin.webmanifest')
    return () => link.setAttribute('href', before)
  }, [])
  const { pathname } = useLocation()
  const key = pathname.split('/')[2] || ''
  const [, title, Section] = SECTIONS.find((s) => s[0] === key) || SECTIONS[0]
  return (
    <div className="container-page py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[13rem_1fr] lg:gap-10">
        <nav aria-label="Admin" className="no-scrollbar -mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
          <p className="label mb-3 hidden lg:block">Admin panel</p>
          <ul className="flex min-w-max gap-2 lg:sticky lg:top-24 lg:min-w-0 lg:flex-col lg:gap-1">
            {SECTIONS.map(([k, label]) => (
              <li key={k}>
                <Link
                  to={`/admin${k ? '/' + k : ''}`}
                  aria-current={k === key ? 'page' : undefined}
                  className={`block rounded-full px-4 py-2 text-sm transition lg:rounded-xl ${k === key ? 'bg-gold text-plum' : 'border border-plum-line text-cream hover:border-gold/50 lg:border-transparent'}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0">
          <h1 className="mb-6 text-4xl sm:text-5xl">{title}</h1>
          {key === '' && <InstallAdminApp />}
          <Suspense fallback={<div className="skeleton h-64 rounded-3xl" />}>
            <Section />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
