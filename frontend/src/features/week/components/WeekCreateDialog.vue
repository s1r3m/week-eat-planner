<template>
  <Dialog v-model:open="isOpen" @update:open="isOpen = false">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Add new Week </DialogTitle>
        <DialogDescription> Fill the following form: </DialogDescription>
      </DialogHeader>

      <form id="addWeekForm" @submit.prevent="onCreate">
        <FieldGroup>
          <FieldLabel for="weekName"> New week name: </FieldLabel>
          <Input id="weekName" v-model="newName" type="text" placeholder="E.g. Week 1" />
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" @click="isOpen = false"> Cancel </Button>
        </DialogClose>
        <Button type="submit" form="addWeekForm" :disabled="!newName.trim() || isLoading">
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Creating...' : 'Create' }}
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
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useWeekStore } from '@/features/week/store/weeks';

const isOpen = defineModel<boolean>();
const newName = ref('');

const weekStore = useWeekStore();
const { call: create, isLoading } = useAsyncCall(
  async () => await weekStore.addWeek(newName.value.trim()),
);

const onCreate = async () => {
  await create();
  isOpen.value = false;
  newName.value = '';
};
</script>
