<template>
  <Card
    class="flex flex-col gap-6 items-center-safe w-full p-6 mt-6 rounded-xl text-muted-foreground"
  >
    <MessageCircleX :size="42" />
    <h2 class="text-lg">An error has occurred</h2>
    <p>{{ err.message }}</p>
    <Button @click="retry"> Try again</Button>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircleX } from 'lucide-vue-next';

defineProps<{
  err: Error;
  retry: CallableFunction;
}>();
</script>
