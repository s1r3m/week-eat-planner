<template>
  <footer class="border-t bg-background/80 text-muted-foreground">
    <div
      class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-4 text-sm md:flex-row md:items-center"
    >
      <p class="font-medium text-foreground">© {{ currentYear }} Week Eat Planner</p>
      <p class="flex items-center gap-1">
        Design by
        <a
          href="https://github.com/s1r3m/week-eat-planner"
          class="font-medium text-brand-primary hover:text-primary hover:underline"
        >
          s1r3m
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped></style>
