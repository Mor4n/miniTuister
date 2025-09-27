import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost', // permite acceso desde tu LAN
    port: 5173,      // puedes usar cualquier puerto que prefieras
    strictPort: true // evita que Vite cambie automáticamente de puerto
  }
})
