// src/pages/Signup.jsx — create an account with Google or with name, email and password.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth, signInWithGoogle, signUpWithEmail, authMessage, safeNext } from '../data/auth.js'
import usePageTitle from '../lib/usePageTitle.js'
import AuthLayout, { GoogleButton, Divider } from '../components/AuthLayout.jsx'
import { Field, ErrorBox } from './Login.jsx'

export default function Signup() {
  usePageTitle('Create account')
  const [sp] = useSearchParams()
  const next = safeNext(sp.get('next'))
  const navigate = useNavigate()
  const { user, disabled } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

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

  return (
    <AuthLayout title="Create your account" subtitle="Save your cart, check out faster and follow your orders.">
      {disabled && <ErrorBox>Sign-up is not set up yet (Firebase config missing in src/firebase/config.js).</ErrorBox>}
      <GoogleButton busy={busy === 'google'} onClick={() => run('google', signInWithGoogle)} label="Sign up with Google" />
      <Divider />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return setError('Please use a password of at least 8 characters, with at least one letter and one number.')
          run('email', () => signUpWithEmail({ name, email, password }))
        }}
        className="space-y-4"
      >
        <Field label="Your name" value={name} onChange={setName} autoComplete="name" maxLength={60} />
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type={show ? 'text' : 'password'} value={password} onChange={setPassword} autoComplete="new-password"
          extra={<button type="button" onClick={() => setShow((v) => !v)} className="text-xs text-gold">{show ? 'Hide' : 'Show'}</button>} />
        <p className="text-xs text-muted">At least 6 characters.</p>
        {error && <ErrorBox>{error}</ErrorBox>}
        <button type="submit" disabled={!!busy} className="btn-rose shimmer w-full">{busy === 'email' ? 'Creating account…' : 'Create account'}</button>
        <p className="text-center text-xs text-muted">
          By continuing you agree to our <Link to="/terms" className="text-gold hover:underline">Terms</Link> and <Link to="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link>.
        </p>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account? <Link to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-gold hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  )
}
