// src/pages/About.jsx — text from Admin → Website → Pages
import { Link } from 'react-router'
import { useContent } from '../data/content.js'
import usePageTitle from '../lib/usePageTitle.js'
import ContentPage from '../components/ContentPage.jsx'

export default function About() {
  const p = useContent().pages.about
  usePageTitle('About', p.intro)
  return (
    <ContentPage
      label="Our story"
      title={p.title}
      intro={p.intro}
      body={p.body}
      aside={
        <div className="overflow-hidden rounded-[2rem] border border-gold/20 bg-[radial-gradient(70%_60%_at_50%_40%,rgb(183_110_121_/_0.4),rgb(42_25_34))] p-6">
          <img src="/images/rose-sm.webp" alt="Pink rose with baby’s breath and gold flakes" className="mx-auto aspect-square w-full max-w-xs object-contain" loading="lazy" />
          <Link to="/shop" className="btn-rose mt-4 w-full">Explore the collection</Link>
        </div>
      }
    />
  )
}
