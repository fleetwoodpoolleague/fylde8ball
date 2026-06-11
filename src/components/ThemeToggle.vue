<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import SunIcon from './icons/SunIcon.vue'
import MoonIcon from './icons/MoonIcon.vue'

const { toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:text-ink hover:bg-sunken transition-colors"
    aria-label="Toggle colour theme"
    @click="toggle()"
  >
    <SunIcon class="icon-sun" size="1.2em" />
    <MoonIcon class="icon-moon" size="1.2em" />
  </button>
</template>

<!--
  Unscoped on purpose: visibility is keyed off html[data-theme] so the
  SSG-rendered markup is identical in both themes (both icons present, CSS
  decides) — no hydration mismatch, no pre-paint icon flicker.
-->
<style>
.theme-toggle .icon-sun {
  display: none;
}
[data-theme='dark'] .theme-toggle .icon-sun {
  display: inline-block;
}
[data-theme='dark'] .theme-toggle .icon-moon {
  display: none;
}
</style>
