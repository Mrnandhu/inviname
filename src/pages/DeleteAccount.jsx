// src/pages/DeleteAccount.jsx — how a customer can ask to delete their account and data.
// Google Play requires this page for apps where people create accounts (link it in Play Console → Data safety).
import { waLink } from '../config/site.js'
import { useSettings } from '../data/settings.js'
import { useAuth } from '../data/auth.js'
import usePageTitle from '../lib/usePageTitle.js'

export default function DeleteAccount() {
  usePageTitle('Delete your account')
  const s = useSettings()
  const { user } = useAuth()
  const msg = `Hi Inviname Arts, please delete my account and data. My account email: ${user?.email || '(your email)'}`
  return (
    <section className="container-page max-w-3xl pb-16 pt-10 sm:pt-16">
      <p className="label">Your data</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Delete your account</h1>
      <div className="mt-6 space-y-4 text-muted">
        <p>You can ask us to delete your Inviname Arts account and personal data at any time, from the website or the app.</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Send us a request on WhatsApp{s.contact.email ? ' or by email' : ''} from the phone number or email linked to your account.</li>
          <li>We confirm it is you and delete your account, saved addresses, cart and profile within 7 days.</li>
          <li>We send you a message when it is done.</li>
        </ol>
        <p>
          <span className="text-cream">What we keep:</span> order and payment records (order number, items, amounts, dates) for up to 8 years,
          because Indian tax and accounting law requires it. These are not used for anything else.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={waLink(msg)} target="_blank" rel="noopener noreferrer" className="btn-rose">Request deletion on WhatsApp</a>
        {s.contact.email && (
          <a href={`mailto:${s.contact.email}?subject=${encodeURIComponent('Delete my account')}&body=${encodeURIComponent(msg)}`} className="btn-ghost">
            Email {s.contact.email}
          </a>
        )}
      </div>
      <p className="mt-4 text-sm text-muted">WhatsApp: {s.contact.phoneDisplay}{s.contact.email ? ` · Email: ${s.contact.email}` : ''}</p>
    </section>
  )
}
