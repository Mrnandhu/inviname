// src/components/story/StoryPanels.jsx — the words on top of the 3D story, one panel per scene,
// plus the gold progress line with 10 clickable dots. All panels stay in the page (good for Google);
// only the current one is visible.
import { Fragment } from 'react'
import { Link } from 'react-router'
import { IconArrow } from '../Icons.jsx'

// Heading that rises in word by word
function Words({ text, start = 0, className = '' }) {
  return text.split(' ').map((w, i) => (
    <Fragment key={i}>
      <span className="word-mask">
        <span className={`word ${className}`} style={{ transitionDelay: `${start + i * 0.08}s` }}>{w}</span>
      </span>{' '}
    </Fragment>
  ))
}

function Panel({ sc, i, on }) {
  const H = i === 0 ? 'h1' : 'h2'
  const kind = sc.caption ? 'panel-caption' : sc.motion === 'finale' ? 'panel-finale' : 'panel-side'
  const n = sc.title ? sc.title.split(' ').length : 0
  return (
    <div className={`story-panel ${kind} ${on ? 'is-on' : ''}`} aria-hidden={!on} inert={!on}>
      <div className="panel-inner">
        {sc.caption ? (
          <p className="font-serif text-3xl italic text-blush sm:text-5xl">
            <Words text={sc.caption} start={0.1} />
          </p>
        ) : (
          <>
            <p className="label reveal-label mb-3 sm:mb-5">{sc.label}</p>
            <H className="story-title">
              <Words text={sc.title} start={0.12} />
              {sc.accent && <Words text={sc.accent} start={0.12 + n * 0.08} className="font-medium italic text-rose-light" />}
            </H>
            {sc.text && (
              <p className="reveal-up mt-3 max-w-md text-[0.95rem] text-muted sm:mt-5 sm:text-lg" style={{ transitionDelay: '0.45s' }}>
                {sc.text}
              </p>
            )}
            <div className="reveal-up mt-5 flex flex-wrap items-center gap-3 sm:mt-8" style={{ transitionDelay: '0.55s' }}>
              <Link to={sc.to} className="btn-rose shimmer pointer-events-auto">
                {sc.cta} <IconArrow className="h-4 w-4" />
              </Link>
              {sc.cta2 && (
                <Link to={sc.cta2.to} className="btn-ghost pointer-events-auto hidden min-[400px]:inline-flex">
                  {sc.cta2.label}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function StoryPanels({ scenes, idx, entered, onDot }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10">
        {scenes.map((sc, i) => (
          <Panel key={sc.id} sc={sc} i={i} on={entered && i === idx} />
        ))}
      </div>

      {/* progress: a thin gold line with one dot per scene */}
      <nav className="story-dots absolute right-2 top-1/2 z-20 -translate-y-1/2 sm:right-5" aria-label="Story scenes">
        <ol className="relative flex flex-col items-center gap-2.5 py-1 sm:gap-3.5">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gold/25" aria-hidden="true" />
          <span
            className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gold transition-[height] duration-500"
            style={{ height: `${(idx / (scenes.length - 1)) * 100}%` }}
            aria-hidden="true"
          />
          {scenes.map((sc, i) => (
            <li key={sc.id} className="relative">
              <button
                type="button"
                onClick={() => onDot(i)}
                aria-label={`Scene ${i + 1}: ${sc.title || sc.caption}`}
                aria-current={i === idx ? 'step' : undefined}
                className="group grid h-6 w-6 place-items-center"
              >
                <span className={`block rounded-full transition-all duration-300 ${i === idx ? 'h-2.5 w-2.5 bg-gold shadow-[0_0_10px_rgb(212_168_87_/_0.9)]' : 'h-1.5 w-1.5 bg-blush/50 group-hover:bg-gold'}`} />
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
