<script setup lang="ts">
import { ref } from "vue"
import TheMainLayout from "@/components/layout/TheMainLayout.vue"
import apiClient from "@/api/client"

const user_info = ref({})
const res = await apiClient.get('/user')
user_info.value = await res.data
</script>

<template>
  <TheMainLayout pageName="profile">
    <p>{{ JSON.stringify(user_info) }}</p>
  </TheMainLayout>
</template>

<style scoped>

</style>