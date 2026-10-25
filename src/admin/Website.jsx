// src/admin/Website.jsx — change the website's texts and pictures: home 3D story, home sections,
// About / Custom orders / Wholesale / Contact pages, policy pages, announcement bar and footer.
import { useEffect, useState } from 'react'
import { put } from './db.js'
import { Card, Field, Area, SaveButton, ConfirmButton, ImageField } from './ui.jsx'
import { useContent, refreshContent, contentLoaded, loadContent, DEFAULT_CONTENT } from '../data/content.js'

const TABS = [
  ['story', 'Home 3D story'],
  ['home', 'Home sections'],
  ['pages', 'Pages'],
  ['policies', 'Policies'],
  ['bar', 'Announcement & footer'],
]
const PAGE_HINT = 'Blank line = new paragraph · start a line with "## " for a heading · "- " for a bullet point'

export default function Website() {
  const live = useContent()
  const [c, setC] = useState(null)
  const [tab, setTab] = useState('story')
  useEffect(() => {
    loadContent().then((x) => setC(structuredClone(x)))
  }, [])
  if (!c || !contentLoaded()) return <div className="skeleton h-64 rounded-3xl" />

  // update a value deep inside the content, e.g. at(['home', 'custom', 'title'], 'New title')
  const at = (path, v) =>
    setC((old) => {
      const next = structuredClone(old)
      let o = next
      for (const k of path.slice(0, -1)) o = o[k]
      o[path.at(-1)] = v
      return next
    })
  const bind = (path) => ({ value: path.reduce((o, k) => o?.[k], c) ?? '', onChange: (e) => at(path, e.target.value) })
  const save = async () => {
    await put('content', 'site', c)
    await refreshContent()
  }
  const changed = JSON.stringify(c) !== JSON.stringify(live)

  return (
    <div className="space-y-5">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${tab === k ? 'bg-gold text-plum' : 'border border-plum-line text-cream'}`}>{l}</button>
        ))}
      </div>

      {tab === 'story' && (
        <>
          <p className="text-sm text-muted">Each scene of the home page 3D story. Change the words, the button link or the photo (use a transparent PNG/WebP, square). Hanging pieces (keychain, earrings, locket) swing from where the ring/hook is in the original photo, so keep a similar shape.</p>
          {c.story.map((sc, i) => (
            <Card key={sc.id} title={`${i + 1}. ${sc.title || sc.caption || sc.id}`} actions={!['cube', 'finale'].includes(sc.id) && <label className="flex items-center gap-2 text-sm text-muted">Show <input type="checkbox" className="switch" checked={!sc.hidden} onChange={(e) => at(['story', i, 'hidden'], !e.target.checked)} /></label>}>
              <div className={`grid gap-3 sm:grid-cols-2 ${sc.hidden ? 'opacity-50' : ''}`}>
                {sc.caption !== undefined ? (
                  <Field label="Caption" {...bind(['story', i, 'caption'])} className="sm:col-span-2" />
                ) : (
                  <>
                    <Field label="Small label" {...bind(['story', i, 'label'])} />
                    <Field label="Heading" {...bind(['story', i, 'title'])} />
                    {sc.id !== 'finale' && <Field label="Highlighted word (italic, optional)" {...bind(['story', i, 'accent'])} />}
                    {sc.text !== undefined && <Area label="Text" rows={2} {...bind(['story', i, 'text'])} className="sm:col-span-2" />}
                    <Field label="Button text" {...bind(['story', i, 'cta'])} />
                    <Field label="Button link" {...bind(['story', i, 'to'])} hint="e.g. /shop?category=earrings" />
                    {sc.cta2 && (
                      <>
                        <Field label="Second button text" {...bind(['story', i, 'cta2', 'label'])} />
                        <Field label="Second button link" {...bind(['story', i, 'cta2', 'to'])} />
                      </>
                    )}
                  </>
                )}
                {sc.img !== undefined && <ImageField label={sc.id === 'cube' ? 'Flower inside the cube' : sc.id === 'clock' ? 'Clock face (the 3D hands are added on top)' : 'Product photo'} value={sc.img} onChange={(v) => at(['story', i, 'img'], v)} folder="story" />}
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === 'home' && (
        <>
          <Card title="Category section">
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Small label" {...bind(['home', 'categories', 'label'])} /><Field label="Heading" {...bind(['home', 'categories', 'title'])} /></div>
          </Card>
          <Card title="Why us (4 points)">
            <div className="grid gap-3 sm:grid-cols-2">
              {c.home.trust.map((t, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-2xl border border-plum-line p-3">
                  <Field label={`Point ${i + 1}`} {...bind(['home', 'trust', i, 'title'])} />
                  <Field label="Small text" {...bind(['home', 'trust', i, 'text'])} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Best sellers section">
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Small label" {...bind(['home', 'best', 'label'])} /><Field label="Heading" {...bind(['home', 'best', 'title'])} /></div>
            <p className="mt-2 text-xs text-muted">Products marked “Featured” show here (Admin → Products).</p>
          </Card>
          {[['custom', 'Custom orders banner'], ['wholesale', 'Wholesale banner']].map(([k, t]) => (
            <Card key={k} title={t}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Small label" {...bind(['home', k, 'label'])} />
                <Field label="Heading" {...bind(['home', k, 'title'])} />
                <Area label="Text" rows={2} {...bind(['home', k, 'text'])} className="sm:col-span-2" />
                <Field label="Button text" {...bind(['home', k, 'cta'])} />
              </div>
            </Card>
          ))}
          <Card title="Reviews section">
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Small label" {...bind(['home', 'reviews', 'label'])} /><Field label="Heading" {...bind(['home', 'reviews', 'title'])} /></div>
            <p className="mt-2 text-xs text-muted">Shows only when you have added reviews (Admin → Reviews).</p>
          </Card>
        </>
      )}

      {tab === 'pages' && (
        <>
          {[['about', 'About page'], ['customOrders', 'Custom Orders page'], ['wholesale', 'Wholesale page']].map(([k, t]) => (
            <Card key={k} title={t}>
              <div className="grid gap-3">
                <Field label="Heading" {...bind(['pages', k, 'title'])} />
                <Field label="Intro line" {...bind(['pages', k, 'intro'])} />
                <Area label="Page text" rows={10} hint={PAGE_HINT} {...bind(['pages', k, 'body'])} />
              </div>
            </Card>
          ))}
          <Card title="Contact page">
            <div className="grid gap-3">
              <Field label="Heading" {...bind(['pages', 'contact', 'title'])} />
              <Field label="Intro line" {...bind(['pages', 'contact', 'intro'])} />
              <Field label="Opening hours" {...bind(['pages', 'contact', 'hours'])} />
              <p className="text-xs text-muted">Phone, WhatsApp, email and Instagram come from Admin → Settings.</p>
            </div>
          </Card>
        </>
      )}

      {tab === 'policies' &&
        Object.keys(DEFAULT_CONTENT.policies).map((k) => (
          <Card key={k} title={c.policies[k].title}>
            <div className="grid gap-3">
              <Field label="Heading" {...bind(['policies', k, 'title'])} />
              <Area label="Text" rows={12} hint={PAGE_HINT} {...bind(['policies', k, 'body'])} />
            </div>
          </Card>
        ))}

      {tab === 'bar' && (
        <>
          <Card title="Announcement bar (top of every page)">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Text (leave empty to hide)" {...bind(['announcement', 'text'])} placeholder="e.g. Diwali gift boxes – order before 25 Oct 🪔" />
              <Field label="Link (optional)" {...bind(['announcement', 'link'])} placeholder="/shop?category=combos" />
            </div>
          </Card>
          <Card title="Footer">
            <Area label="Footer line" rows={2} {...bind(['footer', 'tagline'])} />
          </Card>
        </>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-full border border-gold/30 bg-plum/95 p-2 pl-5 backdrop-blur">
        <span className="text-sm text-muted">{changed ? 'You have unsaved changes' : 'All changes saved'}</span>
        <span className="ml-auto flex gap-2">
          {changed && <button type="button" onClick={() => setC(structuredClone(live))} className="btn-ghost min-h-11 px-5">Undo</button>}
          <SaveButton onSave={save} label="Save website" />
        </span>
      </div>
      <p className="text-xs text-muted">
        Want the original texts back?{' '}
        <ConfirmButton onConfirm={() => setC(structuredClone(DEFAULT_CONTENT))} confirmText="Yes, restore originals" className="text-gold underline">Restore all original texts</ConfirmButton>
        {' '}then press Save website. Products and settings are not touched.
      </p>
    </div>
  )
}
