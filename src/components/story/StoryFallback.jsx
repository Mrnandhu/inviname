// src/components/story/StoryFallback.jsx — the story without 3D, for phones/computers with
// "reduce motion" switched on or without WebGL: each product picture with its text, fading in.
import { Link } from 'react-router'
import { storyImage } from '../../config/story.js'
import { useContent } from '../../data/content.js'
import { IconArrow } from '../Icons.jsx'
import Reveal from '../home/Reveal.jsx'

export default function StoryFallback() {
  const items = useContent().story.filter((s) => s.img && s.motion !== 'finale' && !s.hidden)
  return (
    <section className="hero-still relative -mt-[72px] pt-[72px]" aria-label="Inviname Arts collection">
      {items.map((sc, i) => {
        const H = i === 0 ? 'h1' : 'h2'
        const flip = i % 2 === 1
        return (
          <div key={sc.id} className="container-page grid items-center gap-8 py-12 md:grid-cols-2 md:gap-14 md:py-16">
            <Reveal from="zoom" className={flip ? 'md:order-1' : 'md:order-2'}>
              <img src={storyImage(sc.img, true)} srcSet={`${storyImage(sc.img, true)} 512w, ${storyImage(sc.img)} 900w`} sizes="(min-width: 768px) 45vw, 90vw" alt={sc.title + (sc.accent ? ' ' + sc.accent : '')} width="512" height="512" loading={i === 0 ? 'eager' : 'lazy'} className="mx-auto aspect-square w-full max-w-md object-contain drop-shadow-[0_20px_50px_rgb(212_168_87_/_0.25)]" />
            </Reveal>
            <Reveal className={flip ? 'md:order-2' : 'md:order-1'}>
              <p className="label">{sc.label}</p>
              <H className="mt-3 text-[2.4rem] leading-[1.05] min-[380px]:text-5xl lg:text-6xl">
                {sc.title} {sc.accent && <em className="font-medium text-rose-light">{sc.accent}</em>}
              </H>
              {sc.text && <p className="mt-4 max-w-md text-muted sm:text-lg">{sc.text}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={sc.to} className="btn-rose">
                  {sc.cta} <IconArrow className="h-4 w-4" />
                </Link>
                {sc.cta2 && <Link to={sc.cta2.to} className="btn-ghost">{sc.cta2.label}</Link>}
              </div>
            </Reveal>
          </div>
        )
      })}
    </section>
  )
}
