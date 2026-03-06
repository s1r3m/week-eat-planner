<template>
  <div @click.stop="isAddWeekModalOpen = true">
    <span class="text-9xl font-bold text-primary">+</span>
  </div>

  <WeekCreateDialog v-model="isAddWeekModalOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WeekCreateDialog from '@/features/week/components/WeekCreateDialog.vue';

const isAddWeekModalOpen = ref(false);
</script>
