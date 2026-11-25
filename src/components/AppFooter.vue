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
  <footer class="bg-raised border-t border-line mt-12">
    <!-- Decorative rack of balls -->
    <div class="flex justify-center gap-1.5 pt-3" aria-hidden="true">
      <span class="h-2 w-2 rounded-full bg-ball-yellow" />
      <span class="h-2 w-2 rounded-full bg-ball-blue" />
      <span class="h-2 w-2 rounded-full bg-ball-red" />
      <span class="h-2 w-2 rounded-full bg-ball-black" />
      <span class="h-2 w-2 rounded-full bg-ball-orange" />
      <span class="h-2 w-2 rounded-full bg-ball-green" />
    </div>
    <div class="max-w-3xl mx-auto px-4 py-5 text-xs text-muted space-y-2">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span class="font-medium text-ink">© 2026 Fylde 8 Ball</span>
        <span>Last updated: {{ lastUpdated }}</span>
      </div>
      <div class="space-y-1 border-t border-line pt-2">
        <p>Data provided for informational purposes only. Please verify details with the respective organisers.</p>
        <p>Tournament logos and names are property of their respective companies and/or organisations.</p>
      </div>
    </div>
  </footer>
</template>
