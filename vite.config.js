import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Who-wants-to-be-a-millionaire/',
  plugins: [react(), tailwindcss()],
})