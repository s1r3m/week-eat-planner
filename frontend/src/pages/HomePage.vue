<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from "@/stores/userAuth.ts"
import { useRouter } from "vue-router"

const userAuth = useAuthStore()
const router = useRouter()

if (userAuth.access_token) {
  router.push('/weeks')
}

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


<style scoped>

</style>
