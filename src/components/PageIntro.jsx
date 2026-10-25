// src/components/PageIntro.jsx — heading block used by the placeholder pages (and later by real pages)
export default function PageIntro({ label, title, children, phase }) {
  return (
    <section className="container-page pb-10 pt-14 sm:pt-20">
      {label && <p className="label mb-4">{label}</p>}
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-muted">{children}</div>}
      {phase && (
        <p className="card mt-10 inline-flex items-center gap-3 px-5 py-3 text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" /> This page is built in Phase {phase}.
        </p>
      )}
    </section>
  )
}
