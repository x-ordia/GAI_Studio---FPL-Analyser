import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: The base path should match your repository name on GitHub.
  base: '/fpl-ai-ranker/',
  define: {
    // Per instructions, the app must use process.env.API_KEY.
    // This makes the build-time environment variable available in the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
