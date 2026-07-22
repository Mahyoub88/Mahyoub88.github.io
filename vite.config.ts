import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// VITE_BASE lets deploy targets that live under a subpath (e.g. GitHub Pages
// project sites at https://user.github.io/repo/) override the default root
// base used by Netlify/Vercel/custom domains.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
