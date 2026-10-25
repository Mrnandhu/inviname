// src/three/textures.js — textures drawn with code (no image downloads needed).
// Each returns a THREE.CanvasTexture. Your real photos (public/images/*.png) replace the placeholder flower.
import * as THREE from 'three'

function canvas(w, h = w) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Soft round glow: bokeh lights and sparkles. */
export function softDot(size = 128) {
  const [c, g] = canvas(size)
  const r = size / 2
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.75)')
  grad.addColorStop(0.6, 'rgba(255,255,255,0.18)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return tex(c, false)
}

/** Four-point star sparkle for gold flakes. */
export function sparkle(size = 64) {
  const [c, g] = canvas(size)
  const r = size / 2
  g.translate(r, r)
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, r)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.2, 'rgba(255,255,255,0.6)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = glow
  g.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    const len = i % 2 ? r * 0.22 : r
    g.lineTo(Math.cos(a) * len, Math.sin(a) * len)
  }
  g.closePath()
  g.fill()
  return tex(c, false)
}

/** A rose petal: pink gradient with darker veins, transparent around the shape. */
export function petal(size = 128) {
  const [c, g] = canvas(size)
  const grad = g.createLinearGradient(0, size, 0, 0)
  grad.addColorStop(0, '#c2566f')
  grad.addColorStop(0.5, '#ec8fa5')
  grad.addColorStop(1, '#fbd3dc')
  g.fillStyle = grad
  g.beginPath()
  g.moveTo(size / 2, size * 0.98)
  g.bezierCurveTo(size * 0.02, size * 0.7, size * 0.05, size * 0.12, size / 2, size * 0.04)
  g.bezierCurveTo(size * 0.95, size * 0.12, size * 0.98, size * 0.7, size / 2, size * 0.98)
  g.fill()
  g.strokeStyle = 'rgba(150,40,70,0.18)'
  g.lineWidth = 1.2
  for (let i = -2; i <= 2; i++) {
    g.beginPath()
    g.moveTo(size / 2, size * 0.95)
    g.quadraticCurveTo(size / 2 + i * size * 0.09, size * 0.5, size / 2 + i * size * 0.14, size * 0.15)
    g.stroke()
  }
  return tex(c)
}

/** Dark plum marble with soft gold-pink veins (for the floor). */
export function marble(size = 1024) {
  const [c, g] = canvas(size)
  g.fillStyle = '#22141c'
  g.fillRect(0, 0, size, size)
  // cloudy base
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = size * (0.05 + Math.random() * 0.18)
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    const light = Math.random() < 0.5
    gr.addColorStop(0, light ? 'rgba(90,60,75,0.22)' : 'rgba(10,4,8,0.3)')
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // veins
  const vein = (w, color) => {
    g.strokeStyle = color
    g.lineWidth = w
    g.beginPath()
    let x = Math.random() * size
    let y = 0
    g.moveTo(x, y)
    while (y < size) {
      x += (Math.random() - 0.5) * size * 0.12
      y += size * (0.03 + Math.random() * 0.05)
      g.lineTo(x, y)
    }
    g.stroke()
  }
  g.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 9; i++) vein(1 + Math.random() * 2.5, 'rgba(212,168,87,0.10)')
  for (let i = 0; i < 6; i++) vein(0.6 + Math.random(), 'rgba(243,207,198,0.12)')
  const t = tex(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Radial fade (white centre → black edge), used so the floor melts into the background. */
export function radialFade(size = 256, inner = 0.15) {
  const [c, g] = canvas(size)
  const r = size / 2
  const grad = g.createRadialGradient(r, r, r * inner, r, r, r)
  grad.addColorStop(0, '#fff')
  grad.addColorStop(1, '#000')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return tex(c, false)
}

/** Light ray: bright at the top, fading down and to the sides. */
export function lightRay(w = 64, h = 512) {
  const [c, g] = canvas(w, h)
  const v = g.createLinearGradient(0, 0, 0, h)
  v.addColorStop(0, 'rgba(255,255,255,0.9)')
  v.addColorStop(0.55, 'rgba(255,255,255,0.25)')
  v.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = v
  g.fillRect(0, 0, w, h)
  g.globalCompositeOperation = 'destination-in'
  const s = g.createLinearGradient(0, 0, w, 0)
  s.addColorStop(0, 'rgba(0,0,0,0)')
  s.addColorStop(0.5, 'rgba(0,0,0,1)')
  s.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = s
  g.fillRect(0, 0, w, h)
  return tex(c, false)
}

/**
 * Placeholder flower until /images/rose.png exists: a layered pink rose with small white
 * and lilac blossoms around it, on a transparent background.
 */
export function placeholderRose(size = 512) {
  const [c, g] = canvas(size)
  const cx = size / 2
  const cy = size / 2
  // small blossoms
  const blossom = (x, y, r, color, centre) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      g.fillStyle = color
      g.beginPath()
      g.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.55, r * 0.38, a, 0, Math.PI * 2)
      g.fill()
    }
    g.fillStyle = centre
    g.beginPath()
    g.arc(x, y, r * 0.28, 0, Math.PI * 2)
    g.fill()
  }
  const ring = [
    [0.18, 0.28, '#f6efe6'], [0.8, 0.24, '#d9c2ef'], [0.86, 0.66, '#f6efe6'], [0.2, 0.74, '#f3c3d0'],
    [0.5, 0.12, '#f3c3d0'], [0.52, 0.9, '#d9c2ef'], [0.1, 0.5, '#d9c2ef'], [0.92, 0.46, '#f3c3d0'],
  ]
  for (const [x, y, col] of ring) blossom(x * size, y * size, size * 0.075, col, '#d4a857')
  // the rose: layered petals from outside in
  const layers = 6
  for (let l = 0; l < layers; l++) {
    const k = 1 - l / layers
    const n = 5 + (layers - l)
    const rad = size * 0.26 * k
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + l * 0.6
      const x = cx + Math.cos(a) * rad * 0.45
      const y = cy + Math.sin(a) * rad * 0.45
      const gr = g.createRadialGradient(x, y, 0, x, y, rad * 0.75)
      gr.addColorStop(0, l > 3 ? '#9e2f50' : '#f7b3c4')
      gr.addColorStop(0.7, l > 3 ? '#c64a6b' : '#e57d97')
      gr.addColorStop(1, 'rgba(160,40,75,0.85)')
      g.fillStyle = gr
      g.beginPath()
      g.ellipse(x, y, rad * 0.62, rad * 0.46, a, 0, Math.PI * 2)
      g.fill()
    }
  }
  return tex(c)
}

/** A small five-petal blossom (white, pink or lilac) with a gold centre, for inside the resin. */
export function blossom(petalColor = '#f6efe6', edge = '#e9b9c6', size = 128) {
  const [c, g] = canvas(size)
  const r = size / 2
  g.translate(r, r)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const gr = g.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 0.95)
    gr.addColorStop(0, edge)
    gr.addColorStop(0.45, petalColor)
    gr.addColorStop(1, petalColor)
    g.fillStyle = gr
    g.save()
    g.rotate(a)
    g.beginPath()
    g.ellipse(0, -r * 0.48, r * 0.3, r * 0.46, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
  const cg = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.2)
  cg.addColorStop(0, '#fff1b8')
  cg.addColorStop(1, '#c8902e')
  g.fillStyle = cg
  g.beginPath()
  g.arc(0, 0, r * 0.18, 0, Math.PI * 2)
  g.fill()
  return tex(c)
}

/** The background: deep plum with a warm golden haze in the top-left (where the light comes from). */
export function backdrop(w = 1024, h = 512) {
  const [c, g] = canvas(w, h)
  g.fillStyle = '#1E1219'
  g.fillRect(0, 0, w, h)
  const glow = (x, y, r, col) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, col)
    gr.addColorStop(1, 'rgba(30,18,25,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, w, h)
  }
  glow(w * 0.18, h * 0.05, w * 0.55, 'rgba(150,95,70,0.55)')
  glow(w * 0.62, h * 0.45, w * 0.35, 'rgba(120,55,75,0.40)')
  glow(w * 0.95, h * 0.6, w * 0.3, 'rgba(95,50,90,0.35)')
  return tex(c)
}
