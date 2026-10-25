// src/pages/Policy.jsx — Shipping, Returns & Replacement, Privacy and Terms (text from Admin → Website → Policies)
import { useContent } from '../data/content.js'
import usePageTitle from '../lib/usePageTitle.js'
import ContentPage from '../components/ContentPage.jsx'

export default function Policy({ kind }) {
  const p = useContent().policies[kind]
  usePageTitle(p.title)
  return <ContentPage label="Policies" title={p.title} body={p.body} />
}
