<template>
    <div class="card h-64 flex flex-col bg-gray-800 rounded-lg overflow-hidden relative group cursor-pointer">
        <div class="absolute inset-0 bg-gradient-to-t from-green-500/30 to-transparent group-hover:opacity-0 transition-opacity duration-300"></div>
        <div class="p-4 flex-1 flex flex-col justify-end items-center relative">
            <h3 v-if="name" class="text-xl font-semibold text-white">{{ name }}</h3>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    name?: string
    picture_src?: string  // Not implemented yet
}

defineProps<Props>()
</script>

<style scoped>
</style>
