import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      importProtection: {
        behavior: 'error',
        include: ['src/**', '../../packages/*/src/**'],
        client: {
          files: ['**/*.server.*', '**/server/**', '**/env/server.ts'],
          specifiers: ['@workspace/db', '@workspace/db/*', '@workspace/auth/server'],
        },
      },
    }),
    react(),
    nitro({ defaultPreset: 'node-server' }),
  ],
})
