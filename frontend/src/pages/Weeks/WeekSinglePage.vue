<template>
  <div class="grid-container">test</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { UserWeek } from '@/types/api';
import { useRoute, useRouter } from 'vue-router';
import { useWeekStore } from '@/stores/weeks';
// import PresentCard from '@/components/ui/PresentCard.vue';

const week: Ref<UserWeek | null> = ref(null);
const weekStore = useWeekStore();
const route = useRoute();
const router = useRouter();

week.value = await weekStore.getWeek(route.params.id as string);
if (!week.value) {
  router.push('/weeks');
}
</script>

<style scoped>
@import '@/theme.css';
@import 'tailwindcss';

.grid-container {
  @apply grid grid-cols-1 lg:grid-cols-4 2xl:grid-cols-7;
}

.grid-item {
  @apply max-h-60;
}
</style>
