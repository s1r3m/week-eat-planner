<template>
  <footer class="bg-brand-muted">
    <div class="container-center flex justify-between items-center px-2">
      <p class="text-xl font-medium my-4">© {{ currentYear }} Week Eat Planner</p>
      <p class="text-xl font-medium my-4 text-muted">
        Design by
        <a href="https://github.com/s1r3m/week-eat-planner">
          <span class="text-base-color hover:underline">s1r3m</span>
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
</style>