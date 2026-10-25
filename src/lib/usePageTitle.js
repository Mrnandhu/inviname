// src/lib/usePageTitle.js — sets the browser tab title, the Google description and the sharing title per page
import { useEffect } from 'react'

const DEFAULT_DESC = 'Handmade resin keychains, earrings, lockets, bangles, photo resin art and wall clocks with real flowers. Made in Pothavaram, Andhra Pradesh. Delivery across AP and Telangana.'

function meta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export default function usePageTitle(title, description) {
  useEffect(() => {
    const t = title ? `${title} | Inviname Arts` : 'Inviname Arts | Handmade Resin Art with Real Flowers'
    document.title = t
    meta('name', 'description', description || DEFAULT_DESC)
    meta('property', 'og:title', t)
    meta('property', 'og:description', description || DEFAULT_DESC)
  }, [title, description])
}
