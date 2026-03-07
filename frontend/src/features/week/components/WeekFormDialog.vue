<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> {{ title }} </DialogTitle>
        <DialogDescription> {{ description }} </DialogDescription>
      </DialogHeader>

      <form id="weekForm" @submit.prevent="onSubmit">
        <FieldGroup>
          <FieldLabel for="weekName"> Name </FieldLabel>
          <Input id="weekName" v-model="name" type="text" placeholder="E.g. Week 1" />
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline"> Cancel </Button>
        </DialogClose>
        <Button
          form="weekForm"
          type="submit"
          :disabled="!name.trim() || name.trim() === initialName || isLoading"
        >
          <Spinner v-if="isLoading" />
          {{ isLoading ? 'Saving...' : submitLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

const props = defineProps<{
  title: string;
  description: string;
  initialName?: string;
  submitLabel: string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  submit: [name: string];
}>();

const isOpen = defineModel<boolean>();
const name = ref(props.initialName || '');

watch(
  () => props.initialName,
  (newVal) => {
    name.value = newVal || '';
  },
);

const onSubmit = () => {
  emit('submit', name.value);
};
</script>
