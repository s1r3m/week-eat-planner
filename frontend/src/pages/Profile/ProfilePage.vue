<template>
  <main>
    <p>{{ JSON.stringify(user_info) }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '@/api/client';

const user_info = ref({});
const res = await apiClient.get('/user');
user_info.value = await res.data;
</script>

<style scoped></style>
