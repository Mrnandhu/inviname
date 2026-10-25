// src/components/Layout.jsx — navbar + page + footer, used by every page
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { useSettings } from '../data/settings.js'
import { useContent } from '../data/content.js'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  useSettings() // loads shop settings early (WhatsApp number, colours) for every page
  const bar = useContent().announcement

  // Start each new page at the top.
  // The curly braces matter: an effect may only return a cleanup function, and
  // newer browsers make scrollTo() return a value, which React would try to call.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-rose focus:px-4 focus:py-2">
        Skip to content
      </a>
      {bar?.text && (
        <div className="relative z-50 bg-gold px-4 py-2 text-center text-sm font-medium text-plum">
          {bar.link ? <Link to={bar.link} className="hover:underline">{bar.text} →</Link> : bar.text}
        </div>
      )}
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
