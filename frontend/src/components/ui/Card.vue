<template>
  <div
      class="relative overflow-hidden rounded-lg shadow-lg"
      :class="{ 'cursor-pointer hover:shadow-xl transition-shadow duration-300': interactive }"
      @click="interactive ? emit('click') : null"
  >
    <!-- Edit and Delete Buttons -->
    <div v-if="interactive" class="absolute top-2 right-2 z-10 space-x-2">
      <button
          class="p-2 bg-white/70 rounded-full hover:bg-white"
          @click.stop="emit('edit')"
      >
        ✏️ <!-- Placeholder icon -->
      </button>
      <button
          class="p-2 bg-white/70 rounded-full hover:bg-white"
          @click.stop="emit('delete')"
      >
        🗑️ <!-- Placeholder icon -->
      </button>
    </div>
    <img :src="src" :alt="name" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-brand-primary/50 to-transparent"></div>
    <h2 class="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl font-bold text-white w-full text-center">{{ name }}</h2>
  </div>
</template>

<script setup lang="ts">
interface Props {
  interactive?: boolean
  name?: string
  src?: string
}

withDefaults(defineProps<Props>(), {
    interactive: true,
})

const emit = defineEmits(['click', 'edit', 'delete'])
</script>

<style scoped>
</style>
