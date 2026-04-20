import { ViteSSG } from 'vite-ssg'
import { routes } from './router'
import App from './App.vue'
import './assets/main.css'

export const createApp = ViteSSG(App, { routes })
