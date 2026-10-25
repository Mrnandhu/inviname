// src/pages/Contact.jsx — WhatsApp, email, Instagram and pickup place (from Admin → Settings / Website)
import { useContent } from '../data/content.js'
import { useSettings } from '../data/settings.js'
import { waLink } from '../config/site.js'
import usePageTitle from '../lib/usePageTitle.js'
import { IconWhatsApp, IconInstagram, IconPin, IconClock } from '../components/Icons.jsx'

export default function Contact() {
  const p = useContent().pages.contact
  const s = useSettings()
  usePageTitle('Contact', p.intro)
  const rows = [
    [IconWhatsApp, 'WhatsApp', s.contact.phoneDisplay, waLink()],
    s.contact.email && [null, 'Email', s.contact.email, `mailto:${s.contact.email}`],
    s.contact.instagram && [IconInstagram, 'Instagram', s.contact.instagram.replace(/^https?:\/\/(www\.)?/, ''), s.contact.instagram],
    [IconPin, 'Pickup', s.pickup.place],
    p.hours && [IconClock, 'Hours', p.hours],
  ].filter(Boolean)
  return (
    <section className="container-page max-w-3xl pb-16 pt-10 sm:pt-16">
      <p className="label">Say hello</p>
      <h1 className="mt-3 text-4xl sm:text-6xl">{p.title}</h1>
      <p className="mt-4 text-lg text-muted">{p.intro}</p>
      <ul className="mt-8 divide-y divide-plum-line rounded-3xl border border-plum-line bg-plum-card/60">
        {rows.map(([Icon, label, value, href]) => (
          <li key={label} className="flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">{Icon ? <Icon className="h-5 w-5" /> : '@'}</span>
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-[0.18em] text-muted">{label}</span>
              {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-all text-cream hover:text-gold">{value}</a> : <span className="text-cream">{value}</span>}
            </span>
          </li>
        ))}
      </ul>
      <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-rose shimmer mt-8"><IconWhatsApp className="h-5 w-5" /> Chat on WhatsApp</a>
    </section>
  )
}
