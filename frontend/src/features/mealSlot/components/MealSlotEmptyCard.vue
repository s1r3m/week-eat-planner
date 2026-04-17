<template>
  <Card variant="slotEmpty">
    <CardContent>
      <CardTitle class="text-center text-on-surface-variant">
        <Badge>{{ t(`mealTypes.${mealType}`) }}</Badge>
      </CardTitle>
      <CardDescription
        class="flex items-center gap-1 text-label-sm font-light text-on-surface-variant pt-3"
      >
        <PlusCircle :size="14" />
        {{ t('mealSlotCard.assignRecipe') }}
      </CardDescription>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-vue-next';
import Badge from '@/components/ui/badge/Badge.vue';

defineProps<{
  mealType: string;
}>();

const { t } = useI18n();
</script>
