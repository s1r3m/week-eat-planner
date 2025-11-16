<template>
<div class="flex items-center justify-center py-12">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
    <p class="text-gray-600">Loading {{ loadingName }}...</p>
  </div>
</div>
</template>

<script setup lang="ts">
interface Props {
    loadingName?: string
}

withDefaults(defineProps<Props>(), { loadingName: 'data' })
</script>

<style scoped>

</style>