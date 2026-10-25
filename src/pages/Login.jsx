// src/pages/Login.jsx — log in with Google or email + password, and "forgot password".
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth, signInWithGoogle, signInWithEmail, resetPassword, authMessage, safeNext } from '../data/auth.js'
import usePageTitle from '../lib/usePageTitle.js'
import AuthLayout, { GoogleButton, Divider } from '../components/AuthLayout.jsx'

export default function Login() {
  usePageTitle('Log in')
  const [sp] = useSearchParams()
  const next = safeNext(sp.get('next'))
  const navigate = useNavigate()
  const { user, disabled } = useAuth()
  const [mode, setMode] = useState('login') // login | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // already logged in (or just logged in) → go on
  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, next, navigate])

  async function run(kind, fn) {
    setError('')
    setBusy(kind)
    try {
      await fn()
    } catch (e) {
      setError(authMessage(e))
    } finally {
      setBusy('')
    }
  }

  if (mode === 'forgot')
    return (
      <AuthLayout title="Reset password" subtitle="We will email you a link to set a new password.">
        {sent ? (
          <div className="card p-6 text-center">
            <p className="text-cream">If an account exists for <span className="text-gold">{email}</span>, a reset link is on its way.</p>
            <p className="mt-2 text-sm text-muted">Check your inbox and spam folder.</p>
            <button type="button" onClick={() => { setMode('login'); setSent(false) }} className="btn-rose mt-6 w-full">Back to log in</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); run('reset', async () => { await resetPassword(email); setSent(true) }) }} className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            {error && <ErrorBox>{error}</ErrorBox>}
            <button type="submit" disabled={!!busy} className="btn-rose w-full">{busy ? 'Sending…' : 'Send reset link'}</button>
            <button type="button" onClick={() => { setMode('login'); setError('') }} className="w-full text-sm text-muted hover:text-gold">Back to log in</button>
          </form>
        )}
      </AuthLayout>
    )

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to check out and see your orders.">
      {disabled && <ErrorBox>Login is not set up yet (Firebase config missing in src/firebase/config.js).</ErrorBox>}
      <GoogleButton busy={busy === 'google'} onClick={() => run('google', signInWithGoogle)} />
      <Divider />
      <form onSubmit={(e) => { e.preventDefault(); run('email', () => signInWithEmail(email, password)) }} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type={show ? 'text' : 'password'} value={password} onChange={setPassword} autoComplete="current-password"
          extra={<button type="button" onClick={() => setShow((v) => !v)} className="text-xs text-gold">{show ? 'Hide' : 'Show'}</button>} />
        <div className="text-right">
          <button type="button" onClick={() => { setMode('forgot'); setError('') }} className="text-sm text-gold hover:underline">Forgot password?</button>
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        <button type="submit" disabled={!!busy} className="btn-rose shimmer w-full">{busy === 'email' ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        New here? <Link to={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-gold hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  )
}

export function Field({ label, value, onChange, extra, ...rest }) {
  const id = 'f-' + label.toLowerCase().replace(/\W+/g, '-')
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-muted">{label}</label>
        {extra}
      </div>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} required className="field w-full rounded-2xl" {...rest} />
    </div>
  )
}

export function ErrorBox({ children }) {
  return (
    <p role="alert" className="rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-blush">
      {children}
    </p>
  )
}
