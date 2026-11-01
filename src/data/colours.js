// src/data/colours.js — the colour palette for products (Admin → Products → Colours) and the swatches
// customers see on product pages and in the shop filters. "Pink & gold" shows as a two-colour swatch.
export const COLOURS = [
  ['Pink', '#f2a7ba'], ['Baby pink', '#f8c8d4'], ['Rose', '#e07a8f'], ['Peach', '#f6b99b'], ['Coral', '#f08a74'],
  ['Red', '#b8323f'], ['Maroon', '#6e1f2b'], ['Orange', '#e8893a'], ['Yellow', '#f2d36b'], ['Mustard', '#d4a520'],
  ['Gold', '#d4a857'], ['Rose gold', '#c98f7d'], ['Champagne', '#e8d3a8'], ['Cream', '#f3e6cf'], ['White', '#f6efe6'],
  ['Clear', 'rgba(255,255,255,0.15)'], ['Silver', '#c0c4c8'], ['Grey', '#8c8f94'], ['Black', '#222326'], ['Brown', '#7a4b33'],
  ['Lilac', '#c7a6e6'], ['Lavender', '#b9a6e0'], ['Purple', '#7d4fa8'], ['Blue', '#8fb3e6'], ['Sky blue', '#a9d6f2'],
  ['Navy', '#23345e'], ['Teal', '#2c8c8a'], ['Turquoise', '#45c4c0'], ['Mint', '#a8e0c4'], ['Green', '#4f9a5a'],
  ['Olive', '#7d8a3a'], ['Multicolour', 'conic-gradient(#f2a7ba, #f2d36b, #a8e0c4, #8fb3e6, #c7a6e6, #f2a7ba)'],
]
export const COMBOS = ['Pink & gold', 'White & gold', 'Rose & gold', 'Clear & gold', 'Lilac & gold', 'Blue & silver', 'Black & gold', 'Pink & white']

const MAP = Object.fromEntries(COLOURS.map(([n, c]) => [n.toLowerCase(), c]))
const solid = (c) => (c.startsWith('conic') ? '#c7a6e6' : c)

/** CSS background for a colour name; unknown names get a soft grey. */
export function swatch(name = '') {
  const parts = String(name).toLowerCase().split('&').map((s) => MAP[s.trim()] || '#b9a9a5')
  return parts.length > 1 ? `linear-gradient(135deg, ${solid(parts[0])} 50%, ${solid(parts[1])} 50%)` : parts[0]
}
