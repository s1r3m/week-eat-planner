<template>
  <div class="flex gap-1">
    <Input v-model="ingredient.name" class="flex-5" type="text" placeholder="Ingredient" />
    <Input v-model="ingredient.amount" class="flex-1" type="number" min="0" placeholder="qty" />
    <Select v-model="ingredient.unit" default-value="g">
      <SelectTrigger class="w-18" size="lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem v-for="unit in UNITS" :key="unit" :value="unit">
            {{ unit }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <Button
      variant="ghost"
      class="text-destructive w-4 h-12 rounded-sm"
      :class="{ invisible: !showDelete }"
      :disabled="!showDelete"
      aria-label="Remove ingredient"
      @click="$emit('remove')"
      ><X
    /></Button>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { UNITS } from '@/api/recipes';
import type { Ingredient } from '@/api/recipes';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ingredient = defineModel<Ingredient>('ingredient', { required: true });
defineProps<{ showDelete?: boolean }>();
defineEmits<{ remove: [] }>();
</script>
