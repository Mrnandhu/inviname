// src/components/RequireAuth.jsx — pages wrapped in this need the customer to be logged in
// (checkout, my orders). Not logged in → sent to /login, then brought back here afterwards.
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../data/auth.js'

export default function RequireAuth({ children }) {
  const { user, ready, disabled } = useAuth()
  const loc = useLocation()
  if (disabled) return children // login not set up yet (testing): let the page show
  if (!ready)
    return (
      <div className="grid min-h-[50svh] place-items-center" aria-busy="true">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
      </div>
    )
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  return children
}
