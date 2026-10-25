// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// React + Tailwind CSS v4 (the @tailwindcss/vite plugin reads src/index.css)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true }, // lets you open the site on your phone over Wi-Fi
})
