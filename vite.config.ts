import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "fylde8ball",
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
