// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { glob } from 'glob'

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        glob.sync('./**/*.html', { ignore: './node_modules/**' })
          .map(file => [file, resolve(__dirname, file)])
      ),
    },
  },
})