<script setup lang="ts">
const raw = import.meta.env.VITE_BUILD_TIME

const lastUpdated = (() => {
  if (!raw) return 'Development build'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return 'Development build'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
})()
</script>

<template>
  <footer class="bg-white border-t border-gray-200 mt-12">
    <div class="max-w-3xl mx-auto px-4 py-4 text-xs text-gray-400 flex flex-col gap-1 sm:flex-row sm:justify-between">
      <span>© 2026 Fylde 8 Ball</span>
      <span>Last updated: {{ lastUpdated }}</span>
      <span>Tournament logos and names are property of their respective companies and/or organisations</span>
    </div>
  </footer>
</template>
