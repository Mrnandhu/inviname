// src/components/shop/Gallery.jsx — product photos: big picture with zoom, thumbnails below,
// and a full-screen view (tap to zoom in, drag to look around).
import { useEffect, useRef, useState } from 'react'
import { img } from '../../data/catalog.js'
import ArtImage from '../home/ArtImage.jsx'
import { IconClose, IconZoom } from '../Icons.jsx'

export default function Gallery({ images, name }) {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const pics = images.length ? images : ['']
  const src = pics[Math.min(i, pics.length - 1)]

  // hover zoom on laptops
  const zoomRef = useRef(null)
  const onMove = (e) => {
    const el = zoomRef.current
    if (!el) return
    const r = e.currentTarget.getBoundingClientRect()
    el.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
  }

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem] border border-plum-line bg-plum-card"
        onMouseMove={onMove}
        onClick={() => src && setOpen(true)}
        role={src ? 'button' : undefined}
        aria-label={src ? `Open larger photo of ${name}` : undefined}
      >
        <div ref={zoomRef} className="h-full w-full transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover:scale-[1.9]">
          <ArtImage key={src} src={img(src)} alt={name} eager className="h-full w-full" />
        </div>
        {src && (
          <span className="pointer-events-none absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-plum/70 text-gold backdrop-blur">
            <IconZoom className="h-5 w-5" />
          </span>
        )}
      </div>

      {pics.length > 1 && (
        <div className="flex gap-2.5">
          {pics.map((p, k) => (
            <button
              key={p + k}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Photo ${k + 1}`}
              aria-current={k === i}
              className={`h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl border bg-plum-card transition sm:h-20 sm:w-20 ${k === i ? 'border-gold' : 'border-plum-line opacity-70 hover:opacity-100'}`}
            >
              <ArtImage src={img(p, true)} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      {open && <Lightbox src={img(src)} name={name} onClose={() => setOpen(false)} />}
    </div>
  )
}

function Lightbox({ src, name, onClose }) {
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const drag = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const at = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    return `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
  }
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label={`${name} photo`} onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-plum/80 text-cream" aria-label="Close">
        <IconClose />
      </button>
      <div
        className="relative aspect-square w-full max-w-[min(92vw,86vh)] touch-none overflow-hidden"
        onClick={(e) => {
          e.stopPropagation()
          if (drag.current?.moved) return
          setOrigin(at(e))
          setZoom((z) => !z)
        }}
        onPointerDown={(e) => (drag.current = { moved: false, x: e.clientX, y: e.clientY })}
        onPointerMove={(e) => {
          if (!zoom) return
          if (drag.current && Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 6) drag.current.moved = true
          setOrigin(at(e))
        }}
        onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
      >
        <img src={src} alt={name} className={`h-full w-full object-contain transition-transform duration-300 ${zoom ? 'scale-[2.4] cursor-zoom-out' : 'cursor-zoom-in'}`} style={{ transformOrigin: origin }} />
      </div>
      <p className="pointer-events-none absolute bottom-5 text-xs tracking-widest text-muted">{zoom ? 'Move to look around · tap to zoom out' : 'Tap to zoom'}</p>
    </div>
  )
}
