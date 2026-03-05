<template>
  <Dialog :open="modelValue" @update:open="$emit('close')">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Delete {{ props.weekName }}? </DialogTitle>
        <DialogDescription> This action cannot be undone. </DialogDescription>
      </DialogHeader>

      <p class="text-base text-popover-foreground">
        Are you sure you want to delete
        <span class="font-semibold text-destructive">{{ props.weekName }}</span
        >?
      </p>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" @click="$emit('close')"> No </Button>
        </DialogClose>
        <Button variant="destructive" :disabled="props.processing" @click="handleYes">
          <template v-if="props.processing">
            <Spinner />
          </template>
          {{ props.processing ? 'Deleting...' : 'Yes' }}
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

interface Props {
  modelValue: boolean;
  weekName?: string;
  processing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  processing: false,
});

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();

const handleYes = () => {
  if (props.processing) {
    return;
  }
  emit('confirm');
};
</script>
