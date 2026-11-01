// src/admin/Team.jsx — who can use the admin panel. The owner invites helpers (e.g. family) with a one-time
// link that works for 15 minutes, and can remove them at any time. Helpers ("admin") can do everything
// except manage the team.
import { useEffect, useState } from 'react'
import { useAuth } from '../data/auth.js'
import { createInvite, listInvites, cancelInvite, listAdmins, removeAdmin, inviteLink, inviteLeft, when, INVITE_MINUTES } from '../data/team.js'
import { Card, Field, ConfirmButton } from './ui.jsx'

const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`

export default function Team() {
  const { user, isOwner } = useAuth()
  const [admins, setAdmins] = useState(null)
  const [invites, setInvites] = useState([])
  const [name, setName] = useState('')
  const [fresh, setFresh] = useState(null) // the link just made
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const [, tick] = useState(0)

  async function reload() {
    try {
      const [a, inv] = await Promise.all([listAdmins(), listInvites()])
      setAdmins(a.sort((x, y) => (x.role === 'owner' ? -1 : y.role === 'owner' ? 1 : 0)))
      // tidy up: links that were used or ran out are deleted
      const dead = inv.filter((i) => i.used || inviteLeft(i) <= 0)
      dead.forEach((i) => cancelInvite(i.code).catch(() => {}))
      setInvites(inv.filter((i) => !dead.includes(i)))
    } catch (e) {
      setErr('Could not load the team: ' + (e.code || e.message))
    }
  }

  useEffect(() => {
    if (isOwner) reload()
  }, [isOwner])

  // live countdown for open links
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  if (!isOwner)
    return (
      <Card title="Team">
        <p className="text-sm text-muted">Only the shop owner can add or remove admins. Ask the owner if someone needs access.</p>
      </Card>
    )

  async function invite(e) {
    e.preventDefault()
    if (name.trim().length < 2) return setErr('Please type the person’s name.')
    setBusy(true)
    setErr('')
    setCopied(false)
    try {
      const code = await createInvite(name, user.uid)
      setFresh({ code, name: name.trim(), createdAt: new Date().toISOString() })
      setName('')
      reload()
    } catch (e2) {
      setErr('Could not create the link: ' + (e2.code || e2.message))
    } finally {
      setBusy(false)
    }
  }

  async function copy(link) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
      setErr('Could not copy automatically. Press and hold the link to copy it.')
    }
  }

  const freshLeft = fresh ? inviteLeft(fresh) : 0
  const open = invites.filter((i) => !i.used && inviteLeft(i) > 0)

  return (
    <div className="space-y-6">
      <Card title="Admins">
        {!admins ? (
          <div className="skeleton h-24 rounded-2xl" />
        ) : (
          <ul className="divide-y divide-plum-line">
            {admins.map((a) => (
              <li key={a.uid} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block text-cream">
                    {a.name || (a.uid === user.uid ? user.name : 'Admin')} {a.uid === user.uid && <span className="text-muted">(you)</span>}
                  </span>
                  <span className="block text-xs text-muted">
                    {a.role === 'owner' ? 'Owner' : 'Admin'}
                    {a.addedAt && ` · added ${when(a.addedAt)}`}
                  </span>
                </span>
                {a.role !== 'owner' && a.uid !== user.uid && (
                  <ConfirmButton confirmText="Yes, remove" onConfirm={async () => { await removeAdmin(a.uid); reload() }}>
                    Remove
                  </ConfirmButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Invite an admin">
        <p className="text-sm text-muted">
          Creates a one-time link that works for {INVITE_MINUTES} minutes. Send it on WhatsApp; the person opens it, logs in with their own
          account and taps Accept. They can then install the Inviname Admin app from the admin panel.
        </p>
        <form onSubmit={invite} className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Their name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Lakshmi (sister)" className="min-w-0 flex-1" />
          <button type="submit" disabled={busy} className="btn-rose min-h-11 px-5 disabled:opacity-60">
            {busy ? 'Creating…' : 'Create invite link'}
          </button>
        </form>

        {fresh && (
          <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/[0.06] p-4 text-sm">
            {freshLeft > 0 ? (
              <>
                <p className="text-cream">
                  Link for <b>{fresh.name}</b> · works for <span className="font-mono text-gold">{mmss(freshLeft)}</span> more
                </p>
                <p className="mt-2 break-all rounded-xl bg-plum px-3 py-2 font-mono text-xs text-blush select-all">{inviteLink(fresh.code)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => copy(inviteLink(fresh.code))} className="btn-ghost min-h-10 px-4">
                    {copied ? 'Copied ✓' : 'Copy link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hi ${fresh.name}, here is your Inviname Arts admin invite. Open it within ${INVITE_MINUTES} minutes and log in: ${inviteLink(fresh.code)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost min-h-10 px-4"
                  >
                    Send on WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <p className="text-rose-light">This link has expired. Create a new one when the person is ready.</p>
            )}
          </div>
        )}

        {open.length > 0 && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Open links</p>
            <ul className="mt-2 divide-y divide-plum-line">
              {open.map((i) => (
                <li key={i.code} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-cream">
                    {i.name} <span className="text-muted">· {mmss(inviteLeft(i))} left</span>
                  </span>
                  <ConfirmButton confirmText="Yes, cancel" onConfirm={async () => { await cancelInvite(i.code); if (fresh?.code === i.code) setFresh(null); reload() }}>
                    Cancel link
                  </ConfirmButton>
                </li>
              ))}
            </ul>
          </div>
        )}
        {err && <p className="mt-3 text-sm text-rose-light">{err}</p>}
      </Card>
    </div>
  )
}
