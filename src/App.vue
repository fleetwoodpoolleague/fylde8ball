<script setup lang="ts">
import AppNav from './components/AppNav.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNav />
    <main>
      <RouterView />
    </main>
  </div>
</template>
