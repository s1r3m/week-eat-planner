<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'
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
