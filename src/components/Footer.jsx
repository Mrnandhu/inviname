// src/components/Footer.jsx
import { Link } from 'react-router'
import Logo from './Logo.jsx'
import { IconWhatsApp, IconInstagram, IconPin } from './Icons.jsx'
import { SITE, waLink } from '../config/site.js'
import { useContent } from '../data/content.js'
import { useSettings } from '../data/settings.js'
import { safeUrl } from '../lib/safeUrl.js'

const SHOP = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
const HELP = [
  { to: '/shipping-policy', label: 'Shipping Policy' },
  { to: '/returns-and-replacement', label: 'Returns & Replacement' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms' },
]

// Footer line from Admin → Website; WhatsApp, Instagram and email from Admin → Settings.
export default function Footer() {
  const tagline = useContent().footer.tagline
  const s = useSettings()
  const instagram = safeUrl(s.contact.instagram, ['instagram.com'])
  return (
    <footer className="mt-24 border-t border-plum-line bg-[#180E14]">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{tagline}</p>
        </div>

        <FooterList title="Explore" items={SHOP} />
        <FooterList title="Help" items={HELP} />

        <div className="space-y-4">
          <h2 className="label">Talk to us</h2>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-cream transition hover:text-gold">
            <IconWhatsApp className="h-5 w-5 text-[#25D366]" /> WhatsApp {s.contact.phoneDisplay}
          </a>
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-cream transition hover:text-gold">
              <IconInstagram className="h-5 w-5 text-gold" /> Instagram
            </a>
          )}
          {s.contact.email && (
            <a href={`mailto:${s.contact.email}`} className="block break-all text-sm text-cream transition hover:text-gold">{s.contact.email}</a>
          )}
          <p className="flex items-center gap-3 text-sm text-muted">
            <IconPin className="h-5 w-5 text-gold" /> Ships from {s.pickup.place}
          </p>
        </div>
      </div>
      <div className="border-t border-plum-line/70">
        <p className="container-page py-6 text-xs text-muted">© {new Date().getFullYear()} {SITE.name}. Handmade with love in Andhra Pradesh.</p>
      </div>
    </footer>
  )
}

function FooterList({ title, items }) {
  return (
    <div className="space-y-4">
      <h2 className="label">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-sm text-cream transition hover:text-gold">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
