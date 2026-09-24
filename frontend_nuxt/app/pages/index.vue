<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  })

  import PromoHero from '@/modules/main/ui/PromoHero.vue'
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
