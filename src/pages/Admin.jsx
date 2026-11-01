// src/pages/Admin.jsx — the door to the admin panel. Only the owner (user ID in the Firestore "admins"
// collection) gets in; everyone else just sees "Page not found", so nobody even learns the admin page exists.
// The admin panel itself is a separate download so customers never load it.
// To add another admin later: Firebase Console → Firestore → admins → add a document whose ID is their user ID.
import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../data/auth.js'
import usePageTitle from '../lib/usePageTitle.js'
import NotFound from './NotFound.jsx'

const AdminApp = lazy(() => import('../admin/AdminApp.jsx'))
const installedApp = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true

const Loading = () => (
  <section className="container-page max-w-3xl py-12 sm:py-16">
    <div className="skeleton h-64 rounded-3xl" />
  </section>
)

export default function Admin() {
  const { user, ready, isAdmin, adminChecked, disabled } = useAuth()
  usePageTitle(isAdmin ? 'Admin' : 'Page not found')
  if (!disabled && (!ready || (user && !adminChecked))) return <Loading />
  // In the installed "Inviname Admin" app, a logged-out phone goes to the login page (log in once; it stays logged in).
  if (!user && installedApp()) return <Navigate to="/login?next=/admin/" replace />
  if (!user || !isAdmin) return <NotFound />
  return (
    <Suspense fallback={<Loading />}>
      <AdminApp />
    </Suspense>
  )
}
