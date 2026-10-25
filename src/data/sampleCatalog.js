// src/data/sampleCatalog.js — SAMPLE categories and products (prices and weights from the brief).
// This is only for testing. In Phase 4 these move into the online database (Firestore), and from
// Phase 6 you add, edit, hide or delete categories, products, prices and photos in the admin panel.
//
// Product fields:
//   variants: each size/option with retail price, wholesale price (null = not for wholesale) and packed weight in grams
//   type: 'ready-made' or 'custom'      packingType: 'small' | 'combo' | 'big'
//   stock: pieces in stock (ready-made)  makingDays: days to make before dispatch
//   images: photo URLs (local /images/... now, Cloudinary links later)

export const SAMPLE_CATEGORIES = [
  { id: 'c1', slug: 'keychains', name: 'Keychains', line: 'Carry memories', image: '/images/keychain.webp', order: 1, active: true },
  { id: 'c2', slug: 'earrings', name: 'Earrings', line: 'Wear nature', image: '/images/earrings.webp', order: 2, active: true },
  { id: 'c3', slug: 'lockets-chains', name: 'Lockets & Chains', line: 'Close to your heart', image: '/images/locket.webp', order: 3, active: true },
  { id: 'c4', slug: 'bangles', name: 'Bangles', line: 'Grace on your wrist', image: '/images/bangles.webp', order: 4, active: true },
  { id: 'c5', slug: 'combos', name: 'Jewellery Combos', line: 'Perfectly matched', image: '/images/combo.webp', order: 5, active: true },
  { id: 'c6', slug: 'photo-art', name: 'Photo Resin Art', line: 'Your moments', image: '/images/photo-frame.webp', order: 6, active: true },
  { id: 'c7', slug: 'wall-clocks', name: 'Wall Clocks', line: 'Timeless beauty', image: '/images/clock.webp', order: 7, active: true },
  { id: 'c8', slug: 'blood-art', name: 'Blood Art Jewellery', line: 'Truly yours', image: '', order: 8, active: true },
]

const CARE = 'Keep away from direct sunlight, perfume and sharp objects. Wipe gently with a soft, dry cloth. Store in the pouch it comes in.'
const v = (name, price, wholesale, weight) => ({ name, price, wholesale, weight })

export const SAMPLE_PRODUCTS = [
  // ---------- Keychains ----------
  {
    id: 'p101', slug: 'pressed-flower-keychain', name: 'Pressed Flower Keychain', category: 'keychains',
    description: 'Real pressed flowers and gold flakes sealed in crystal-clear resin, finished with a gold-tone ring. A small piece of nature to carry every day.',
    images: ['/images/keychain.webp'], variants: [v('Standard', 99, 50, 50)], colours: ['Pink', 'Lilac', 'White'],
    type: 'ready-made', packingType: 'small', stock: 24, makingDays: 1, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-01',
  },
  {
    id: 'p102', slug: 'name-letter-keychain', name: 'Name / Letter Keychain', category: 'keychains',
    description: 'Your name or initial, surrounded by real flowers and gold flakes. Made to order for you or as a personal gift.',
    images: ['/images/keychain.webp'], variants: [v('With name or letter', 149, 65, 50)], colours: ['Pink', 'Lilac', 'White', 'Blue'],
    type: 'custom', packingType: 'small', stock: 0, makingDays: 4, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-05',
  },
  {
    id: 'p103', slug: 'gold-flake-heart-keychain', name: 'Gold Flake Heart Keychain', category: 'keychains',
    description: 'A heart-shaped resin keychain filled with tiny white blossoms and shimmering gold flakes.',
    images: ['/images/keychain.webp'], variants: [v('Standard', 99, 50, 50)], colours: ['Gold', 'Pink'],
    type: 'ready-made', packingType: 'small', stock: 4, makingDays: 1, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-12',
  },

  // ---------- Earrings ----------
  {
    id: 'p201', slug: 'pressed-flower-drop-earrings', name: 'Pressed Flower Drop Earrings', category: 'earrings',
    description: 'Lightweight round drops with real hydrangea petals and baby’s breath, on gold-tone hooks.',
    images: ['/images/earrings.webp'], variants: [v('Pair', 179, 80, 80)], colours: ['Pink', 'Lilac'],
    type: 'ready-made', packingType: 'small', stock: 18, makingDays: 1, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-02',
  },
  {
    id: 'p202', slug: 'gold-flake-round-earrings', name: 'Gold Flake Round Earrings', category: 'earrings',
    description: 'Clear resin rounds with gold flakes and a single pressed bloom. Simple, light and easy to wear daily.',
    images: ['/images/earrings.webp'], variants: [v('Pair', 179, 80, 80)], colours: ['Gold', 'White'],
    type: 'ready-made', packingType: 'small', stock: 9, makingDays: 1, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-14',
  },

  // ---------- Lockets & chains ----------
  {
    id: 'p301', slug: 'rose-locket-necklace', name: 'Rose Locket Necklace', category: 'lockets-chains',
    description: 'A tiny real rose with baby’s breath and gold flakes, sealed in a round locket on a gold-tone chain.',
    images: ['/images/locket.webp'], variants: [v('With chain', 229, 110, 80)], colours: ['Pink', 'Red'],
    type: 'ready-made', packingType: 'small', stock: 12, makingDays: 1, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-03',
  },
  {
    id: 'p302', slug: 'babys-breath-locket', name: 'Baby’s Breath Locket', category: 'lockets-chains',
    description: 'Soft white baby’s breath flowers floating in a clear locket. Minimal and elegant.',
    images: ['/images/locket.webp'], variants: [v('With chain', 229, 110, 80)], colours: ['White'],
    type: 'ready-made', packingType: 'small', stock: 0, makingDays: 2, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-16',
  },

  // ---------- Bangles ----------
  {
    id: 'p401', slug: 'floral-resin-bangle', name: 'Floral Resin Bangle', category: 'bangles',
    description: 'A crystal-clear bangle filled all around with real flowers and gold flakes.',
    images: ['/images/bangles.webp'], variants: [v('2.4', 279, 140, 120), v('2.6', 279, 140, 120), v('2.8', 279, 140, 120)], colours: ['Pink', 'Lilac', 'White'],
    type: 'ready-made', packingType: 'small', stock: 10, makingDays: 2, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-04',
  },
  {
    id: 'p402', slug: 'gold-flake-bangle', name: 'Gold Flake Bangle', category: 'bangles',
    description: 'Clear resin bangle with a band of gold flakes and tiny blossoms.',
    images: ['/images/bangles.webp'], variants: [v('2.4', 279, 140, 120), v('2.6', 279, 140, 120), v('2.8', 279, 140, 120)], colours: ['Gold'],
    type: 'ready-made', packingType: 'small', stock: 6, makingDays: 2, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-18',
  },

  // ---------- Combos ----------
  {
    id: 'p501', slug: 'earrings-locket-set', name: 'Earrings + Locket Set', category: 'combos',
    description: 'Matching drop earrings and locket, made together from the same flowers so the colours match.',
    images: ['/images/combo.webp', '/images/earrings.webp', '/images/locket.webp'], variants: [v('Earrings + locket', 379, 190, 200)], colours: ['Pink', 'Lilac'],
    type: 'ready-made', packingType: 'combo', stock: 7, makingDays: 2, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-06',
  },
  {
    id: 'p502', slug: 'earrings-locket-bangle-set', name: 'Earrings + Locket + Bangle Set', category: 'combos',
    description: 'The full matching set: drop earrings, locket and bangle with the same real flowers and gold flakes.',
    images: ['/images/combo.webp', '/images/bangles.webp'], variants: [v('Full set', 599, 320, 200)], colours: ['Pink', 'Lilac'],
    type: 'ready-made', packingType: 'combo', stock: 3, makingDays: 3, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-08',
  },

  // ---------- Photo resin art ----------
  {
    id: 'p601', slug: 'custom-photo-resin-frame', name: 'Custom Photo Resin Frame', category: 'photo-art',
    description: 'Your favourite photo framed by real flowers and gold flakes in a thick resin block. Send us your photo after ordering.',
    images: ['/images/photo-frame.webp'], variants: [v('6 inch', 499, 280, 400), v('8 inch', 799, 450, 800), v('10 inch', 1199, 650, 1200), v('12 inch', 1599, 900, 1800)], colours: ['Pink & gold', 'Lilac & gold', 'White & gold'],
    type: 'custom', packingType: 'big', stock: 0, makingDays: 7, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-07',
  },
  {
    id: 'p602', slug: 'round-family-photo-frame', name: 'Round Family Photo Frame', category: 'photo-art',
    description: 'A round resin frame with your family photo in the centre and a ring of pressed flowers.',
    images: ['/images/clock.webp'], variants: [v('8 inch', 799, 450, 800), v('10 inch', 1199, 650, 1200), v('12 inch', 1599, 900, 1800)], colours: ['Pink & gold', 'White & gold'],
    type: 'custom', packingType: 'big', stock: 0, makingDays: 7, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-15',
  },

  // ---------- Wall clocks ----------
  {
    id: 'p701', slug: 'photo-preserved-wall-clock', name: 'Photo-Preserved Wall Clock', category: 'wall-clocks',
    description: 'A 12 inch wall clock with your photo in the centre, surrounded by real flowers, gold flakes and gold hour markers.',
    images: ['/images/clock.webp'], variants: [v('12 inch', 2299, 1350, 1800)], colours: ['Pink & gold', 'White & gold'],
    type: 'custom', packingType: 'big', stock: 0, makingDays: 10, featured: true, wholesaleAllowed: true, active: true, createdAt: '2026-10-09',
  },
  {
    id: 'p702', slug: 'floral-resin-wall-clock', name: 'Floral Resin Wall Clock', category: 'wall-clocks',
    description: 'A 12 inch resin wall clock with pressed flowers and gold flakes, ready to hang.',
    images: ['/images/clock.webp'], variants: [v('12 inch', 1999, 1200, 1800)], colours: ['Pink & gold'],
    type: 'ready-made', packingType: 'big', stock: 2, makingDays: 2, featured: false, wholesaleAllowed: true, active: true, createdAt: '2026-10-17',
  },

  // ---------- Blood art (custom only, no wholesale) ----------
  {
    id: 'p801', slug: 'blood-art-earrings', name: 'Blood Art Earrings', category: 'blood-art',
    description: 'A pair of earrings made with a dried blood sample you post to us. Samples are handled with gloves and used only for your order.',
    images: [], variants: [v('Pair', 499, null, 80)], colours: ['Red & gold', 'Clear'],
    type: 'custom', packingType: 'small', stock: 0, makingDays: 10, featured: false, wholesaleAllowed: false, active: true, createdAt: '2026-10-10',
  },
  {
    id: 'p802', slug: 'blood-art-locket', name: 'Blood Art Locket', category: 'blood-art',
    description: 'A locket with chain, made with a dried blood sample you post to us. Samples are handled with gloves and used only for your order.',
    images: [], variants: [v('With chain', 599, null, 80)], colours: ['Red & gold', 'Clear'],
    type: 'custom', packingType: 'small', stock: 0, makingDays: 10, featured: false, wholesaleAllowed: false, active: true, createdAt: '2026-10-10',
  },
  {
    id: 'p803', slug: 'blood-art-bangle', name: 'Blood Art Bangle', category: 'blood-art',
    description: 'A bangle made with a dried blood sample you post to us. Samples are handled with gloves and used only for your order.',
    images: [], variants: [v('2.4', 699, null, 120), v('2.6', 699, null, 120), v('2.8', 699, null, 120)], colours: ['Red & gold', 'Clear'],
    type: 'custom', packingType: 'small', stock: 0, makingDays: 10, featured: false, wholesaleAllowed: false, active: true, createdAt: '2026-10-11',
  },
  {
    id: 'p804', slug: 'blood-art-combo', name: 'Blood Art Combo', category: 'blood-art',
    description: 'A matching blood art set made together from your sample. Samples are handled with gloves and used only for your order.',
    images: [], variants: [v('Locket + earrings', 999, null, 200), v('Locket + earrings + bangle', 1499, null, 200)], colours: ['Red & gold', 'Clear'],
    type: 'custom', packingType: 'combo', stock: 0, makingDays: 12, featured: false, wholesaleAllowed: false, active: true, createdAt: '2026-10-11',
  },
]
