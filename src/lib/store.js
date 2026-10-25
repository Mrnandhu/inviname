// src/lib/store.js — a small "live data" helper for things loaded once from the database
// (catalog, settings, website content). Every page using it updates when the admin saves changes.
import { useEffect, useSyncExternalStore } from 'react'

export function createStore(loader, initial = null) {
  let value = null
  let loading = null
  const subs = new Set()
  const set = (v) => {
    value = v
    subs.forEach((f) => f())
    return v
  }
  const load = () => {
    if (value) return Promise.resolve(value)
    loading ||= loader().then(set)
    return loading
  }
  // load again (after the admin saves) — the old data stays on screen until the new data arrives
  const refresh = () => (loading = loader().then(set))
  const subscribe = (fn) => {
    subs.add(fn)
    return () => subs.delete(fn)
  }
  function use() {
    const v = useSyncExternalStore(subscribe, () => value, () => value)
    useEffect(() => {
      load()
    }, [])
    return v ?? initial
  }
  return { load, refresh, use, get: () => value }
}
