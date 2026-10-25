// src/data/content.js — every text and picture on the website that the admin panel can change
// (Admin → Website): the home 3D story, home sections, About / Custom orders / Wholesale / Contact pages,
// the policy pages, the footer line and an optional announcement bar.
// Saved in Firestore "content/site"; anything not saved there uses these defaults.
//
// Page text format (used in the admin text boxes):
//   blank line = new paragraph · a line starting with "## " = heading · a line starting with "- " = bullet point
import { fb } from '../firebase/index.js'
import { createStore } from '../lib/store.js'
import { STORY } from '../config/story.js'

export const DEFAULT_CONTENT = {
  announcement: { text: '', link: '' },
  story: STORY,
  home: {
    categories: { label: 'Find your piece', title: 'Shop by Category' },
    best: { label: 'Most loved', title: 'Best Sellers' },
    reviews: { label: 'Kind words', title: 'Loved by our customers' },
    trust: [
      { title: '100% Handmade', text: 'Crafted with love' },
      { title: 'Real Flowers', text: 'Preserved forever' },
      { title: 'Custom Orders', text: 'Made just for you' },
      { title: 'Unique Designs', text: 'No two pieces alike' },
    ],
    custom: {
      label: 'Made just for you',
      title: 'Custom & Blood Art Orders',
      text: 'Send your photo, flowers or idea. We start with a 50% advance and you pay the rest when your piece is ready to dispatch.',
      cta: 'Start Your Order',
    },
    wholesale: {
      label: 'For shops & events',
      title: 'Wholesale',
      text: 'Minimum 50 pieces. Get 5% off on orders of 100 pieces or more.',
      cta: 'Apply for Wholesale',
    },
  },
  footer: { tagline: 'Handcrafted resin art with real flowers, made to keep your most treasured moments.' },
  pages: {
    about: {
      title: 'Our Story',
      intro: 'Inviname Arts is a small handmade resin art studio in Pothavaram, Andhra Pradesh.',
      body: `Every piece starts with real flowers, pressed and dried by hand, then sealed in crystal-clear resin with gold flakes so they last for years.

## What we make
- Keychains, earrings, lockets, bangles and matching sets
- Photo resin art and photo wall clocks with your own pictures
- Blood art jewellery, made with care for your most personal memories

## Why handmade
No two pieces are exactly alike. Each one is poured, cured and polished by hand, so small differences in flowers and flakes are part of its charm.`,
    },
    customOrders: {
      title: 'Custom Orders',
      intro: 'Your photo, your flowers, your words — made into a piece that lasts.',
      body: `## How it works
- Choose a custom piece and add your photo, names, date and colour wishes
- Pay 50% advance to start; we confirm the details with you on WhatsApp
- We make your piece (usually 7–12 days) and send you a photo
- Pay the remaining 50% when it is ready to dispatch

## Blood art
For blood art jewellery you post us a small dried sample. After ordering we show you exactly how to prepare and send it. Samples are handled with gloves and used only for your order.`,
    },
    wholesale: {
      title: 'Wholesale',
      intro: 'Resin pieces for gift shops, boutiques and events.',
      body: `- Minimum 50 pieces per order
- Mix up to 5 designs in one order
- Extra 5% off on 100 pieces or more
- Ready-made products only (no custom or blood art)
- 50% advance, the rest before dispatch
- Delivery charged by weight, or pick up from Pothavaram

Apply below. Once we approve your shop, wholesale prices appear in your cart.`,
    },
    contact: {
      title: 'Contact Us',
      intro: 'The fastest way to reach us is WhatsApp. We usually reply within a few hours.',
      hours: 'Monday – Saturday, 10 am – 7 pm',
    },
  },
  policies: {
    shipping: {
      title: 'Shipping Policy',
      body: `## Where we deliver
We currently deliver to Andhra Pradesh and Telangana. You can also pick up your order from Pothavaram.

## Charges
Delivery and packing are shown as one line in your cart before you pay. They depend on your pincode and the weight of your parcel. Some areas get free delivery above a minimum order value, as shown in the cart.

## Dispatch time
- Ready-made pieces: usually 1–3 days after payment is confirmed
- Custom and blood art pieces: after making (7–12 days) and the balance payment

## Tracking
When your parcel is shipped, the tracking number appears in My Orders.

This is a first draft — please review it to match how you work.`,
    },
    returns: {
      title: 'Returns & Replacement',
      body: `## Damaged in transit
If your piece arrives broken or damaged, message us on WhatsApp within 48 hours of delivery with an unboxing video or clear photos. We will replace it or refund it.

## Custom and blood art pieces
These are made only for you, so they cannot be returned or exchanged unless they arrive damaged.

## Handmade differences
Small bubbles, flower placement and colour differences are part of handmade resin art and are not defects.

## Cancellations
Ready-made orders can be cancelled before dispatch. Custom orders cannot be cancelled once making has started.

This is a first draft — please review it to match how you work.`,
    },
    privacy: {
      title: 'Privacy Policy',
      body: `## What we collect
Your name, email, phone number and delivery address when you order, and the photos or details you share for custom pieces.

## How we use it
Only to make, deliver and support your order, and to reply to you. We never sell your information.

## Payments
You pay by UPI in your own payment app. We only store the transaction reference (UTR) you give us, not your bank details.

## Your choices
You can ask us to delete your account and order history at any time on WhatsApp or by email.

This is a first draft — please review it to match how you work.`,
    },
    terms: {
      title: 'Terms of Service',
      body: `## Orders
An order is confirmed when we verify your payment. Prices and availability can change without notice.

## Custom work
For custom pieces you confirm that you have the right to use the photos you send. We may decline designs we cannot make well.

## Liability
Resin pieces should be kept away from heat, direct sunlight and chemicals. We are not responsible for damage from misuse.

This is a first draft — please review it to match how you work.`,
    },
  },
}

// saved values on top of the defaults (two levels deep, so a partly saved section keeps the other defaults)
function merge(def, saved) {
  if (saved === undefined || saved === null) return def
  if (Array.isArray(def) || typeof def !== 'object' || def === null) return saved
  const out = { ...def }
  for (const k of Object.keys(saved)) out[k] = merge(def[k], saved[k])
  return out
}

const store = createStore(async () => {
  let saved = null
  try {
    const f = await fb()
    if (f) {
      const snap = await f.F.getDoc(f.F.doc(f.db, 'content', 'site'))
      saved = snap.exists() ? snap.data() : null
    }
  } catch {
    /* use defaults */
  }
  const c = merge(DEFAULT_CONTENT, saved || {})
  // story scenes: keep each scene's built-in motion settings even if older saved data lacks them
  c.story = (Array.isArray(saved?.story) ? saved.story : STORY).map((sc) => ({ ...(STORY.find((d) => d.id === sc.id) || {}), ...sc }))
  return c
}, DEFAULT_CONTENT)

export const loadContent = store.load
export const refreshContent = store.refresh
/** React hook: the website content (defaults straight away, saved texts as soon as they load). */
export const useContent = store.use
/** true once the saved content has been loaded */
export const contentLoaded = () => !!store.get()
