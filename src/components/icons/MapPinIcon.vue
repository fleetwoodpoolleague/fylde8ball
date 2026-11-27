<template>
  <svg
    class="map-pin-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: string | number }>(), { size: '1em' })
</script>

<style scoped>
.map-pin-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
