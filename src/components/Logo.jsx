// src/components/Logo.jsx — "Inviname Arts" wordmark with the gold flower and tagline
import { Link } from 'react-router'
import { IconFlower } from './Icons.jsx'
import { SITE } from '../config/site.js'

export default function Logo({ small = false }) {
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-2 min-[340px]:gap-2.5" aria-label={`${SITE.name}, home`}>
      <IconFlower className={`shrink-0 text-gold transition group-hover:drop-shadow-[0_0_8px_rgb(212_168_87_/_0.7)] ${small ? 'h-7 w-7' : 'h-7 w-7 min-[340px]:h-8 min-[340px]:w-8 sm:h-9 sm:w-9'}`} />
      <span className="leading-none">
        <span className={`block whitespace-nowrap font-serif italic text-blush ${small ? 'text-xl' : 'text-[1.1rem] min-[340px]:text-[1.35rem] sm:text-[1.6rem]'}`}>{SITE.name}</span>
        <span className="mt-1 block whitespace-nowrap text-[0.5rem] uppercase tracking-[0.16em] text-gold/90 min-[340px]:text-[0.55rem] min-[340px]:tracking-[0.22em] sm:text-[0.6rem] sm:tracking-[0.32em]">{SITE.tagline}</span>
      </span>
    </Link>
  )
}
