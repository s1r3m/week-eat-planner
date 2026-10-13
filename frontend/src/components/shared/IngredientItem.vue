<template>
  <div class="flex items-center justify-between gap-3 w-full">
    <span class="grow truncate">
      <slot name="name">{{ name }}</slot>
    </span>
    <span class="shrink-0 text-right">
      <slot name="amount"> {{ amount }} {{ unit }} </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  amount: string | number;
  unit: string;
}>();
</script>
