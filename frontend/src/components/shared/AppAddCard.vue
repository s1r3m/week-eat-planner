<template>
  <Card variant="empty">
    <div class="h-full w-full flex items-center justify-center" @click.stop="$emit('create')">
      <span class="text-8xl font-bold text-primary">+</span>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card';

defineEmits<{
  create: [];
}>();
</script>
