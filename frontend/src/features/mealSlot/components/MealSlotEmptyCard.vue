<template>
  <Card variant="slotEmpty">
    <CardContent class="flex flex-col justify-between h-full p-3">
      <div class="flex justify-center">
        <Badge class="text-label-sm">{{ t(`mealTypes.${mealType}`) }}</Badge>
      </div>
      <div
        class="flex flex-col items-center gap-1 text-label-sm font-light text-on-surface-variant"
      >
        <PlusCircle :size="14" />
        {{ t('mealSlotCard.assignRecipe') }}
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-vue-next';
import Badge from '@/components/ui/badge/Badge.vue';

defineProps<{
  mealType: string;
}>();

const { t } = useI18n();
</script>
