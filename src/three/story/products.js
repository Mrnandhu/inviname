// src/three/story/products.js — building blocks for the product pieces in the 3D story:
// the image material (light sweep, hover glow, floor reflection), the 3D clock hands,
// a glass placeholder for images that fail to load, and a tiny alpha map for accurate hover.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

/** Size of every product picture in world units. */
export const S = 2.6

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec4 uRect;      // which part of the image this plane shows (x, y, width, height)
  uniform float uOpacity;
  uniform float uSweep;    // position of the glossy light sweep
  uniform float uGlow;     // hover glow 0–1
  uniform float uReflect;  // 1 = this is the mirrored copy on the floor
  varying vec2 vUv;
  void main() {
    vec2 uv = uRect.xy + vUv * uRect.zw;
    vec4 c = texture2D(uMap, uv);
    // a soft diagonal band of light sliding across the resin
    float d = (uv.x * 0.8 + uv.y * 0.6) - uSweep;
    float band = exp(-d * d * 90.0);
    c.rgb += vec3(1.0, 0.92, 0.78) * band * 0.38 * c.a;
    c.rgb *= 1.0 + uGlow * 0.22;
    float a = c.a * uOpacity;
    if (uReflect > 0.5) a *= (1.0 - smoothstep(0.0, 0.42, vUv.y)) * 0.22;
    if (a < 0.004) discard;
    gl_FragColor = vec4(c.rgb, a);
    #include <colorspace_fragment>
  }`

/** Material for a product picture, plus a matching mirrored version for the floor reflection. */
export function productMaterial(rect = [0, 0, 1, 1]) {
  const uniforms = {
    uMap: { value: null },
    uRect: { value: new THREE.Vector4(...rect) },
    uOpacity: { value: 0 },
    uSweep: { value: -1 },
    uGlow: { value: 0 },
    uReflect: { value: 0 },
  }
  const make = (reflect) =>
    new THREE.ShaderMaterial({
      uniforms: reflect ? { ...uniforms, uReflect: { value: 1 } } : uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: !reflect,
      depthTest: !reflect,
      side: THREE.DoubleSide,
    })
  return { uniforms, mat: make(false), refl: make(true) }
}

/** 64×64 copy of the image's transparency, so hovering only counts on the actual piece. */
export function alphaMask(image) {
  try {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d', { willReadFrequently: true })
    g.drawImage(image, 0, 0, 64, 64)
    const d = g.getImageData(0, 0, 64, 64).data
    const a = new Uint8Array(64 * 64)
    for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3]
    return (u, v) => a[Math.min(63, Math.max(0, Math.floor((1 - v) * 64))) * 64 + Math.min(63, Math.max(0, Math.floor(u * 64)))] > 50
  } catch {
    return () => true
  }
}

/** Glowing glass tile shown if a product image can't be loaded. */
export function glassPlaceholder() {
  const m = new THREE.Mesh(
    new RoundedBoxGeometry(1.7, 1.7, 0.35, 4, 0.12),
    new THREE.MeshPhysicalMaterial({ color: '#ffe6ea', roughness: 0.08, transparent: true, opacity: 0.35, clearcoat: 1, envMapIntensity: 1.5, emissive: new THREE.Color('#5a2a1a'), emissiveIntensity: 0.4 }),
  )
  return m
}

/** Real 3D gold clock hands showing the current time. R = radius of the clock face. */
export function clockHands(R) {
  const group = new THREE.Group()
  const gold = new THREE.MeshStandardMaterial({ color: '#ffd486', metalness: 0.9, roughness: 0.28, envMapIntensity: 1.3, emissive: new THREE.Color('#7a4a10'), emissiveIntensity: 0.55 })
  const roseGold = new THREE.MeshStandardMaterial({ color: '#ffb3bf', metalness: 0.85, roughness: 0.3, envMapIntensity: 1.3, emissive: new THREE.Color('#6a2030'), emissiveIntensity: 0.5 })
  const shade = new THREE.MeshBasicMaterial({ color: '#1a0b10', transparent: true, opacity: 0.45, depthWrite: false })

  // a tapered hand pointing up (12 o'clock); rotating it around z turns it
  const shape = (len, w, tail) => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, -tail)
    s.lineTo(w / 2, -tail)
    s.lineTo(w * 0.34, len * 0.9)
    s.lineTo(0, len)
    s.lineTo(-w * 0.34, len * 0.9)
    s.closePath()
    return s
  }
  const hand = (len, w, tail, z, mat) => {
    const pivot = new THREE.Group()
    pivot.position.z = z
    const depth = R * 0.018
    const geo = new THREE.ExtrudeGeometry(shape(len, w, tail), { depth, bevelEnabled: true, bevelThickness: depth * 0.5, bevelSize: w * 0.12, bevelSegments: 2 })
    const m = new THREE.Mesh(geo, mat)
    pivot.add(m)
    // soft shadow under the hand so it reads well over the photo
    const sh = new THREE.Mesh(new THREE.ShapeGeometry(shape(len, w * 1.15, tail)), shade)
    sh.position.set(R * 0.018, -R * 0.03, -z + 0.004)
    pivot.add(sh)
    group.add(pivot)
    return pivot
  }
  const hour = hand(R * 0.48, R * 0.058, R * 0.09, 0.03, gold)
  const minute = hand(R * 0.72, R * 0.04, R * 0.11, 0.06, gold)
  const second = hand(R * 0.82, R * 0.014, R * 0.2, 0.09, roseGold)
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.045, R * 0.045, R * 0.05, 28), gold)
  cap.rotation.x = Math.PI / 2
  cap.position.z = 0.11
  group.add(cap)

  return {
    group,
    /** Smoothly ticking: the second hand sweeps, the others follow. */
    update() {
      const d = new Date()
      const s = d.getSeconds() + d.getMilliseconds() / 1000
      const m = d.getMinutes() + s / 60
      const h = (d.getHours() % 12) + m / 60
      second.rotation.z = -(s / 60) * Math.PI * 2
      minute.rotation.z = -(m / 60) * Math.PI * 2
      hour.rotation.z = -(h / 12) * Math.PI * 2
    },
  }
}
