// src/components/WhatsAppButton.jsx — floating WhatsApp chat button on every page
import { IconWhatsApp } from './Icons.jsx'
import { waLink } from '../config/site.js'

export default function WhatsAppButton() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgb(37_211_102_/_0.7)] transition hover:scale-105"
      aria-label="Chat with us on WhatsApp"
    >
      <IconWhatsApp className="h-7 w-7" />
    </a>
  )
}
