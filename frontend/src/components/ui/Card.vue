<template>
    <div 
        class="card h-64 flex flex-col bg-gray-300 rounded-lg overflow-hidden relative"
        :class="{ 'group cursor-pointer': interactive }"
        @click="emit('click')"
    >
        <div
            v-if="interactive"
            class="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
        ></div>
        <div v-if="interactive" class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
             <button @click.stop="emit('edit')" class="w-8 h-8 flex items-center justify-center bg-gray-900/50 hover:bg-gray-900/80 rounded-full">
                 <svg class="w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z"></path></svg>
             </button>
             <button @click.stop="emit('delete')" class="w-8 h-8 flex items-center justify-center bg-gray-900/50 hover:bg-gray-900/80 rounded-full">
                 <svg class="w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-end items-stretch relative">
            <slot>
                <h3 v-if="name" class="text-xl font-semibold text-white text-center">{{ name }}</h3>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    name?: string
    interactive?: boolean
}

withDefaults(defineProps<Props>(), {
    interactive: true,
})

const emit = defineEmits<{
    (e: 'click'): void
    (e: 'edit'): void
    (e: 'delete'): void
}>()
</script>

<style scoped>
</style>
