<script setup lang="ts">
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'
import BottomTabBar from './components/BottomTabBar.vue'
</script>

<template>
  <!-- Bottom padding keeps content clear of the fixed mobile tab bar -->
  <div class="min-h-screen bg-surface flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
    <AppNav />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <BottomTabBar />
  </div>
</template>
