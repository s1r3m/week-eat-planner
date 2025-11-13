<script setup lang="ts">
import { ref } from 'vue'

const photos = ref([
  {id: 'photo-2', src: new URL('@/assets/photo2.jpg', import.meta.url).href},
  {id: 'photo-3', src: new URL('@/assets/photo3.jpg', import.meta.url).href},
  {id: 'photo-4', src: new URL('@/assets/photo4.jpg', import.meta.url).href},
  {id: 'photo-5', src: new URL('@/assets/photo5.jpg', import.meta.url).href},
])
</script>

<template>
  <div>
    <h2>Welcome to Week Eat Planner!</h2>
    <p>Plan your meals for the entire week easily.</p>
    <div>
      <img v-for="{id, src} in photos" :key="id" :src="src" alt="Gallery Image"/>
    </div>
  </div>
</template>


<style scoped>

</style>
