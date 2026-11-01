// src/lib/safeUrl.js — only safe links are ever opened or shown.
// Anything customers or settings can type (photo links, Instagram, tracking link) passes through here,
// so a "javascript:" link or an image from an unknown site can never run in a visitor's or the admin's browser.

/** Returns the link if it is https:// (and, when `hosts` is given, on one of those sites); otherwise ''. */
export function safeUrl(url, hosts) {
  try {
    const u = new URL(String(url || '').trim())
    if (u.protocol !== 'https:') return ''
    if (hosts && !hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) return ''
    return u.href
  } catch {
    return ''
  }
}

/** Customer photos and payment screenshots: only images uploaded to Cloudinary. */
export const safePhoto = (url) => safeUrl(url, ['res.cloudinary.com'])

/** Links shown on the contact page: https, email or phone links only. */
export function safeHref(href) {
  const h = String(href || '').trim()
  if (/^(mailto:|tel:)/i.test(h)) return h
  if (h.startsWith('/') && !h.startsWith('//')) return h
  return safeUrl(h)
}
