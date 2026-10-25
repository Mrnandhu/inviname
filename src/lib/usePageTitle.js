// src/lib/usePageTitle.js — sets the browser tab title (and Google's title) for each page
import { useEffect } from 'react'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Inviname Arts` : 'Inviname Arts | Resin · Art · Memories'
  }, [title])
}
