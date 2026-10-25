// src/components/Icons.jsx — small line icons (gold by default through `currentColor`)
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const make = (paths) =>
  function Icon(props) {
    return <svg {...base} {...props}>{paths}</svg>
  }

export const IconFlower = make(
  <>
    <path d="M12 21v-8" />
    <path d="M12 11c-1.6-3-1.6-5.6 0-8 1.6 2.4 1.6 5 0 8z" />
    <path d="M12 12c-3-1.6-5.4-1.2-7 .4 2 1.8 4.4 2 7-.4z" />
    <path d="M12 12c3-1.6 5.4-1.2 7 .4-2 1.8-4.4 2-7-.4z" />
    <path d="M12 17.5c-2-.8-3.8-.4-5 1 1.6 1.2 3.4 1 5-1z" />
    <path d="M12 17.5c2-.8 3.8-.4 5 1-1.6 1.2-3.4 1-5-1z" />
  </>,
)
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const IconCart = make(<><path d="M3 4h2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.2L21 8H6.2" /><circle cx="9.5" cy="20" r="1.2" /><circle cx="17.5" cy="20" r="1.2" /></>)
export const IconUser = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>)
export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h16" />)
export const IconClose = make(<path d="M6 6l12 12M18 6 6 18" />)
export const IconArrow = make(<path d="M5 12h14m-6-6 6 6-6 6" />)
export const IconPin = make(<><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>)
export const IconInstagram = make(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></>)
export const IconWhatsApp = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
  </svg>
)
