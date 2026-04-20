import { config } from '@vue/test-utils'
import { createHeadCore } from '@unhead/vue'

// @unhead/vue v2 uses the string "usehead" as its injection key
const head = createHeadCore()

config.global.plugins = [
  {
    install(app) {
      app.provide('usehead', head)
    },
  },
]
