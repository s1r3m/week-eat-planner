<script setup lang="ts">
  import PromoHero from '@/modules/main/ui/PromoHero.vue'

  definePageMeta({
    layout: 'default',
  })
</script>

<template>
  <div class="page-container promo-page">
    <PromoHero />
  </div>
</template>

<style scoped>
  .promo-page {
    display: flex;
    flex-direction: column;
  }
</style>
