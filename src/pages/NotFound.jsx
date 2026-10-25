// src/pages/NotFound.jsx — shown for any address that doesn't exist
import { Link } from 'react-router'
import PageIntro from '../components/PageIntro.jsx'

export default function NotFound() {
  return (
    <PageIntro label="404" title="This page has floated away">
      <p>The page you are looking for doesn't exist or has moved.</p>
      <Link to="/shop" className="btn-rose mt-8">Go to the shop</Link>
    </PageIntro>
  )
}
