<template>
  <div class="flex gap-3 z-40 pointer-events-auto absolute top-2 right-2">
    <Button
      variant="outline"
      class="rounded-full bg-primary/30 backdrop-blur-lg"
      @click.stop="$emit('edit')"
    >
      <Pencil />
    </Button>
    <Button
      variant="outline"
      class="rounded-full bg-primary/30 backdrop-blur-lg"
      @click.stop="$emit('delete')"
    >
      <Trash2 />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-vue-next';

defineEmits<{
  edit: [];
  delete: [];
}>();
</script>
