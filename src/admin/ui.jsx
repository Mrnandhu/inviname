// src/admin/ui.jsx — form pieces used across the admin panel
import { useState } from 'react'
import { uploadImage } from '../data/upload.js'
import { img } from '../data/catalog.js'
import { IconClose, IconPlus } from '../components/Icons.jsx'

export function Card({ title, children, actions, className = '' }) {
  return (
    <section className={`rounded-3xl border border-plum-line bg-plum-card/70 p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-sans text-lg font-medium text-cream">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, className = '', ...rest }) {
  return (
    <label className={`block text-sm text-muted ${className}`}>
      {label}
      <input className="field mt-1 w-full rounded-2xl" {...rest} />
      {hint && <span className="mt-1 block text-xs text-muted/80">{hint}</span>}
    </label>
  )
}

export function Area({ label, hint, className = '', rows = 4, ...rest }) {
  return (
    <label className={`block text-sm text-muted ${className}`}>
      {label}
      <textarea rows={rows} className="field mt-1 w-full rounded-2xl py-2.5 leading-relaxed" {...rest} />
      {hint && <span className="mt-1 block text-xs text-muted/80">{hint}</span>}
    </label>
  )
}

export function Num({ label, value, onChange, className = '', ...rest }) {
  return <Field label={label} className={className} inputMode="decimal" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value.replace(/[^\d.]/g, '')))} {...rest} />
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-plum-line px-4 py-3 text-sm">
      <span>
        <span className="block text-cream">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <input type="checkbox" className="switch" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block text-sm text-muted ${className}`}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="select mt-1 w-full rounded-2xl">
        {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
      </select>
    </label>
  )
}

/** Save button with "Saving…" and "Saved ✓" states */
export function SaveButton({ onSave, label = 'Save changes', className = '' }) {
  const [state, setState] = useState('')
  const [err, setErr] = useState('')
  return (
    <span className={`inline-flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        disabled={state === 'saving'}
        onClick={async () => {
          setState('saving')
          setErr('')
          try {
            await onSave()
            setState('saved')
            setTimeout(() => setState(''), 2500)
          } catch (e) {
            console.error(e)
            setErr(e.message || 'Could not save')
            setState('')
          }
        }}
        className="btn-rose min-h-11 px-6 disabled:opacity-60"
      >
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved ✓' : label}
      </button>
      {err && <span role="alert" className="text-sm text-rose-light">{err}</span>}
    </span>
  )
}

/** A button that asks "Sure?" before doing something that can't be undone */
export function ConfirmButton({ onConfirm, children, className = 'btn-ghost min-h-10 px-4', confirmText = 'Yes, delete' }) {
  const [ask, setAsk] = useState(false)
  if (ask)
    return (
      <span className="inline-flex gap-2">
        <button type="button" className="min-h-10 rounded-full bg-rose px-4 text-sm text-white" onClick={async () => { setAsk(false); await onConfirm() }}>{confirmText}</button>
        <button type="button" className="min-h-10 rounded-full border border-plum-line px-4 text-sm text-cream" onClick={() => setAsk(false)}>Cancel</button>
      </span>
    )
  return <button type="button" className={className} onClick={() => setAsk(true)}>{children}</button>
}

/** One picture: upload from the computer/phone, or paste a link */
export function ImageField({ label, value, onChange, folder = 'site' }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function up(file) {
    setBusy(true)
    setErr('')
    try {
      onChange(await uploadImage(file, folder))
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }
  const src = value && !value.includes('/') ? `/images/${value}-sm.webp` : img(value, true)
  return (
    <div className="text-sm text-muted">
      {label}
      <div className="mt-1 flex items-center gap-3">
        <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-plum-line bg-plum">
          {value ? <img src={src} alt="" className="h-full w-full object-contain" /> : <span className="text-xs">No photo</span>}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <label className={`btn-ghost min-h-10 cursor-pointer px-4 ${busy ? 'opacity-60' : ''}`}>
            {busy ? 'Uploading…' : 'Upload photo'}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && up(e.target.files[0])} />
          </label>
          <input value={value || ''} onChange={(e) => onChange(e.target.value.trim())} placeholder="…or paste a photo link" className="field w-full rounded-2xl text-xs" />
        </div>
      </div>
      {err && <p className="mt-1 text-xs text-rose-light">{err}</p>}
    </div>
  )
}

/** Several pictures in order (first = main picture) */
export function ImagesField({ value = [], onChange, folder = 'products' }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [url, setUrl] = useState('')
  async function up(files) {
    setBusy(true)
    setErr('')
    try {
      const out = [...value]
      for (const f of files) out.push(await uploadImage(f, folder))
      onChange(out)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }
  const move = (i, d) => {
    const a = [...value]
    ;[a[i], a[i + d]] = [a[i + d], a[i]]
    onChange(a)
  }
  return (
    <div className="text-sm text-muted">
      Photos <span className="text-xs">(first = main photo; transparent PNG/WebP look best)</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((u, i) => (
          <span key={u + i} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-plum-line bg-plum">
            <img src={img(u, true)} alt="" className="h-full w-full object-contain" />
            <span className="absolute inset-x-0 bottom-0 flex justify-between bg-plum/80 px-1">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1 text-cream disabled:opacity-30" aria-label="Move left">‹</button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="px-1 text-rose-light" aria-label="Remove photo"><IconClose className="h-4 w-4" /></button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="px-1 text-cream disabled:opacity-30" aria-label="Move right">›</button>
            </span>
          </span>
        ))}
        <label className={`grid h-24 w-24 cursor-pointer place-items-center rounded-2xl border border-dashed border-gold/50 text-gold hover:bg-gold/10 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          {busy ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" /> : <IconPlus className="h-6 w-6" />}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => e.target.files.length && up([...e.target.files])} aria-label="Upload photos" />
        </label>
      </div>
      <div className="mt-2 flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value.trim())} placeholder="…or paste a photo link" className="field min-w-0 flex-1 rounded-2xl text-xs" />
        <button type="button" disabled={!url} onClick={() => { onChange([...value, url]); setUrl('') }} className="btn-ghost min-h-11 px-4 disabled:opacity-50">Add</button>
      </div>
      {err && <p className="mt-1 text-xs text-rose-light">{err}</p>}
    </div>
  )
}

export const csvCell = (v) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s // stops spreadsheet formulas running from customer text
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function downloadCsv(name, rows) {
  const text = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv' }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
