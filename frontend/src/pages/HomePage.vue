<script setup lang="ts">
import { ref } from 'vue'
import Card from "@/components/ui/Card.vue";
import {useRouter} from "vue-router";

const router = useRouter()

const photos = ref([
  {id: 'photo-3', forWhom: "Athletes", src: new URL('@/assets/photo3.jpg', import.meta.url).href},
  {id: 'photo-4', forWhom: "Families", src: new URL('@/assets/photo4.jpg', import.meta.url).href},
  {id: 'photo-5', forWhom: "Diets", src: new URL('@/assets/photo5.jpg', import.meta.url).href},
])
</script>

<template>
  <main class="container-center">
    <section id="#hero" class="flex flex-col-reverse justify-center md:flex-row p-6 items-center gap-8 my-12">
      <article class="md:w1/2">
        <p class="max-w-md text-2xl mt-4 text-center md:text-left">
          Plan once. Eat <span class="text-brand-primary">better</span> all week
        </p>
        <p class="max-w-md text-2xl mt-4 text-center md:text-left">
          Stay <span class="text-brand-primary">on budget</span> with auto lists
        </p>
        <p class="max-w-md text-2xl mt-4 text-center md:text-left">
          <span class="text-brand-primary">Reduce</span> food waste by planning ahead
        </p>
      </article>
      <img src="@/assets/photo2.jpg" alt="" />
    </section>

    <hr class="container-center my-12 w-2/3 text-brand-primary">

    <section id="#use-cases" class="container-center flex-center flex-col mb-12">
      <h2 class="text-center text-3xl font-bold text-black my-4">Use cases</h2>
      <div class="flex flex-col md:flex-row gap-8">
        <Card
            v-for="{id, src, forWhom} in photos"
            :key="id"
            :interactive="false"
            :name="forWhom"
            :src="src"
        />
      </div>
    </section>

    <hr class="container-center my-12 w-2/3 text-brand-primary">

    <section id="#get-started" class="container-center my-12 text-center">
      <article class="flex flex-col items-center">
        <h2 class="text-3xl font-bold mb-8">Get started in 2 mins</h2>
        <ol class="list-decimal list-inside space-y-4 text-xl text-muted">
          <li>Register an account</li>
          <li>Create a new week plan</li>
          <li>Assign your favorite recipes</li>
          <li>Get an automatic grocery list!</li>
        </ol>
      </article>
    </section>
  </main>

  <hr class="container-center my-12 w-2/3 text-brand-primary">

  <section id="#sign-up" class="container-center my-12 text-center">
    <button
        class="btn-primary"
        @click="router.push('/signup')"
    >
      Sign up now!
    </button>
  </section>
</template>


<style scoped>

</style>
