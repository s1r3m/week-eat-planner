<template>
  <div id="app">
    <TheHeader />
    <div class="content">
      <router-view />
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'
</script>
