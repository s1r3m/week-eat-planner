<template>
  <Dialog v-model:open="isOpen" @update:open="isOpen = false">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Edit {{ week.name }} </DialogTitle>
        <DialogDescription> Update the name so the plan stays organized. </DialogDescription>
      </DialogHeader>

      <form id="weekEditForm" @submit.prevent="onEdit">
        <FieldGroup>
          <FieldLabel for="weekName"> New week name </FieldLabel>
          <Input id="weekName" v-model="newName" type="text" , placeholder="E.g. Week 1" />
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" @click="isOpen = false"> Cancel </Button>
        </DialogClose>
        <Button
          form="weekEditForm"
          type="submit"
          :disabled="!newName.trim() || newName.trim() === week.name || isLoading"
        >
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Saving...' : 'Save' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useWeekStore } from '../store/weeks';
import type { UserWeekMinimal } from '@/domain/week/models';

const isOpen = defineModel<boolean>();
const props = defineProps<{ week: UserWeekMinimal }>();
const weekStore = useWeekStore();
const { call: edit, isLoading } = useAsyncCall(
  async () => await weekStore.updateWeek(props.week.id, newName.value.trim()),
);

// TODO: make the value be equal to week.name on the start
const newName = ref<string>('');

const onEdit = async () => {
  await edit();
  isOpen.value = false;
};
</script>
