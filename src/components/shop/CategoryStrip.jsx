// src/components/shop/CategoryStrip.jsx — round category photos in a row (scrolls sideways on phones)
import { Link } from 'react-router'
import { img } from '../../data/catalog.js'
import { IconFlower } from '../Icons.jsx'

export default function CategoryStrip({ categories, active, to }) {
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-3 sm:gap-5 lg:min-w-0 lg:justify-between">
        {[{ slug: '', name: 'All', image: '' }, ...categories].map((c) => {
          const on = (active || '') === c.slug
          return (
            <li key={c.slug || 'all'}>
              <Link to={to(c.slug)} aria-current={on ? 'page' : undefined} className="group flex w-[4.75rem] flex-col items-center gap-2 text-center sm:w-24">
                <span className={`grid h-16 w-16 place-items-center overflow-hidden rounded-full border bg-[radial-gradient(circle_at_50%_40%,rgb(183_110_121_/_0.45),rgb(42_25_34))] transition duration-300 sm:h-20 sm:w-20 ${on ? 'border-gold shadow-[0_0_0_3px_rgb(212_168_87_/_0.25)]' : 'border-plum-line group-hover:border-gold/60'}`}>
                  {c.image ? (
                    <img src={img(c.image, true)} alt="" width="80" height="80" loading="lazy" className="h-[86%] w-[86%] object-contain transition duration-500 group-hover:scale-110" />
                  ) : (
                    <IconFlower className="h-7 w-7 text-gold" />
                  )}
                </span>
                <span className={`text-xs leading-tight sm:text-[0.8rem] ${on ? 'text-gold' : 'text-cream'}`}>{c.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
