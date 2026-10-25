// src/pages/Wholesale.jsx — wholesale info (Admin → Website) and the application form.
// Approved shops get "Wholesale mode" in their cart (wholesale prices, min pieces, discount).
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useContent } from '../data/content.js'
import { useAuth } from '../data/auth.js'
import { useWholesale, applyWholesale } from '../data/wholesale.js'
import usePageTitle from '../lib/usePageTitle.js'
import ContentPage from '../components/ContentPage.jsx'

export default function Wholesale() {
  const p = useContent().pages.wholesale
  usePageTitle('Wholesale', p.intro)
  return <ContentPage label="For shops & events" title={p.title} intro={p.intro} body={p.body} aside={<ApplyBox />} />
}

function ApplyBox() {
  const { user } = useAuth()
  const { app, ready, setApp } = useWholesale()
  const [f, setF] = useState({ shopName: '', ownerName: user?.name || '', phone: '', city: '', gst: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const box = 'rounded-3xl border border-gold/25 bg-plum-card/70 p-6'
  // fill in the name once the account has loaded
  useEffect(() => {
    if (user?.name) setF((o) => (o.ownerName ? o : { ...o, ownerName: user.name }))
  }, [user])

  if (!user)
    return (
      <div className={box}>
        <h2 className="font-sans text-lg font-medium text-cream">Apply for wholesale</h2>
        <p className="mt-2 text-sm text-muted">Log in or create an account first, so we can link wholesale prices to your account.</p>
        <Link to="/login?next=/wholesale" className="btn-rose mt-5 w-full">Log in to apply</Link>
      </div>
    )
  if (!ready) return <div className="skeleton h-64 rounded-3xl" />
  if (app && app.status !== 'rejected')
    return (
      <div className={box}>
        <h2 className="font-sans text-lg font-medium text-cream">{app.status === 'approved' ? 'You are approved ✓' : 'Application received'}</h2>
        <p className="mt-2 text-sm text-muted">
          {app.status === 'approved' ? 'Switch on “Wholesale mode” in your cart to see wholesale prices.' : `Thank you, ${app.ownerName}. We will check your details and reply on WhatsApp.`}
        </p>
        {app.status === 'approved' && <Link to="/shop" className="btn-rose mt-5 w-full">Start a wholesale order</Link>}
      </div>
    )

  const set = (k) => (e) => setF((o) => ({ ...o, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value }))
  async function submit(e) {
    e.preventDefault()
    if (f.shopName.trim().length < 2 || f.ownerName.trim().length < 2 || f.city.trim().length < 2) return setErr('Please fill in shop name, your name and city.')
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setErr('Please enter a valid 10-digit mobile number.')
    setBusy(true)
    try {
      setApp(await applyWholesale(user.uid, f))
    } catch {
      setErr('Could not send. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  const input = (label, k, extra = {}) => (
    <label className="block text-sm text-muted">{label}<input value={f[k]} onChange={set(k)} className="field mt-1 w-full rounded-2xl" {...extra} /></label>
  )
  return (
    <form onSubmit={submit} className={`${box} space-y-3`}>
      <h2 className="font-sans text-lg font-medium text-cream">Apply for wholesale</h2>
      {app?.status === 'rejected' && <p className="text-xs text-rose-light">Your last application was not approved. You can apply again.</p>}
      {input('Shop name', 'shopName')}
      {input('Your name', 'ownerName')}
      {input('Mobile (WhatsApp)', 'phone', { inputMode: 'numeric' })}
      {input('City', 'city')}
      {input('GST number (optional)', 'gst')}
      {err && <p role="alert" className="text-sm text-rose-light">{err}</p>}
      <button type="submit" disabled={busy} className="btn-rose shimmer w-full">{busy ? 'Sending…' : 'Send application'}</button>
    </form>
  )
}
