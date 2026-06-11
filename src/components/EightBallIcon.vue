<template>
  <svg
    class="eight-ball-icon"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <!-- Same sheen treatment as BallBadge / the Leagues rack -->
      <radialGradient id="eight-ball-sheen" cx="0.32" cy="0.26" r="0.9">
        <stop offset="0" stop-color="#fff" stop-opacity="0.75" />
        <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
      </radialGradient>
    </defs>
    <!-- Black ball -->
    <circle cx="16" cy="16" r="15" fill="#111" />
    <!-- Specular highlight so the silhouette reads on dark surfaces -->
    <circle cx="16" cy="16" r="15" fill="url(#eight-ball-sheen)" />
    <!-- White circle -->
    <circle cx="16" cy="16" r="8" fill="white" />
    <!-- Number 8 -->
    <text
      x="16"
      y="20.5"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      font-size="10"
      font-weight="bold"
      fill="#111"
    >8</text>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: string | number }>(), { size: '1em' })
</script>

<style scoped>
.eight-ball-icon {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: -0.05em;
}
</style>
