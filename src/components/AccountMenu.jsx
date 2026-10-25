// src/components/AccountMenu.jsx — the person icon in the navbar: log in, or (when logged in) a small menu
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth, logOut } from '../data/auth.js'
import { IconUser } from './Icons.jsx'

export default function AccountMenu() {
  const { user, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    if (!open) return
    const close = (e) => !box.current?.contains(e.target) && setOpen(false)
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  if (!user)
    return (
      <Link to={`/login?next=${encodeURIComponent(pathname)}`} className="hidden h-11 w-11 place-items-center rounded-full text-cream transition hover:text-gold sm:grid" aria-label="Log in">
        <IconUser />
      </Link>
    )

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
  return (
    <div ref={box} className="relative hidden sm:block">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" aria-label="Your account"
        className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-gold/50 bg-gold/15 text-sm font-semibold text-gold transition hover:border-gold">
        {user.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : initial}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-plum-line bg-plum-card shadow-[0_20px_50px_rgb(0_0_0_/_0.6)]">
          <div className="border-b border-plum-line px-4 py-3">
            <p className="truncate text-sm font-medium text-cream">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link role="menuitem" to="/my-orders" className="block px-4 py-3 text-sm text-cream hover:bg-plum hover:text-gold">My orders</Link>
          {isAdmin && <Link role="menuitem" to="/admin" className="block px-4 py-3 text-sm text-cream hover:bg-plum hover:text-gold">Admin panel</Link>}
          <button role="menuitem" type="button" onClick={() => logOut()} className="block w-full border-t border-plum-line px-4 py-3 text-left text-sm text-muted hover:bg-plum hover:text-rose-light">Log out</button>
        </div>
      )}
    </div>
  )
}
