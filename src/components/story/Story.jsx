// src/components/story/Story.jsx — the home page 3D scroll story.
// The stage (canvas + text) stays pinned on screen while the visitor scrolls through the section;
// GSAP ScrollTrigger turns the scroll into the story position (0–9) and gently snaps to each scene.
// The section is exactly 10 scenes long, so the normal page continues right after the finale.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { storyImage } from '../../config/story.js'
import { useContent, loadContent, contentLoaded } from '../../data/content.js'
import StoryPanels from './StoryPanels.jsx'
import StoryFallback from './StoryFallback.jsx'

gsap.registerPlugin(ScrollTrigger)

const INTRO_KEY = 'inv-intro-seen'

function canRun3D() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
const isLite = () =>
  window.matchMedia('(max-width: 767px), (pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4

export default function Story() {
  const [ok] = useState(canRun3D)
  const [failed, setFailed] = useState(false)
  return ok && !failed ? <Story3D onFail={() => setFailed(true)} /> : <StoryFallback />
}

function Story3D({ onFail }) {
  // scenes come from the website content (Admin → Website → Home 3D story); hidden scenes are skipped
  const content = useContent()
  const scenes = useMemo(() => content.story.filter((s) => !s.hidden), [content])
  const N = scenes.length
  const sceneKey = scenes.map((s) => `${s.id}:${s.img || ''}`).join('|')
  const [contentReady, setContentReady] = useState(contentLoaded)
  useEffect(() => {
    if (contentReady) return
    const t = setTimeout(() => setContentReady(true), 1500) // never wait long for saved texts
    loadContent().then(() => setContentReady(true))
    return () => clearTimeout(t)
  }, [contentReady])
  const root = useRef(null)
  const canvasRef = useRef(null)
  const labelRef = useRef(null)
  const engine = useRef(null)
  const trigger = useRef(null)
  const pos = useRef(0)
  const navigate = useNavigate()
  const nav = useRef(navigate)
  nav.current = navigate
  const fail = useRef(onFail)
  fail.current = onFail

  const [idx, setIdx] = useState(0)
  const [entered, setEntered] = useState(false)
  const [ready, setReady] = useState(false) // 3D is drawing
  const [veil, setVeil] = useState(true) // black intro veil over the canvas
  const [firstVisit] = useState(() => {
    try {
      return !localStorage.getItem(INTRO_KEY)
    } catch {
      return false
    }
  })
  const [needTilt, setNeedTilt] = useState(false)
  const [hint, setHint] = useState(true)
  const tiltFn = useRef(null)

  // text appears straight away (word-by-word reveal starts on the next frame)
  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(r)
  }, [])

  // ---- scroll → story position ----
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(self) {
        const p = self.progress * (N - 1)
        pos.current = p
        engine.current?.setProgress(p)
        const i = Math.round(p)
        setIdx((old) => (old === i ? old : i))
      },
      snap: { snapTo: 1 / (N - 1), duration: { min: 0.3, max: 0.9 }, delay: 0.12, ease: 'power2.inOut' },
    })
    trigger.current = st
    return () => st.kill()
  }, [N])

  // ---- the intro lasts at most 2 seconds, whatever happens ----
  const minIntro = useRef(null)
  minIntro.current ||= new Promise((r) => setTimeout(r, firstVisit ? 1100 : 0))
  useEffect(() => {
    const t = setTimeout(() => setVeil(false), firstVisit ? 2000 : 1200)
    try {
      localStorage.setItem(INTRO_KEY, '1')
    } catch {}
    return () => clearTimeout(t)
  }, [firstVisit])

  // ---- load the 3D engine (separate download) ----
  useEffect(() => {
    if (!contentReady) return
    let dead = false
    let api = null
    const lite = isLite()

    import('../../three/story/engine.js')
      .then(({ createStory }) => {
        if (dead || !canvasRef.current) return
        api = createStory(canvasRef.current, {
          scenes,
          lite,
          imageUrl: (name) => storyImage(name, lite),
          onSelect: (link) => link && nav.current(link),
          onHover: (on, x, y) => {
            const el = labelRef.current
            if (!el) return
            el.style.opacity = on ? '1' : '0'
            if (on) el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
          },
          onReady: () =>
            minIntro.current.then(() => {
              if (dead) return
              setReady(true)
              setVeil(false)
            }),
        })
        engine.current = api
        api.jump(pos.current)
        api.start()
        // preload the remaining pictures quietly so later scenes are instant
        scenes.forEach((s) => s.img && (new Image().src = storyImage(s.img, lite)))
      })
      .catch(() => !dead && fail.current())

    return () => {
      dead = true
      api?.dispose()
      engine.current = null
    }
  }, [contentReady, sceneKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- pause the 3D when the story is off screen (saves battery) ----
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? engine.current?.start() : engine.current?.stop()))
    io.observe(root.current)
    return () => io.disconnect()
  }, [ready])

  // ---- phone tilt (iPhone asks permission first) ----
  useEffect(() => {
    if (!ready || !window.matchMedia('(pointer: coarse)').matches || !('DeviceOrientationEvent' in window)) return
    const onTilt = (e) => {
      if (e.gamma == null) return
      engine.current?.setTilt(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)))
    }
    tiltFn.current = onTilt
    if (typeof DeviceOrientationEvent.requestPermission === 'function') setNeedTilt(true)
    else window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [ready])
  async function allowTilt() {
    try {
      if ((await DeviceOrientationEvent.requestPermission()) === 'granted') window.addEventListener('deviceorientation', tiltFn.current, { passive: true })
    } catch {}
    setNeedTilt(false)
  }

  // ---- "Drag to rotate" hint: hide after a while or after the first touch ----
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setHint(false), 7000)
    const off = () => setHint(false)
    window.addEventListener('pointerdown', off, { once: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', off)
    }
  }, [ready])

  // ---- progress dots: jump to a scene ----
  const goTo = useCallback((i) => {
    const st = trigger.current
    if (!st) return
    window.scrollTo({ top: st.start + ((st.end - st.start) * i) / (N - 1), behavior: 'smooth' })
  }, [N])

  return (
    <section ref={root} className="story relative -mt-[72px]" style={{ '--scenes': N - 1 }} aria-label="Inviname Arts collection story">
      <div className="story-stage sticky top-0 h-svh overflow-hidden">
        {/* warm still background (shows instantly, and stays if the 3D is slow) */}
        <div className="hero-still absolute inset-0" />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full touch-pan-y transition-opacity duration-[1200ms] ${ready ? 'opacity-100' : 'opacity-0'}`}
          role="img"
          aria-label="3D resin art pieces: a glass cube with a rose, keychains, earrings, a photo frame, a wall clock, bangles, a locket and a jewellery set."
        />

        {/* intro: black veil; on the first visit the gold flower draws itself while the pictures load */}
        <div className={`pointer-events-none absolute inset-0 grid place-items-center bg-black transition-opacity duration-700 ${veil ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
          {firstVisit && (
            <svg viewBox="0 0 24 24" className="intro-flower story-flower h-20 w-20 text-gold sm:h-24 sm:w-24" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
              <path pathLength="1" d="M12 21v-8" />
              <path pathLength="1" d="M12 11c-1.6-3-1.6-5.6 0-8 1.6 2.4 1.6 5 0 8z" />
              <path pathLength="1" d="M12 12c-3-1.6-5.4-1.2-7 .4 2 1.8 4.4 2 7-.4z" />
              <path pathLength="1" d="M12 12c3-1.6 5.4-1.2 7 .4-2 1.8-4.4 2-7-.4z" />
              <path pathLength="1" d="M12 17.5c-2-.8-3.8-.4-5 1 1.6 1.2 3.4 1 5-1z" />
              <path pathLength="1" d="M12 17.5c2-.8 3.8-.4 5 1-1.6 1.2-3.4 1-5-1z" />
            </svg>
          )}
        </div>

        {/* soft dark behind the text so it always reads well */}
        <div className={`story-shade pointer-events-none absolute inset-0 ${idx === N - 1 ? 'is-finale' : ''}`} />
        {/* blends the stage into the page below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-plum" />

        <StoryPanels scenes={scenes} idx={idx} entered={entered} onDot={goTo} />

        <span ref={labelRef} className="pointer-events-none absolute left-0 top-0 z-20 rounded-full border border-gold/50 bg-plum/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold opacity-0 backdrop-blur transition-opacity duration-300">
          View
        </span>

        {ready && (
          <span className={`story-hint pointer-events-none absolute z-20 rounded-full bg-plum/60 px-4 py-1.5 text-xs tracking-widest text-muted backdrop-blur transition-opacity duration-700 ${hint && idx === 0 ? 'opacity-100' : 'opacity-0'}`}>
            Drag to rotate
          </span>
        )}
        {needTilt && (
          <button type="button" onClick={allowTilt} className="absolute left-4 top-[84px] z-20 rounded-full border border-gold/40 bg-plum/70 px-4 py-1.5 text-xs tracking-wide text-gold backdrop-blur">
            Tilt to explore
          </button>
        )}
        <Link to="/shop" className="absolute right-4 top-[84px] z-20 rounded-full border border-blush/25 bg-plum/50 px-4 py-1.5 text-xs tracking-wide text-cream backdrop-blur transition hover:border-gold hover:text-gold sm:right-8">
          Skip to Shop →
        </Link>
      </div>
    </section>
  )
}
