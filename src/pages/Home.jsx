// src/pages/Home.jsx — Phase 0 version: hero text + categories. The 3D scroll story replaces the hero in Phase 1.
import { Link } from 'react-router'
import { CATEGORIES } from '../config/site.js'
import { IconArrow } from '../components/Icons.jsx'

export default function Home() {
  return (
    <>
      <section className="container-page grid min-h-[78svh] items-center py-16">
        <div className="max-w-xl">
          <p className="label mb-5">Real flowers · Timeless art</p>
          <h1 className="text-[2.6rem] min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
            Preserve Your Moments <em className="font-medium text-rose">Forever</em>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Handcrafted resin art that captures real flowers, real emotions and your most treasured moments.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-rose">
              Explore Collection <IconArrow className="h-4 w-4" />
            </Link>
            <Link to="/custom-orders" className="btn-ghost">Custom Orders</Link>
          </div>
        </div>
      </section>

      <section className="container-page">
        <h2 className="text-4xl sm:text-5xl">Art That Lives On</h2>
        <ul className="mt-8 grid grid-cols-1 gap-3 min-[340px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/shop?category=${c.slug}`} className="card group flex h-full min-w-0 flex-col justify-between gap-6 p-4 transition hover:border-gold/50 hover:shadow-glow sm:p-5">
                <span className="font-serif text-xl leading-tight text-blush [overflow-wrap:anywhere] sm:text-2xl">{c.name}</span>
                <span className="flex items-center justify-between text-sm text-muted">
                  {c.line}
                  <IconArrow className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
