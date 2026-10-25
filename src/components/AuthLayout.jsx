// src/components/AuthLayout.jsx — the shared look of the login / sign-up pages:
// a brand panel with a product photo (laptops) next to the form card.
import { IconFlower } from './Icons.jsx'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="container-page grid min-h-[calc(100svh-72px)] items-center gap-10 py-10 lg:grid-cols-2 lg:py-14">
      <div className="relative hidden h-full min-h-[34rem] overflow-hidden rounded-[2rem] border border-gold/20 bg-[radial-gradient(70%_60%_at_50%_40%,rgb(183_110_121_/_0.45),rgb(42_25_34))] lg:block">
        <img src="/images/rose.webp" alt="" className="absolute inset-0 m-auto h-[70%] w-[70%] object-contain drop-shadow-[0_30px_60px_rgb(0_0_0_/_0.6)]" />
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p className="label">Resin · Art · Memories</p>
          <p className="mt-3 max-w-sm font-serif text-3xl leading-tight text-blush">Real flowers, preserved forever by hand.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center lg:text-left">
          <IconFlower className="mx-auto h-9 w-9 text-gold lg:mx-0" />
          <h1 className="mt-4 text-4xl sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

export function GoogleButton({ onClick, busy, label = 'Continue with Google' }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-medium text-[#1f1f1f] transition hover:bg-cream disabled:opacity-60">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {busy ? 'Please wait…' : label}
    </button>
  )
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
      <span className="h-px flex-1 bg-plum-line" /> or <span className="h-px flex-1 bg-plum-line" />
    </div>
  )
}
