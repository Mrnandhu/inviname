// src/pages/JoinAdmin.jsx — opened from the owner's one-time invite link (/join-admin/<code>).
// The person logs in with their own account, taps Accept, and becomes an admin. Links work for 15 minutes, once.
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { useAuth } from '../data/auth.js'
import { getInvite, acceptInvite, inviteLeft } from '../data/team.js'
import usePageTitle from '../lib/usePageTitle.js'

export default function JoinAdmin() {
  usePageTitle('Join the team')
  const { code = '' } = useParams()
  const { user, isAdmin, adminChecked } = useAuth()
  const [inv, setInv] = useState(undefined) // undefined = loading, null = not valid
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!user) return
    getInvite(code).then(setInv)
  }, [user, code])

  async function accept() {
    setBusy(true)
    setErr('')
    try {
      await acceptInvite(code, user, inv.name)
      location.assign('/admin/') // full reload so the admin panel (and its app install) opens with the new access
    } catch (e) {
      setErr(e.code === 'permission-denied' ? 'This link has expired or was already used. Ask the owner for a new one.' : 'Could not join. Please check your internet and try again.')
      setBusy(false)
    }
  }

  const box = (children) => (
    <section className="container-page max-w-xl py-14 sm:py-20">
      <p className="label">Inviname Arts</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Admin team invite</h1>
      <div className="mt-8 rounded-3xl border border-plum-line bg-plum-card/70 p-6 sm:p-8">{children}</div>
    </section>
  )

  if (!adminChecked || inv === undefined) return box(<div className="skeleton h-24 rounded-2xl" />)
  if (isAdmin)
    return box(
      <>
        <p className="text-cream">You already have admin access.</p>
        <Link to="/admin/" className="btn-rose mt-5">Open the admin panel</Link>
      </>,
    )
  if (!inv)
    return box(
      <p className="text-muted">This invite link has expired or was already used. Links work once, for 15 minutes. Ask the owner to send a new one.</p>,
    )
  return box(
    <>
      <p className="text-cream">
        Join the Inviname Arts admin team as <b>{inv.name}</b>?
      </p>
      <p className="mt-2 text-sm text-muted">
        You are logged in as <span className="text-cream">{user.email}</span>. You will be able to manage orders, products and the website.
        This link works for {Math.ceil(inviteLeft(inv) / 60000)} more minute(s).
      </p>
      <button type="button" onClick={accept} disabled={busy} className="btn-rose mt-6 w-full disabled:opacity-60 sm:w-auto">
        {busy ? 'Joining…' : 'Accept and open the admin panel'}
      </button>
      {err && <p className="mt-3 text-sm text-rose-light">{err}</p>}
    </>,
  )
}
