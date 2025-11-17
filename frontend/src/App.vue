<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import TheMainLayout from '@/components/layout/TheMainLayout.vue';
</script>

<template>
  <div class="bg-surface-base text-base-color">
    <TheHeader />
    <TheMainLayout>
      <router-view />
    </TheMainLayout>
    <TheFooter />
  </div>
</template>
