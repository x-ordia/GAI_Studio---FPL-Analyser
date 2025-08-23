import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: The base path should match your repository name on GitHub.
  base: '/fpl-ai-ranker/',
})
