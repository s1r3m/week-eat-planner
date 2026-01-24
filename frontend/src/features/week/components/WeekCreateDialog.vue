<template>
  <Dialog :open="props.modelValue" @update:open="$emit('close')">
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
          <Button variant="outline" @click="$emit('close')"> Cancel </Button>
        </DialogClose>
        <Button type="submit" form="addWeekForm" :disabled="isDisabled">
          <template v-if="props.processing">
            <Spinner />
          </template>
          {{ props.processing ? 'Creating...' : 'Create' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { WeekPayload } from '@/features/week/types/week';
import { ref, computed } from 'vue';
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

interface Props {
  modelValue: boolean;
  processing?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  processing: false,
});

const newName = ref('');
const isDisabled = computed(() => !newName.value || props.processing);

const emit = defineEmits<{
  create: [data: WeekPayload];
  close: [];
}>();

const onCreate = () => {
  if (!newName.value.trim() || props.processing) {
    return;
  }
  emit('create', { name: newName.value.trim() } as WeekPayload);
  newName.value = '';
};
</script>
