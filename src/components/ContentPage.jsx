// src/components/ContentPage.jsx — the layout shared by About, Custom Orders, Wholesale and policy pages
import RichText from './RichText.jsx'

export default function ContentPage({ label, title, intro, body, aside, children }) {
  return (
    <section className="container-page pb-16 pt-10 sm:pt-16">
      <div className={aside ? 'grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14' : 'max-w-3xl'}>
        <div className="min-w-0">
          {label && <p className="label">{label}</p>}
          <h1 className="mt-3 text-4xl sm:text-6xl">{title}</h1>
          {intro && <p className="mt-4 text-lg text-cream">{intro}</p>}
          {body && <RichText text={body} className="mt-6" />}
          {children}
        </div>
        {aside && <aside className="min-w-0 lg:pt-16">{aside}</aside>}
      </div>
    </section>
  )
}
