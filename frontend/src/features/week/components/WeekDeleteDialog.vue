<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Delete {{ week.name }}? </DialogTitle>
        <DialogDescription> This action cannot be undone. </DialogDescription>
      </DialogHeader>

      <p class="text-base text-popover-foreground">
        Are you sure you want to delete
        <span class="font-semibold text-destructive">{{ week.name }}</span
        >?
      </p>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" @click="isOpen = false"> No </Button>
        </DialogClose>
        <Button variant="destructive" :disabled="isLoading" @click="onDelete">
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Deleting...' : 'Yes' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useWeekStore } from '../store/weeks';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import type { UserWeekMinimal } from '@/domain/week/models';

const isOpen = defineModel<boolean>();
const props = defineProps<{ week: UserWeekMinimal }>();
const weekStore = useWeekStore();
const { call: remove, isLoading } = useAsyncCall(async () => {
  await weekStore.removeWeek(props.week.id);
});

const onDelete = async () => {
  await remove();
  isOpen.value = false;
};
</script>
