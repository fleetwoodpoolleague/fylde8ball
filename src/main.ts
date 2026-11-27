import { ViteSSG } from 'vite-ssg'
import { routes } from './router'
import App from './App.vue'
import './assets/main.css'

export const createApp = ViteSSG(App, { routes }, ({ isClient }) => {
  if (isClient && import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore registration failures (e.g. private browsing or unsupported context)
      })
    })
  }
})
