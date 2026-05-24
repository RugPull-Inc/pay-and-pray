import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')

  return {
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL ?? 'http://localhost:8080'
      ),
    },
  }
})
