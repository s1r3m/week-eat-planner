<template>
  <Dialog v-if="week" v-model:open="isOpen">
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { deleteWeekMutation } from '@/api/weeks';
import type { WeekFull } from '@/api/weeks';

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

const week = defineModel<WeekFull | null>();
const isOpen = computed({
  get: () => !!week.value,
  set: (value) => {
    if (!value) week.value = null;
  },
});

const { mutate: remove, isLoading } = useMutation(deleteWeekMutation());

const router = useRouter();
const onDelete = () => {
  if (!week.value) return;
  remove(week.value.id);
  week.value = null;
  router.push({ name: ROUTE_NAMES.WEEKS });
};
</script>
