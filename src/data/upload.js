// src/data/upload.js — photo uploads to Cloudinary (free plan): product photos from the admin panel,
// and customers' photos for custom orders / payment screenshots.
// Set up once in Admin → Settings → Photos: your Cloudinary "cloud name" and an UNSIGNED upload preset.
import { loadSettings } from './settings.js'

export async function uploadsReady() {
  const s = await loadSettings()
  return !!(s.cloudinary?.cloudName && s.cloudinary?.uploadPreset)
}

// Big phone photos are made smaller before uploading (much faster on mobile data). Transparency is kept.
async function shrink(file, max = 2000) {
  try {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    if (scale === 1 && file.size < 1.5e6) return file
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.88))
    return blob || file
  } catch {
    return file
  }
}

/** Uploads one image and returns its web address. folder: 'products', 'custom-orders', 'payments', 'site' … */
export async function uploadImage(file, folder = 'site') {
  if (!file) throw new Error('No file chosen.')
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo (JPG, PNG or WebP).')
  if (file.size > 15e6) throw new Error('This photo is too large (max 15 MB).')
  const s = await loadSettings()
  const { cloudName, uploadPreset } = s.cloudinary || {}
  if (!cloudName || !uploadPreset) throw new Error('Photo upload is not set up yet (Admin → Settings → Photos).')
  const body = new FormData()
  body.append('file', await shrink(file))
  body.append('upload_preset', uploadPreset)
  body.append('folder', `inviname/${folder}`)
  const r = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.secure_url) throw new Error(j.error?.message || 'Upload failed. Please try again.')
  return j.secure_url
}
