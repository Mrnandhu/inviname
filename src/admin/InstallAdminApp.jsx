// src/admin/InstallAdminApp.jsx — "Install Inviname Admin app" card on the admin Dashboard.
// The admin app is never in an app store: it can only be installed from inside the admin panel.
// Once installed it opens straight to the admin panel and stays logged in on that phone.
import { useEffect, useState } from 'react'

const installed = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true

export default function InstallAdminApp() {
  const [offer, setOffer] = useState(() => window.__installPrompt || null)
  const [done, setDone] = useState(installed())
  const [hide, setHide] = useState(() => {
    try {
      return localStorage.getItem('inv-admin-app-hint') === 'hidden'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const ready = () => setOffer(window.__installPrompt || null)
    const ok = () => setDone(true)
    window.addEventListener('install-ready', ready)
    window.addEventListener('appinstalled', ok)
    return () => {
      window.removeEventListener('install-ready', ready)
      window.removeEventListener('appinstalled', ok)
    }
  }, [])

  if (done || hide) return null

  async function install() {
    offer.prompt()
    const { outcome } = await offer.userChoice
    window.__installPrompt = null
    setOffer(null)
    if (outcome === 'accepted') setDone(true)
  }
  function dismiss() {
    setHide(true)
    try {
      localStorage.setItem('inv-admin-app-hint', 'hidden')
    } catch {}
  }

  const iphone = /iphone|ipad/i.test(navigator.userAgent)
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-gold/40 bg-gold/[0.06] p-5">
      <img src="/icons/admin-192.png" alt="" className="h-14 w-14 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-cream">Install the Inviname Admin app</p>
        <p className="text-sm text-muted">
          {offer
            ? 'Opens straight to this admin panel from your home screen and stays logged in on this phone.'
            : iphone
              ? 'In Safari: tap Share, then “Add to Home Screen”.'
              : 'In Chrome: tap ⋮ (top right), then “Install app” or “Add to Home screen”.'}
        </p>
      </div>
      <div className="flex gap-2">
        {offer && (
          <button type="button" onClick={install} className="btn-rose min-h-11 px-5">
            Install
          </button>
        )}
        <button type="button" onClick={dismiss} className="btn-ghost min-h-11 px-4">
          Not now
        </button>
      </div>
    </div>
  )
}
