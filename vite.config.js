// vite.config.js
import { defineConfig } from 'vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// After the build, dist/admin/index.html is a copy of the site whose "install app" button installs
// "Inviname Admin" (opens straight to the admin panel) instead of the customer app.
const adminApp = {
  name: 'inviname-admin-app',
  apply: 'build',
  closeBundle() {
    const html = readFileSync('dist/index.html', 'utf8')
      .replace('/manifest.webmanifest', '/admin.webmanifest')
      .replace(/<title>[^<]*<\/title>/, '<title>Inviname Admin</title>')
      .replace('<meta name="description"', '<meta name="robots" content="noindex" />\n    <meta name="description"')
    mkdirSync('dist/admin', { recursive: true })
    writeFileSync('dist/admin/index.html', html)
  },
}

// React + Tailwind CSS v4 (the @tailwindcss/vite plugin reads src/index.css)
export default defineConfig({
  plugins: [react(), tailwindcss(), adminApp],
  server: { host: true }, // lets you open the site on your phone over Wi-Fi
})
