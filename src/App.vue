<script setup lang="ts">
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'
import BottomTabBar from './components/BottomTabBar.vue'
</script>

<template>
  <!-- Bottom padding keeps content clear of the fixed mobile tab bar -->
  <div class="min-h-screen bg-surface flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:text-accent-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
    >
      Skip to main content
    </a>
    <AppNav />
    <main id="main-content" class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <BottomTabBar />
  </div>
</template>
