import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel deploys to the root, so we use '/' as the base path.
  base: '/',
  define: {
    // Per instructions, the app must use process.env.API_KEY.
    // This makes the build-time environment variable available in the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
