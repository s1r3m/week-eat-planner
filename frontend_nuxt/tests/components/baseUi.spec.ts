import { expect, it } from 'vitest'
import { h, ref, toValue } from 'vue'

import BaseBadge from '@/common/ui/BaseBadge.vue'
import BaseButton from '@/common/ui/BaseButton.vue'
import BaseInput from '@/common/ui/BaseInput.vue'
import PageLoadingState from '@/common/ui/PageLoadingState.vue'

import { mountComposable } from '../helpers/composable'

it('connects an explicit input ID, label, value and error to a controlled input', async () => {
  const model = ref('Draft')
  const { wrapper } = mountComposable(() => model, {
    render: () =>
      h(BaseInput, {
        id: 'recipe-name',
        label: 'Recipe',
        modelValue: model.value,
        error: 'Name is required',
        'onUpdate:modelValue': (value) => {
          model.value = String(value)
        },
      }),
  })
  expect(wrapper.get('label').attributes('for')).toBe('recipe-name')
  expect(wrapper.get('input').attributes('id')).toBe('recipe-name')
  expect(wrapper.get('small').text()).toBe('Name is required')
  await wrapper.get('input').setValue('Soup')
  expect(toValue(model)).toBe('Soup')
})

it('renders the default loading label and badge variant', () => {
  const { wrapper } = mountComposable(() => null, {
    render: () =>
      h('div', [h(PageLoadingState), h(BaseBadge, null, () => 'Badge')]),
  })
  expect(wrapper.text()).toContain('Loading ...')
  expect(wrapper.get('.badge').classes()).toContain('badge--default')
  expect(wrapper.get('.badge').text()).toBe('Badge')
})

it('passes button type, disabled state, and variant through to the native control', () => {
  const { wrapper } = mountComposable(() => null, {
    render: () =>
      h(
        BaseButton,
        { type: 'submit', disabled: true, variant: 'secondary' },
        () => 'Save',
      ),
  })
  expect(wrapper.get<HTMLButtonElement>('button').element.disabled).toBe(true)
  expect(wrapper.get('button').attributes('type')).toBe('submit')
  expect(wrapper.get('button').classes()).toContain('btn--secondary')
})
