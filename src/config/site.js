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

// The 8 product categories (slug is used in URLs like /shop?category=keychains)
export const CATEGORIES = [
  { slug: 'keychains', name: 'Keychains', line: 'Carry memories' },
  { slug: 'earrings', name: 'Earrings', line: 'Wear nature' },
  { slug: 'lockets-chains', name: 'Lockets & Chains', line: 'Close to your heart' },
  { slug: 'bangles', name: 'Bangles', line: 'Everyday elegance' },
  { slug: 'combos', name: 'Jewellery Combos', line: 'Perfect together' },
  { slug: 'photo-art', name: 'Photo Resin Art', line: 'Your moments' },
  { slug: 'wall-clocks', name: 'Wall Clocks', line: 'Timeless beauty' },
  { slug: 'blood-art', name: 'Blood Art Jewellery', line: 'Truly yours' },
]

// Main navigation (`end: true` = only highlighted on exactly that page, needed for Home "/")
export const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/about', label: 'About' },
]
