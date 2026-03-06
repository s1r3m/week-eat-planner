<template>
  <Card variant="empty">
    <div @click.stop="$emit('create')">
      <span class="text-9xl font-bold text-primary">+</span>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card';

defineEmits<{
  create: [];
}>();
</script>
