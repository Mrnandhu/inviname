// src/config/story.js — the 10 scenes of the home page 3D story (text, links and images).
// Change the words here; the 3D scene and the text panels follow this list.
// img: file name in public/images (phones load the "-sm" version automatically)
// motion: how the piece moves — cube | swing | earrings | turn | spin | locket | float | clock | finale | burst
// pivot: where a hanging piece is held (0–1 across, 0–1 up the image)
// size: optional, makes one piece a little bigger or smaller (1 = normal)
// These are the DEFAULTS. The admin panel (Admin → Website → Home 3D story) can change every text, link and photo,
// and hide scenes; saved changes live in the database (content/site).

export const STORY = [
  {
    id: 'cube',
    motion: 'cube',
    img: 'rose',
    label: 'Real flowers · Timeless art',
    title: 'Preserve Your Moments',
    accent: 'Forever',
    text: 'Handcrafted resin art that captures real flowers, real emotions and your most treasured moments.',
    cta: 'Explore Collection',
    to: '/shop',
    cta2: { label: 'Custom Orders', to: '/custom-orders' },
  },
  {
    id: 'burst',
    motion: 'burst',
    caption: 'Real petals. Real gold. Sealed forever.',
  },
  {
    id: 'keychain',
    motion: 'swing',
    img: 'keychain',
    pivot: [0.19, 0.97],
    size: 1.12,
    label: 'Carry memories everyday',
    title: 'Photo Keychains',
    text: 'Your favourite photo and real flowers, carried with you every day.',
    cta: 'Shop Keychains',
    to: '/shop?category=keychains',
  },
  {
    id: 'earrings',
    motion: 'earrings',
    img: 'earrings',
    pivotL: [0.21, 0.93],
    pivotR: [0.775, 0.92],
    label: 'Wear nature · Feel unique',
    title: 'Earrings',
    text: 'Lightweight, handcrafted with real flowers.',
    cta: 'Shop Earrings',
    to: '/shop?category=earrings',
  },
  {
    id: 'photo-frame',
    motion: 'turn',
    img: 'photo-frame',
    size: 0.9,
    label: 'Your photo · Our art',
    title: 'Your Photo, Preserved',
    accent: 'Forever',
    text: 'Turn your special moments into handcrafted resin art that lasts a lifetime. 6, 8, 10 and 12 inch.',
    cta: 'Create Your Own',
    to: '/custom-orders',
  },
  {
    id: 'clock',
    motion: 'clock',
    img: 'clock',
    label: "More than time · It's a story",
    title: 'Photo Wall Clocks',
    text: 'Your memories, on your wall, every moment.',
    cta: 'Shop Clocks',
    to: '/shop?category=wall-clocks',
  },
  {
    id: 'bangles',
    motion: 'spin',
    img: 'bangles',
    label: 'Grace on your wrist',
    title: 'Bangles',
    text: 'Real flowers sealed in crystal-clear resin.',
    cta: 'Shop Bangles',
    to: '/shop?category=bangles',
  },
  {
    id: 'locket',
    motion: 'locket',
    img: 'locket',
    pivot: [0.5, 1.02],
    label: 'Close to your heart',
    title: 'Lockets',
    text: 'A tiny rose to keep close, always.',
    cta: 'Shop Lockets',
    to: '/shop?category=lockets-chains',
  },
  {
    id: 'combo',
    motion: 'float',
    img: 'combo',
    label: 'Perfectly matched',
    title: 'Jewellery',
    accent: 'Combos',
    text: 'Bangle, earrings and locket – a matching set made together.',
    cta: 'Shop Combos',
    to: '/shop?category=combos',
  },
  {
    id: 'finale',
    motion: 'finale',
    label: 'Handcrafted · Meaningful · Forever',
    title: 'Art That Lives On',
    cta: 'Shop All',
    to: '/shop',
  },
]

/** Image URL for a scene; phones get the smaller file. Accepts a file name ('rose') or a full photo URL (from the admin panel). */
export function storyImage(name, small) {
  if (!name) return ''
  if (name.includes('/')) {
    if (name.includes('res.cloudinary.com/') && name.includes('/upload/')) return name.replace('/upload/', `/upload/f_auto,q_auto,w_${small ? 600 : 1200}/`)
    return name
  }
  return `/images/${name}${small ? '-sm' : ''}.webp`
}
