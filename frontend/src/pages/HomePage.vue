<script setup lang="ts">
import { ref } from 'vue'

const photos = ref([
  {id: 'photo-2', src: 'src/assets/photo2.jpg'},
  {id: 'photo-3', src: 'src/assets/photo3.jpg'},
  {id: 'photo-4', src: 'src/assets/photo4.jpg'},
  {id: 'photo-5', src: 'src/assets/photo5.jpg'}
])
</script>

<template>
  <div>
    <h2>Welcome to Week Eat Planner!</h2>
    <p>Plan your meals for the entire week easily.</p>
    <div>
      <img v-for="{id, src} in photos" :key="id" :src="src" alt=""/>
    </div>
  </div>
</template>


<style scoped>

</style>
