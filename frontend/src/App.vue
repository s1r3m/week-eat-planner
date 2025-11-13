<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
</script>

<template>
  <div id="app">
    <TheHeader />
    <Suspense>
      <router-view />
      <template #fallback>
        <div><p>Loading...</p></div>
      </template>
    </Suspense>
    <TheFooter />
  </div>
</template>
