// src/three/story/engine.js — the home page 3D story.
// One full-screen canvas. The page scroll (GSAP ScrollTrigger in Story.jsx) tells the engine where
// we are in the story (0 = first scene … 9 = finale) and everything here follows that number smoothly:
// the camera, which product is showing, the petals and gold flakes that carry us between scenes.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { softDot, sparkle, petal, marble, radialFade, lightRay, backdrop } from '../textures.js'
import { S, productMaterial, alphaMask, glassPlaceholder, clockHands } from './products.js'

const PLUM = '#1E1219'
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const mix = (a, b, t) => a + (b - a) * t
const rnd = (a, b) => a + Math.random() * (b - a)

// Camera moves per scene (gentle orbit / tilt between scenes): [sideways angle, height angle]
const CAM = [[0, 0.1], [0.3, 0.2], [-0.22, 0.08], [0.2, 0.12], [-0.28, 0.1], [0.12, 0.06], [-0.2, 0.16], [0.24, 0.08], [-0.14, 0.12], [0, 0.3]]

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} o
 *   scenes   – the STORY list (src/config/story.js)
 *   imageUrl – (name) => url
 *   lite     – phones / slow devices: lighter materials, fewer particles, no bloom
 *   onHover  – (on, x, y) show / hide the "View" label at x, y (px)
 *   onSelect – (link) a product was clicked / tapped
 *   onReady  – first images are ready, the canvas can fade in
 */
export function createStory(canvas, o) {
  const { scenes, lite } = o
  const N = scenes.length
  const disposables = []
  const keep = (x) => (disposables.push(x), x)

  // ---------- renderer, scene, camera ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' })
  renderer.setClearColor(PLUM)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping // keeps the product photos' colours exactly as they are
  let dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.3 : 1.75)
  renderer.setPixelRatio(dpr)

  const scene = new THREE.Scene()
  scene.background = keep(backdrop())
  scene.fog = new THREE.Fog(PLUM, 14, 34)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = keep(pmrem.fromScene(new RoomEnvironment(), 0.04).texture)
  pmrem.dispose()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 90)

  // ---------- lights: warm golden key from the top-left, rose rim light ----------
  scene.add(new THREE.AmbientLight('#4a2a38', 0.5))
  const key = new THREE.DirectionalLight('#ffd7a1', 1.6)
  key.position.set(-4, 6, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#ff8fab', 1.2)
  rim.position.set(4, 2.5, -4)
  scene.add(rim)

  const glowTex = keep(softDot(256))
  const floorY = -S / 2 - 0.25

  // ---------- dark reflective marble floor ----------
  const marbleTex = keep(marble(lite ? 512 : 1024))
  marbleTex.repeat.set(2, 2)
  const floor = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(34, 34)),
    keep(new THREE.MeshPhysicalMaterial({ map: marbleTex, color: '#b89aa2', roughness: 0.35, specularIntensity: 0.12, envMapIntensity: 0.06, transparent: true, depthWrite: false, alphaMap: keep(radialFade(256, 0.05)) })),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = floorY
  floor.renderOrder = -2
  scene.add(floor)
  const sheen = new THREE.Mesh(keep(new THREE.PlaneGeometry(5, 5)), keep(new THREE.MeshBasicMaterial({ map: glowTex, color: '#ffcf8a', transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending })))
  sheen.rotation.x = -Math.PI / 2
  sheen.position.y = floorY + 0.01
  sheen.renderOrder = -1
  scene.add(sheen)
  // mirror matrix: reflects anything in the floor plane
  const mirror = new THREE.Matrix4().makeTranslation(0, floorY, 0).multiply(new THREE.Matrix4().makeScale(1, -1, 1)).multiply(new THREE.Matrix4().makeTranslation(0, -floorY, 0))

  // ---------- light rays from the top-left ----------
  const rayTex = keep(lightRay())
  const rays = new THREE.Group()
  for (const [x, w, op] of [[-0.4, 1.8, 0.2], [0.5, 1.1, 0.16], [1.3, 2.2, 0.13], [2.2, 0.9, 0.11], [3.0, 1.5, 0.08]]) {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, 13)), keep(new THREE.MeshBasicMaterial({ map: rayTex, color: '#ffdcae', transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })))
    m.position.x = x
    m.userData.base = op
    rays.add(m)
  }
  rays.position.set(-3.6, 4.6, -1.6)
  scene.add(rays)

  // ---------- points (bokeh lights far away, gold flakes near) ----------
  const pointsMaterial = (tex, sizeBase, drift) =>
    keep(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uMap: { value: tex }, uScale: { value: 1 }, uFade: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aSize; attribute float aPhase; attribute vec3 aColor;
          uniform float uTime; uniform float uScale;
          varying vec3 vColor; varying float vTw;
          void main() {
            vec3 p = position;
            p.x += sin(uTime * 0.13 + aPhase * 6.0) * ${drift.toFixed(2)};
            p.y += cos(uTime * 0.11 + aPhase * 4.0) * ${(drift * 0.8).toFixed(2)};
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * ${sizeBase.toFixed(1)} * uScale / -mv.z;
            vColor = aColor;
            vTw = 0.55 + 0.45 * sin(uTime * (1.2 + aPhase * 2.0) + aPhase * 30.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap; uniform float uFade;
          varying vec3 vColor; varying float vTw;
          void main() {
            vec4 t = texture2D(uMap, gl_PointCoord);
            gl_FragColor = vec4(vColor * vTw, t.a * vTw * uFade);
          }`,
      }),
    )
  const makePoints = (n, place, mat, sizeRange, colors) => {
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const phase = new Float32Array(n)
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      place(pos, i)
      size[i] = rnd(sizeRange[0], sizeRange[1])
      phase[i] = Math.random()
      const c = colors[i % colors.length]
      col.set([c.r, c.g, c.b], i * 3)
    }
    const g = keep(new THREE.BufferGeometry())
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    const p = new THREE.Points(g, mat)
    p.frustumCulled = false
    return p
  }
  const bokeh = makePoints(
    lite ? 36 : 80,
    (a, i) => a.set([rnd(-16, 16), rnd(-2.5, 9), rnd(-18, -6)], i * 3),
    pointsMaterial(glowTex, 300, 0.35),
    [0.6, 2.2],
    ['#d4a857', '#b76e79', '#f3cfc6'].map((c, i) => new THREE.Color(c).multiplyScalar([0.35, 0.4, 0.25][i])),
  )
  scene.add(bokeh)
  const flakeTex = keep(sparkle(64))
  const GOLD = new THREE.Color('#D4A857')
  const nFlakes = lite ? 150 : 420
  const flakes = makePoints(nFlakes, () => {}, pointsMaterial(flakeTex, 95, 0.05), [0.5, 1.6], [GOLD.clone().multiplyScalar(1.6), GOLD.clone().multiplyScalar(1.1), new THREE.Color('#F3CFC6').multiplyScalar(0.9)])
  flakes.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage)
  scene.add(flakes)

  // ---------- petals (curved, real 3D) ----------
  const petalGeo = keep(new THREE.PlaneGeometry(0.26, 0.34, 4, 4))
  {
    const p = petalGeo.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.pow(p.getX(i) * 3, 2) * 0.12 - p.getY(i) * 0.08)
    petalGeo.computeVertexNormals()
  }
  const nPetals = lite ? 26 : 70
  const petals = new THREE.InstancedMesh(petalGeo, keep(new THREE.MeshStandardMaterial({ map: keep(petal()), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.55 })), nPetals)
  petals.frustumCulled = false
  scene.add(petals)

  // every petal / flake has its own path: where it rests around a product, and where it flies when swirling
  const seeds = (n) =>
    Array.from({ length: n }, () => ({
      a: rnd(0, Math.PI * 2), rg: rnd(1.5, 2.9), y: rnd(-1.2, 1.8), rs: rnd(2.2, 7.5), sp: rnd(0.3, 0.9) * (Math.random() < 0.5 ? 1 : -1),
      ph: rnd(0, 6.28), axis: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), spin: rnd(0.5, 1.6), s: rnd(0.7, 1.25), push: new THREE.Vector3(),
    }))
  const petalSeeds = seeds(nPetals)
  const flakeSeeds = seeds(nFlakes)

  // ---------- the products ----------
  const loader = new THREE.TextureLoader()
  const items = [] // one per scene that shows something
  const anim = [] // reflection meshes to update each frame
  let loadedFirst = 0

  function loadInto(item, name, onTex) {
    loader.load(
      o.imageUrl(name),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        keep(t)
        item.mask = alphaMask(t.image)
        onTex(t)
        item.loaded = true
        if (item.idx <= 2 && ++loadedFirst >= 2) o.onReady?.()
      },
      undefined,
      () => {
        // image missing: show a glowing glass tile instead of a broken picture
        const ph = glassPlaceholder()
        item.body.add(ph)
        item.hit.push(ph)
        item.mask = null
        item.loaded = true
        if (item.idx <= 2 && ++loadedFirst >= 2) o.onReady?.()
      },
    )
  }

  function imagePlane(item, w, h, rect, offset) {
    const pm = productMaterial(rect)
    const mesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), keep(pm.mat))
    mesh.position.copy(offset)
    mesh.userData.rect = rect
    item.uniforms.push(pm.uniforms)
    item.hit.push(mesh)
    const r = new THREE.Mesh(mesh.geometry, keep(pm.refl))
    r.matrixAutoUpdate = false
    r.renderOrder = -1
    r.userData.src = mesh
    r.userData.item = item
    scene.add(r)
    anim.push(r)
    return mesh
  }

  // the resin cube with the rose inside (scene 1)
  let cube = null
  scenes.forEach((sc, idx) => {
    if (sc.motion === 'burst' || sc.motion === 'finale') return
    const root = new THREE.Group()
    const body = new THREE.Group()
    root.add(body)
    scene.add(root)
    const glow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glowTex, color: '#d4a857', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })))
    glow.scale.set(S * 1.5, S * 1.5, 1)
    glow.position.z = -0.6
    root.add(glow)
    const item = { idx, sc, root, body, glow, uniforms: [], hit: [], parts: [], mask: null, loaded: false, hover: 0, vis: 0, link: sc.to, phase: Math.random() * 6 }
    items.push(item)

    if (sc.motion === 'cube') {
      const geo = keep(new RoundedBoxGeometry(2, 2, 2, 5, 0.14))
      const mat = keep(
        lite
          ? new THREE.MeshPhysicalMaterial({ color: '#ffe9e4', roughness: 0.05, transparent: true, opacity: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2, depthWrite: false })
          : new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transmission: 1, thickness: 1.4, ior: 1.49, clearcoat: 1, clearcoatRoughness: 0.03, attenuationColor: new THREE.Color('#ffe2e6'), attenuationDistance: 7, envMapIntensity: 1.1 }),
      )
      const box = new THREE.Mesh(geo, mat)
      box.renderOrder = 2
      body.add(box)
      // warm light catching the 12 edges of the resin
      const rimMat = keep(
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uColor: { value: new THREE.Color('#ffd9a0') }, uPower: { value: 0 } },
          vertexShader: 'varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
          fragmentShader: 'uniform vec3 uColor; uniform float uPower; varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vec3 a = abs(vP); float mid = max(min(a.x, a.y), min(max(a.x, a.y), a.z)); float e = smoothstep(0.86, 0.985, mid); float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 4.0) * 0.1; float g = (e * 0.75 + f) * uPower; gl_FragColor = vec4(uColor * g, g); }',
        }),
      )
      const shell = new THREE.Mesh(geo, rimMat)
      shell.scale.setScalar(1.002)
      shell.renderOrder = 3
      body.add(shell)
      // the rose: always faces the viewer, cut out by its transparency so the glass refracts it
      const roseMat = keep(new THREE.MeshBasicMaterial({ transparent: false, alphaTest: 0.45, side: THREE.DoubleSide, toneMapped: false, color: '#ffffff' }))
      roseMat.visible = false
      const rose = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.75, 1.75)), roseMat)
      rose.renderOrder = 1
      body.add(rose)
      // a few gold flakes sealed inside
      const inner = makePoints(lite ? 60 : 130, (a, i) => a.set([rnd(-0.85, 0.85), rnd(-0.85, 0.85), rnd(-0.85, 0.85)], i * 3), pointsMaterial(flakeTex, 110, 0.03), [0.4, 1.4], [GOLD.clone().multiplyScalar(2.2), new THREE.Color('#fff0c8').multiplyScalar(1.6)])
      body.add(inner)
      item.hit.push(box)
      cube = { item, box, rimMat, rose, inner }
      loadInto(item, sc.img, (t) => {
        roseMat.map = t
        roseMat.visible = true
        roseMat.needsUpdate = true
        item.mask = null // the whole cube is clickable
      })
      return
    }

    if (sc.motion === 'earrings') {
      // two halves of the same picture, each hanging from its own hook so they swing separately
      ;[sc.pivotL || [0.21, 0.93], sc.pivotR || [0.775, 0.92]].forEach(([u, v], k) => {
        const hang = new THREE.Group()
        const px = (u - 0.5) * S
        const py = (v - 0.5) * S
        hang.position.set(px, py, 0)
        body.add(hang)
        const mesh = imagePlane(item, S / 2, S, [k * 0.5, 0, 0.5, 1], new THREE.Vector3((k ? S / 4 : -S / 4) - px, -py, 0))
        hang.add(mesh)
        item.parts.push(hang)
      })
    } else {
      const piv = sc.pivot || [0.5, 0.5]
      const hang = new THREE.Group()
      const px = (piv[0] - 0.5) * S
      const py = (piv[1] - 0.5) * S
      hang.position.set(px, py, 0)
      body.add(hang)
      hang.add(imagePlane(item, S, S, [0, 0, 1, 1], new THREE.Vector3(-px, -py, 0)))
      item.parts.push(hang)
      if (sc.motion === 'clock') {
        // the clock face fills the picture: radius ≈ half the image
        const hands = clockHands(S * 0.49)
        hands.group.position.z = 0.02
        hang.add(hands.group)
        item.clock = hands
        hands.group.visible = false
      }
    }
    loadInto(item, sc.img, (t) => {
      item.uniforms.forEach((u) => (u.uMap.value = t))
      if (item.clock) item.clock.group.visible = true
    })
  })

  // ---------- post-processing on laptops: bloom on gold and highlights + vignette ----------
  let composer = null
  if (!lite) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.55, 0.86))
    composer.addPass(
      new ShaderPass({
        uniforms: { tDiffuse: { value: null }, uAmount: { value: 0.4 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform sampler2D tDiffuse; uniform float uAmount; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); float d = distance(vUv, vec2(0.5)); c.rgb *= 1.0 - smoothstep(0.35, 0.85, d) * uAmount; gl_FragColor = c; }',
      }),
    )
    composer.addPass(new OutputPass())
  }

  // ---------- layout: where the product sits on screen (beside the text on laptops, above it on phones) ----------
  const view = { w: 1, h: 1, dist: 10, portrait: false, size: 300, prod: [0, 0], fin: [0, 0] }
  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    Object.assign(view, { w, h, portrait: w / h < 0.9 })
    renderer.setSize(w, h, false)
    composer?.setSize(w, h)
    camera.aspect = w / h
    view.size = view.portrait ? Math.min(w * 0.74, h * 0.36) : Math.min(w * 0.36, h * 0.62)
    view.prod = view.portrait ? [w * 0.5, h * 0.36] : [w * (w < 1100 ? 0.7 : 0.68), h * 0.52]
    view.fin = view.portrait ? [w * 0.5, h * 0.37] : [w * 0.5, h * 0.68]
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    view.dist = ((S / view.size) * h) / (2 * tanHalf)
    for (const p of [bokeh, flakes, cube?.inner]) if (p) p.material.uniforms.uScale.value = h / 900
  }

  // ---------- pointer, drag, hover ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const tilt = { x: 0, y: 0 }
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const cursorWorld = new THREE.Vector3(99, 99, 99)
  const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  let hovered = null
  let drag = null
  let cubeSpin = 0

  function pick(e) {
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    ray.ray.intersectPlane(zPlane, cursorWorld)
    let best = null
    for (const it of items) {
      if (it.vis < 0.6 || !it.loaded) continue
      for (const h of ray.intersectObjects(it.hit, false)) {
        const rect = h.object.userData.rect
        const ok = !it.mask || !h.uv || it.mask(rect ? rect[0] + h.uv.x * rect[2] : h.uv.x, rect ? rect[1] + h.uv.y * rect[3] : h.uv.y)
        if (ok && (!best || h.distance < best.d)) best = { it, d: h.distance }
      }
    }
    return best?.it || null
  }
  function onMove(e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    if (e.pointerType === 'touch' && !drag) return
    hovered = pick(e)
    canvas.style.cursor = hovered ? 'pointer' : cur < 0.5 ? 'grab' : ''
    if (drag) {
      const dx = e.clientX - drag.x
      drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y)
      if (drag.cube) cubeSpin += dx * 0.004
      drag.x = e.clientX
      drag.y = e.clientY
    }
  }
  function onDown(e) {
    hovered = pick(e)
    drag = { x: e.clientX, y: e.clientY, moved: 0, cube: cur < 0.5, hit: hovered }
  }
  function onUp() {
    if (drag && drag.moved < 10 && drag.hit) o.onSelect?.(drag.hit.link)
    if (drag && drag.moved >= 10 && 'ontouchstart' in window) hovered = null
    drag = null
  }
  function onLeave() {
    pointer.tx = pointer.ty = 0
    cursorWorld.set(99, 99, 99)
    hovered = null
  }
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointerleave', onLeave)

  // ---------- the loop ----------
  // simple frame timer (THREE.Clock is deprecated in newer three.js)
  const clock = {
    last: 0,
    start() {
      this.last = performance.now()
    },
    stop() {},
    getDelta() {
      const t = performance.now()
      const d = (t - this.last) / 1000
      this.last = t
      return d
    },
  }
  let raf = 0
  let running = false
  let target = 0 // story position from the scroll (0 … N-1)
  let cur = 0 // smoothed story position
  let intro = 0
  let time = 0
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const v = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const sc3 = new THREE.Vector3()
  const lookAt = new THREE.Vector3()
  const labelPos = new THREE.Vector3()
  const swirlLevel = scenes.map((s) => (s.motion === 'burst' ? 1 : 0))

  let quality = lite ? 1 : 2 // 2 = bloom, 1 = no post-processing, 0 = fewer particles + lower resolution
  let slowTime = 0
  let lastCheck = performance.now()

  function step() {
    raf = requestAnimationFrame(step)
    const dt = Math.min(clock.getDelta(), 0.05)
    time += dt
    const t = time
    intro = Math.min(1, intro + dt / 1.6)
    const ei = 1 - Math.pow(1 - intro, 3)

    // follow the scroll with a soft ease (cinematic, never a jump)
    cur += (target - cur) * (1 - Math.exp(-dt * 4.5))
    const k = Math.min(N - 2, Math.floor(cur))
    const f = cur - k
    const swirl = Math.max(mix(swirlLevel[k], swirlLevel[k + 1], smooth(0, 1, f)), Math.sin(Math.PI * f) * 0.9)
    const fin = smooth(N - 1.65, N - 1.05, cur) // finale weight

    pointer.x += (pointer.tx + tilt.x - pointer.x) * Math.min(1, dt * 3)
    pointer.y += (pointer.ty + tilt.y - pointer.y) * Math.min(1, dt * 3)

    // ----- camera: orbit / tilt between scene presets, pull back while petals swirl, dolly in on arrival -----
    const ca = CAM[k] || CAM[0]
    const cb = CAM[k + 1] || ca
    const e = smooth(0, 1, f)
    const az = mix(ca[0], cb[0], e) + pointer.x * 0.08 + Math.sin(t * 0.1) * 0.03
    const el = mix(ca[1], cb[1], e) - pointer.y * 0.05
    const dist = view.dist * (1 + 0.16 * swirl + 0.28 * fin) * (1.22 - 0.22 * ei)
    camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist)
    camera.lookAt(lookAt)
    // place the action beside the text (or centred for the finale)
    const px = mix(view.prod[0], view.fin[0], fin)
    const py = mix(view.prod[1], view.fin[1], fin)
    camera.setViewOffset(view.w, view.h, view.w / 2 - px, view.h / 2 - py, view.w, view.h)
    camera.updateProjectionMatrix()
    // world x of the screen centre (so the swirl crosses the whole screen)
    const centreX = ((view.w / 2 - px) / view.size) * S

    // ----- products -----
    const nItems = items.length
    items.forEach((it, n) => {
      const d = cur - it.idx
      let vis = 1 - smooth(0.16, 0.5, Math.abs(d))
      const arrive = d < 0 ? smooth(-0.5, 0, d) : 1
      const leave = d > 0 ? smooth(0, 0.5, d) : 0
      // scene pose
      let x = 0
      let y = Math.sin(t * 0.8 + it.phase) * 0.06 - (1 - arrive) * 0.4 + leave * 0.25
      let z = 0
      let s = (0.72 + 0.28 * arrive) * (1 + leave * 0.12) * (it.sc.size || 1)
      // finale pose: all pieces circle slowly around the centre
      if (fin > 0) {
        const ang = (n / nItems) * Math.PI * 2 + t * 0.14
        // a flat ring below the heading (laptops) or above the text (phones)
        const RX = view.portrait ? 1.8 : 3.5
        const RZ = view.portrait ? 1.5 : 1.35
        const fx = Math.cos(ang) * RX
        const fz = Math.sin(ang) * RZ
        const fy = Math.sin(t * 0.7 + n) * 0.08
        const fs = view.portrait ? 0.3 : 0.42
        const clear = 1
        x = mix(x, fx, fin)
        y = mix(y, fy, fin)
        z = mix(z, fz, fin)
        s = mix(s, fs, fin)
        vis = Math.max(vis * (1 - fin), fin * clear)
      }
      vis *= ei * (it.loaded ? 1 : 0)
      it.vis = vis
      it.root.visible = vis > 0.01
      if (!it.root.visible) {
        it.glow.material.opacity = 0
        return
      }
      const isHover = hovered === it
      it.hover += ((isHover ? 1 : 0) - it.hover) * Math.min(1, dt * 6)
      it.root.position.set(x, y, z)
      it.root.scale.setScalar(s * (1 + it.hover * 0.05) * (0.6 + 0.4 * Math.min(1, vis * 1.6)))
      // tilt towards the mouse / phone tilt; hovered pieces turn to face the visitor
      const ry = pointer.x * 0.28 * (1 - it.hover * 0.6)
      const rx = pointer.y * 0.16 * (1 - it.hover * 0.6)
      it.root.rotation.set(rx, ry + (1 - arrive) * 0.5 - leave * 0.4, 0)

      // each piece's own motion
      const m = it.sc.motion
      const calm = 1 - it.hover * 0.7
      if (m === 'swing' || m === 'locket') it.parts[0].rotation.z = Math.sin(t * 1.3 + it.phase) * 0.07 * calm
      if (m === 'earrings') it.parts.forEach((p, j) => (p.rotation.z = Math.sin(t * 1.6 + j * 1.3) * 0.08 * calm))
      if (m === 'turn') it.body.rotation.y = Math.sin(t * 0.45) * 0.42 * calm
      if (m === 'spin') it.body.rotation.set(Math.sin(t * 0.3) * 0.12, Math.sin(t * 0.35) * 0.55 * calm, Math.sin(t * 0.25) * 0.06)
      if (m === 'float') it.body.rotation.set(0, Math.sin(t * 0.4) * 0.22 * calm, Math.sin(t * 0.5) * 0.03)
      if (m === 'clock') {
        it.body.rotation.y = Math.sin(t * 0.35) * 0.18 * calm
        it.clock.update()
      }
      if (m === 'cube') {
        cubeSpin *= Math.pow(0.04, dt)
        it.body.rotation.y += (0.22 + it.hover * 0.5) * dt + cubeSpin * dt * 6
        it.body.rotation.x = Math.sin(t * 0.4) * 0.06
        cube.rose.quaternion.copy(it.body.quaternion).invert().multiply(it.root.quaternion.clone().invert()).multiply(camera.quaternion)
        cube.rimMat.uniforms.uPower.value = vis * (1 + it.hover * 0.6)
        cube.inner.material.uniforms.uTime.value = t
        cube.inner.material.uniforms.uFade.value = vis
      }

      for (const u of it.uniforms) {
        u.uOpacity.value = Math.min(1, vis * 1.4)
        u.uGlow.value = it.hover
        u.uSweep.value = ((t * 0.28 + it.phase) % 1.9) * 1.8 - 0.4
      }
      it.glow.material.opacity = (0.22 + it.hover * 0.35) * vis
    })

    // floor reflections follow their product
    for (const r of anim) {
      const it = r.userData.item
      r.visible = it.root.visible && it.vis > 0.05 && quality > 0
      if (r.visible) {
        r.userData.src.updateWorldMatrix(true, false)
        r.matrix.multiplyMatrices(mirror, r.userData.src.matrixWorld)
        r.matrixWorldNeedsUpdate = true
      }
    }

    // ----- petals and gold flakes: rest around the product, swirl across the screen between scenes -----
    const gatherR = 1 + fin * 0.8
    const place = (sd, i, out) => {
      const ga = sd.a + t * 0.12 * Math.sign(sd.sp)
      const gx = Math.cos(ga) * sd.rg * gatherR
      const gy = sd.y + Math.sin(t * 0.5 + sd.ph) * 0.15
      const gz = Math.sin(ga) * sd.rg * 0.55 * gatherR
      const sa = sd.a + t * sd.sp * 0.6 + cur * 2.6
      const sx = centreX + Math.cos(sa) * sd.rs * 1.3
      const sy = Math.sin(sa) * sd.rs * 0.6 + 0.4
      const sz = Math.sin(sa * 1.7 + sd.ph) * 2 + 0.6
      out.set(mix(gx, sx, swirl), mix(gy, sy, swirl), mix(gz, sz, swirl))
    }
    const pCount = quality === 0 ? Math.floor(nPetals / 2) : nPetals
    petals.count = pCount
    for (let i = 0; i < pCount; i++) {
      const sd = petalSeeds[i]
      place(sd, i, v)
      // petals drift away from the cursor
      const dx = v.x + sd.push.x - cursorWorld.x
      const dy = v.y + sd.push.y - cursorWorld.y
      const dd = Math.hypot(dx, dy)
      if (dd < 1.3 && dd > 0.001) {
        const fpush = ((1.3 - dd) / 1.3) * dt * 6
        sd.push.x += (dx / dd) * fpush
        sd.push.y += (dy / dd) * fpush
      }
      sd.push.multiplyScalar(Math.pow(0.25, dt))
      v.add(sd.push)
      q.setFromAxisAngle(sd.axis, t * sd.spin * (1 + swirl * 2) + i)
      sc3.setScalar(sd.s * ei * (1 + swirl * 0.25))
      m4.compose(v, q, sc3)
      petals.setMatrixAt(i, m4)
    }
    petals.instanceMatrix.needsUpdate = true
    const fp = flakes.geometry.attributes.position
    const fCount = quality === 0 ? Math.floor(nFlakes / 2) : nFlakes
    flakes.geometry.setDrawRange(0, fCount)
    for (let i = 0; i < fCount; i++) {
      place(flakeSeeds[i], i, v2)
      fp.setXYZ(i, v2.x, v2.y, v2.z)
    }
    fp.needsUpdate = true
    for (const p of [bokeh, flakes]) {
      p.material.uniforms.uTime.value = t
      p.material.uniforms.uFade.value = ei
    }

    // light rays sweep in at the start, then breathe
    rays.rotation.z = -0.95 + 0.33 * ei
    rays.children.forEach((mm, i) => (mm.material.opacity = mm.userData.base * ei * (0.75 + 0.25 * Math.sin(t * 0.6 + i * 1.7))))
    sheen.material.opacity = 0.2 * (1 - swirl * 0.6) * (1 - fin * 0.5)

    // "View" label above the hovered piece
    if (o.onHover) {
      if (hovered && hovered.vis > 0.5) {
        labelPos.set(0, S * 0.55, 0).applyMatrix4(hovered.root.matrixWorld).project(camera)
        o.onHover(true, ((labelPos.x + 1) / 2) * view.w, ((1 - labelPos.y) / 2) * view.h)
      } else o.onHover(false, 0, 0)
    }

    if (composer && quality === 2) composer.render(dt)
    else renderer.render(scene, camera)
    watchSpeed(dt)
  }

  // If frames are too slow, step the quality down (bloom off → lower resolution and fewer particles).
  function watchSpeed(dt) {
    if (dt > 1 / 40) slowTime += dt
    const now = performance.now()
    if (now - lastCheck < 2500) return
    const share = slowTime / ((now - lastCheck) / 1000)
    lastCheck = now
    slowTime = 0
    if (intro < 1 || share < 0.35 || quality === 0) return
    quality--
    dpr = Math.min(dpr, quality === 1 ? 1.25 : 1)
    renderer.setPixelRatio(dpr)
    resize()
  }

  resize()
  window.addEventListener('resize', resize)

  return {
    /** Story position from the scroll: 0 = first scene, N-1 = finale. */
    setProgress(p) {
      target = Math.max(0, Math.min(N - 1, p))
    },
    jump(p) {
      target = cur = Math.max(0, Math.min(N - 1, p))
    },
    setTilt(x, y) {
      tilt.x = x
      tilt.y = y
    },
    start() {
      if (running) return
      running = true
      clock.start()
      raf = requestAnimationFrame(step)
    },
    stop() {
      running = false
      clock.stop()
      cancelAnimationFrame(raf)
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerleave', onLeave)
      scene.traverse((ob) => {
        ob.geometry?.dispose?.()
        if (ob.material) [].concat(ob.material).forEach((m) => m.dispose?.())
      })
      disposables.forEach((d) => d.dispose?.())
      composer?.dispose?.()
      renderer.dispose()
    },
  }
}
