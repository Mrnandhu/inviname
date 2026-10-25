// src/pages/Home.jsx — the 3D scroll story, then the normal home page:
// categories, why people choose us, custom orders and wholesale.
// Texts come from Admin → Website; categories and best sellers from the catalog; reviews from Admin → Reviews.
import { Link } from 'react-router'
import { waLink } from '../config/site.js'
import { storyImage } from '../config/story.js'
import { useCatalog, img } from '../data/catalog.js'
import { useContent } from '../data/content.js'
import { useReviews } from '../data/reviews.js'
import ProductCard, { ProductCardSkeleton } from '../components/shop/ProductCard.jsx'
import { IconArrow, IconHeart, IconLeaf, IconGift, IconDiamond, IconWhatsApp } from '../components/Icons.jsx'
import Story from '../components/story/Story.jsx'
import Reveal from '../components/home/Reveal.jsx'
import ArtImage from '../components/home/ArtImage.jsx'

const TRUST_ICONS = [IconHeart, IconLeaf, IconGift, IconDiamond]

export default function Home() {
  const cat = useCatalog()
  const best = cat ? cat.products.filter((p) => p.featured).slice(0, 8) : []
  const h = useContent().home
  const reviews = useReviews()
  return (
    <>
      <Story />

      {/* CATEGORIES */}
      <section className="section-glow-center relative pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div className="container-page">
          <Reveal className="text-center">
            <p className="label">{h.categories.label}</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">{h.categories.title}</h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 sm:gap-4 md:grid-cols-4">
            {(cat?.categories || []).map((c, i) => (
              <Reveal as="li" key={c.slug} from="zoom" delay={(i % 4) * 0.07}>
                <Link to={`/shop?category=${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-plum-line bg-plum-card transition duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-glow">
                  <ArtImage
                    src={img(c.image, true)}
                    alt={c.name}
                    className="aspect-square transition duration-700 group-hover:scale-[1.05]"
                  />
                  <span className="mt-auto flex min-h-[4.25rem] items-center justify-between gap-2 bg-cream/95 px-3 py-3 text-plum sm:px-4">
                    <span className="min-w-0">
                      <span className="line-clamp-2 block font-serif text-base font-semibold leading-tight min-[400px]:text-lg sm:text-xl">{c.name}</span>
                      <span className="block truncate text-xs text-plum/60">{c.line}</span>
                    </span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-plum/20 transition group-hover:bg-rose group-hover:text-white">
                      <IconArrow className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>

          {/* WHY US */}
          <ul className="mt-14 grid grid-cols-2 gap-y-8 border-t border-plum-line pt-10 md:grid-cols-4 md:divide-x md:divide-plum-line">
            {h.trust.map(({ title: t, text: d }, i) => { const Icon = TRUST_ICONS[i % 4]; return (
              <Reveal as="li" key={t} delay={i * 0.08} className="flex items-center justify-center gap-3 px-2 md:px-4">
                <Icon className="h-8 w-8 shrink-0 text-rose-light" />
                <span>
                  <span className="block text-sm font-medium text-cream sm:text-base">{t}</span>
                  <span className="block text-xs text-muted sm:text-sm">{d}</span>
                </span>
              </Reveal>
            )})}
          </ul>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-page pb-20 sm:pb-24">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="label">{h.best.label}</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">{h.best.title}</h2>
          </div>
          <Link to="/shop" className="hidden shrink-0 items-center gap-1 text-sm text-gold hover:underline sm:inline-flex">
            View all <IconArrow className="h-4 w-4" />
          </Link>
        </Reveal>
        <ul className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {(cat ? best : Array.from({ length: 4 })).map((p, i) => (
            <li key={p?.id || i} className="w-[46vw] max-w-[15rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              {p ? <ProductCard p={p} /> : <ProductCardSkeleton />}
            </li>
          ))}
        </ul>
        <Link to="/shop" className="btn-ghost mt-8 w-full sm:hidden">View all pieces</Link>
      </section>

      {/* REVIEWS (only real ones added in Admin → Reviews) */}
      {reviews.length > 0 && (
        <section className="container-page pb-20 sm:pb-24">
          <Reveal className="text-center">
            <p className="label">{h.reviews.label}</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">{h.reviews.title}</h2>
          </Reveal>
          <ul className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {reviews.slice(0, 6).map((r, i) => (
              <Reveal as="li" key={r.id} delay={(i % 3) * 0.08} className="w-[80vw] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none">
                <figure className="flex h-full flex-col rounded-3xl border border-plum-line bg-plum-card/70 p-6">
                  <p className="text-gold" aria-label={`${r.rating || 5} out of 5 stars`}>{'★'.repeat(r.rating || 5)}</p>
                  <blockquote className="mt-3 flex-1 font-serif text-xl leading-snug text-blush">“{r.text}”</blockquote>
                  <figcaption className="mt-4 text-sm text-muted">{r.name}{r.place && ` · ${r.place}`}</figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* CUSTOM ORDERS + WHOLESALE */}
      <section className="container-page grid gap-4 pb-20 sm:pb-28 md:grid-cols-2">
        <Reveal from="left" className="banner relative overflow-hidden rounded-[2rem] border border-gold/20 p-7 sm:p-10">
          <img src={storyImage('photo-frame', true)} alt="" aria-hidden="true" loading="lazy" className="pointer-events-none absolute -bottom-8 -right-8 w-44 rotate-6 opacity-90 sm:w-56" />
          <div className="relative max-w-[17rem] sm:max-w-xs">
            <p className="label">{h.custom.label}</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">{h.custom.title}</h2>
            <p className="mt-3 text-sm text-muted sm:text-base">{h.custom.text}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/custom-orders" className="btn-rose shimmer">
                {h.custom.cta} <IconArrow className="h-4 w-4" />
              </Link>
              <a href={waLink('Hi Inviname Arts, I would like a custom resin piece.')} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <IconWhatsApp className="h-4 w-4" /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal from="right" className="banner relative overflow-hidden rounded-[2rem] border border-gold/20 p-7 sm:p-10">
          <img src={storyImage('keychain', true)} alt="" aria-hidden="true" loading="lazy" className="pointer-events-none absolute -bottom-6 -right-6 w-40 -rotate-6 opacity-90 sm:w-52" />
          <div className="relative max-w-[17rem] sm:max-w-xs">
            <p className="label">{h.wholesale.label}</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">{h.wholesale.title}</h2>
            <p className="mt-3 text-sm text-muted sm:text-base">{h.wholesale.text}</p>
            <Link to="/wholesale" className="btn-rose shimmer mt-6">
              {h.wholesale.cta} <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
