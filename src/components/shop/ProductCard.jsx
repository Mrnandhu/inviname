// src/components/shop/ProductCard.jsx — one product in the shop grid
import { Link } from 'react-router'
import { formatINR, img } from '../../data/catalog.js'
import ArtImage from '../home/ArtImage.jsx'

export default function ProductCard({ p, eager = false }) {
  const low = p.type === 'ready-made' && p.stock > 0 && p.stock <= 5
  return (
    <Link
      to={`/product/${p.slug}`}
      className="product-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-plum-line bg-plum-card transition duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-glow"
    >
      <div className="relative">
        <ArtImage
          src={img(p.image, true)}
          alt={p.name}
          eager={eager}
          className={`aspect-square transition duration-700 group-hover:scale-[1.06] ${p.available ? '' : 'opacity-50 grayscale-[40%]'}`}
        />
        {/* badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {p.featured && <span className="badge bg-gold text-plum">Bestseller</span>}
          {p.type === 'custom' && <span className="badge border border-blush/30 bg-plum/70 text-blush backdrop-blur">Made to order</span>}
        </div>
        {!p.available && <span className="badge absolute bottom-2.5 left-2.5 bg-plum/85 text-cream sm:bottom-3 sm:left-3">Sold out</span>}
        {low && <span className="badge absolute bottom-2.5 left-2.5 bg-rose/90 text-white sm:bottom-3 sm:left-3">Only {p.stock} left</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-gold/80">{p.categoryName}</span>
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-blush sm:text-xl">{p.name}</h3>
        <span className="mt-auto pt-2 text-base font-medium text-cream sm:text-lg">
          {p.minPrice !== p.maxPrice && <span className="mr-1 text-xs font-normal text-muted">From</span>}
          {formatINR(p.minPrice)}
        </span>
      </div>
    </Link>
  )
}

/** Grey placeholder card while products load */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-plum-line bg-plum-card" aria-hidden="true">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/4 rounded" />
      </div>
    </div>
  )
}
