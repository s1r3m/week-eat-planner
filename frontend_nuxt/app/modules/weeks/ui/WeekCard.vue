<script setup lang="ts">
  import type { WeekPreview } from '@/modules/weeks/types'

  defineProps<{
    week: WeekPreview
  }>()
</script>

<template>
  <NuxtLink :to="{ name: 'weeks-id', params: { id: week.id } }">
    <div class="week-card">
      <div class="week-card__content">
        <div class="week-card__bg"></div>

        <h2 class="week-card__name">{{ week.name }}</h2>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
  .week-card {
    display: grid;
    isolation: isolate;
  }

  .week-card__content {
    grid-area: 1 / 1;
    display: grid;
    width: 100%;
    height: 15rem;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--bg-elevated);
    cursor: pointer;
    isolation: isolate;
  }

  .week-card__bg {
    grid-area: 1 / 1;
    width: 100%;
    background: color-mix(in oklab, var(--brand-primary) 30%, white);
  }

  .week-card__name {
    position: relative;
    text-align: center;
    grid-area: 1 / 1;
    align-self: end;
    padding: var(--space-2);
    background: rgb(255 255 255 / 45%);
  }
</style>
