// src/config/site.js — brand details used across the site.
// Instagram link, contact email, UPI details and addresses come from the admin Settings page later (Phase 6).
export const SITE = {
  name: 'Inviname Arts',
  tagline: 'Resin · Art · Memories',
  domain: 'inviname.in',
  whatsapp: '919390635033', // country code + number, no + or spaces
  phoneDisplay: '93906 35033',
  shipsFrom: 'Pothavaram, Andhra Pradesh',
}

export const waLink = (text = 'Hi Inviname Arts, I would like to know more about your resin art.') =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`

// Categories and products live in src/data (the catalog), so the admin panel can edit them.

// Main navigation (`end: true` = only highlighted on exactly that page, needed for Home "/")
export const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/about', label: 'About' },
]
