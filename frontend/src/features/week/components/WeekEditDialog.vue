<template>
  <Dialog :open="props.modelValue" @update:open="$emit('close')">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Edit {{ props.weekName }} </DialogTitle>
        <DialogDescription> Update the name so the plan stays organized. </DialogDescription>
      </DialogHeader>

      <form id="weekEditForm" @submit.prevent="handleSave">
        <FieldGroup>
          <FieldLabel for="weekName"> New week name </FieldLabel>
          <Input id="weekName" v-model="localWeekName" type="text" , placeholder="E.g. Week 1" />
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline" :disabled="props.saving" @click="$emit('close')">
            Cancel
          </Button>
        </DialogClose>
        <Button form="weekEditForm" type="submit" :disabled="isSaveDisabled">
          <template v-if="props.saving">
            <Spinner />
          </template>
          {{ props.saving ? 'Saving...' : 'Save' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
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

interface Props {
  modelValue: boolean;
  weekName: string;
  saving?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
});

const emit = defineEmits<{
  save: [string];
  close: [];
}>();

const localWeekName = ref(props.weekName);

watchEffect(() => {
  if (props.modelValue) {
    localWeekName.value = props.weekName;
  }
});

const isSaveDisabled = computed(
  () =>
    props.saving || !localWeekName.value.trim() || localWeekName.value.trim() === props.weekName,
);

const handleSave = () => {
  if (isSaveDisabled.value) {
    return;
  }
  emit('save', localWeekName.value.trim());
};
</script>
