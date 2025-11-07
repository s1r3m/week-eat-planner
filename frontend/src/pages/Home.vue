<script setup>
import { ref } from 'vue'

const photos = ref([
  {id: 'photo-1', src: '/images/meals1.jpg'},
  {id: 'photo-2', src: '/images/meals2.jpg'},
  {id: 'photo-3', src: '/images/meals3.jpg'},
])
</script>

<template>
  <div class="home">
    <h2>Welcome to Week Eat Planner!</h2>
    <p>Plan your meals for the entire week easily.</p>

    <div class="carousel">
      <img v-for="{id, src} in photos" :key="id" :src="src" class="carousel-img" alt=""/>
    </div>
  </div>
</template>


<style scoped src="../App.css"></style>
