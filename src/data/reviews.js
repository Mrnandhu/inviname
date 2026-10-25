// src/data/reviews.js — customer reviews shown on the home page. Only the admin adds them
// (Admin → Reviews), so every review on the site is a real one you chose to show.
import { fb } from '../firebase/index.js'
import { createStore } from '../lib/store.js'

const store = createStore(async () => {
  try {
    const f = await fb()
    if (!f) return []
    const snap = await f.F.getDocs(f.F.query(f.F.collection(f.db, 'reviews'), f.F.where('active', '==', true)))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  } catch {
    return []
  }
}, [])

export const useReviews = store.use
export const refreshReviews = store.refresh
