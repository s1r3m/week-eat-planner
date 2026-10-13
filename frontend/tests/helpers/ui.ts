import { defineComponent } from 'vue'

export const DialogStub = defineComponent({
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  template: '<section v-if="modelValue"><slot /></section>',
})

export const uiStubs = {
  BaseDialog: DialogStub,
  BaseAlertDialog: DialogStub,
  DialogClose: { template: '<span><slot /></span>' },
  AlertDialogCancel: { template: '<span><slot /></span>' },
  Icon: true,
  NuxtLink: { template: '<a><slot /></a>' },
}
