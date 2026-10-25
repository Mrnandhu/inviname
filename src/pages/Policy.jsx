// src/pages/Policy.jsx — placeholder for the four policy pages (written in Phase 8)
import PageIntro from '../components/PageIntro.jsx'

const TITLES = {
  shipping: 'Shipping Policy',
  returns: 'Returns & Replacement',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
}

export default function Policy({ kind }) {
  return <PageIntro label="Policies" title={TITLES[kind]} phase={8} />
}
