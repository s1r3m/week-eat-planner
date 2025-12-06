<template>
  <template v-if="loading">
    <TheLoadingSpinner loading-name="profile" />
  </template>

  <template v-else>
    <main>
      <p>{{ JSON.stringify(user_info) }}</p>
    </main>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '@/api/client';

import TheLoadingSpinner from '@/layouts/TheLoadingSpinner.vue';

const user_info = ref({});
const loading = ref(false);

const fetchUser = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/user');
    if (res.status === 200) {
      user_info.value = await res.data;
    }
  } finally {
    loading.value = false;
  }
};
fetchUser();
</script>

<style scoped></style>
