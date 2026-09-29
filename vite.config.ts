import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Express backend (backend/) listens here. The browser only ever talks to
// the Vite origin, so `/api` is forwarded and no CORS setup is needed.
const api = { '/api': 'http://localhost:3001' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
})
