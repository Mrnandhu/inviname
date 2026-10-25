// src/components/Navbar.jsx — sticky top bar; on phones the links open in a slide-down menu
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import Logo from './Logo.jsx'
import { IconSearch, IconCart, IconMenu, IconClose } from './Icons.jsx'
import { NAV } from '../config/site.js'
import { useCart, cartCount as countItems } from '../data/cart.js'
import { useAuth, logOut } from '../data/auth.js'
import AccountMenu from './AccountMenu.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const cartCount = countItems(useCart())
  const { user, isAdmin } = useAuth()

  // Close the phone menu after moving to another page (curly braces: an effect must not return a value)
  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const link = ({ isActive }) =>
    `relative py-2 text-sm tracking-wide transition hover:text-gold ${isActive ? 'text-gold' : 'text-cream'}`

  return (
    <header
      className={`sticky top-0 z-40 transition duration-300 ${scrolled || open ? 'bg-plum/90 shadow-[0_10px_30px_-20px_black] backdrop-blur-md' : 'bg-transparent'}`}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <Link to="/shop?focus=search" className="hidden h-11 w-11 place-items-center rounded-full text-cream transition hover:text-gold min-[360px]:grid" aria-label="Search products">
            <IconSearch />
          </Link>
          <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full text-cream transition hover:text-gold" aria-label={`Cart, ${cartCount} items`}>
            <IconCart />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[0.65rem] font-semibold text-white">{cartCount}</span>
            )}
          </Link>
          <AccountMenu />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full text-cream md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Phone menu */}
      <div id="mobile-menu" className={`overflow-hidden border-plum-line transition-[max-height] duration-300 md:hidden ${open ? 'max-h-[36rem] border-t' : 'max-h-0'}`}>
        <nav className="container-page flex flex-col py-3" aria-label="Mobile">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `border-b border-plum-line/60 py-3.5 font-serif text-xl ${isActive ? 'text-gold' : 'text-blush'}`}>
              {n.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/my-orders" className={({ isActive }) => `border-b border-plum-line/60 py-3.5 font-serif text-xl ${isActive ? 'text-gold' : 'text-blush'}`}>My orders</NavLink>
              {isAdmin && <NavLink to="/admin" className="border-b border-plum-line/60 py-3.5 font-serif text-xl text-blush">Admin panel</NavLink>}
              <button type="button" onClick={() => logOut()} className="py-3.5 text-left font-serif text-xl text-muted">Log out <span className="font-sans text-xs">({user.email})</span></button>
            </>
          ) : (
            <NavLink to={`/login?next=${encodeURIComponent(pathname)}`} className="py-3.5 font-serif text-xl text-blush">Log in / Sign up</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
