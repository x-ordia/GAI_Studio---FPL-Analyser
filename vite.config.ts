import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel deploys to the root, so we use '/' as the base path.
  base: '/',
  define: {
    // WARNING: Storing API keys in source code is a security risk.
    // It is recommended to use environment variables for production deployments.
    'process.env.API_KEY': JSON.stringify('AIzaSyBcjKt2Z40SgpUXS9qcycvy7tuBZBxEp3s')
  }
})
