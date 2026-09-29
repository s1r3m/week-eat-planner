import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { AUTH_KEY } from '@/modules/auth/constants'
import { useWeekCreateDialog } from '@/modules/weeks/composables/useWeekCreateDialog'
import { useWeekDeleteDialog } from '@/modules/weeks/composables/useWeekDeleteDialog'
import { WEEKS_KEY } from '@/modules/weeks/constants'
import WeekCreateDialog from '@/modules/weeks/ui/WeekCreateDialog.vue'
import WeekDeleteDialog from '@/modules/weeks/ui/WeekDeleteDialog.vue'

import { mountComposable } from '../helpers/composable'
import { user, week } from '../helpers/fixtures'
import { DialogStub, uiStubs } from '../helpers/ui'

const api = vi.fn()
beforeEach(() => {
  api.mockReset()
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

it('disables blank names, sends a trimmed copy, closes immediately, and starts fresh', async () => {
  const response = Promise.withResolvers<ReturnType<typeof week>>()
  api.mockReturnValue(response.promise)
  const { result: dialog, wrapper } = mountComposable(useWeekCreateDialog, {
    render: () => h(WeekCreateDialog),
    stubs: uiStubs,
    seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
  })
  dialog.open()
  await nextTick()
  const submit = () => wrapper.get<HTMLButtonElement>('button[type="submit"]')
  expect(submit().element.disabled).toBe(true)
  await wrapper.get('input').setValue(' '.repeat(3))
  expect(submit().element.disabled).toBe(true)
  expect(api).not.toHaveBeenCalled()
  await wrapper.get('input').setValue('  New week  ')
  expect(submit().element.disabled).toBe(false)
  await wrapper.get('form').trigger('submit')
  expect(dialog.isOpen.value).toBe(false)
  await flushPromises()
  expect(api).toHaveBeenCalledExactlyOnceWith('/weeks', {
    method: 'POST',
    body: { name: 'New week' },
  })
  dialog.open()
  await nextTick()
  expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('')
  await wrapper.get('input').setValue('Another')
  expect(submit().element.disabled).toBe(true)
  response.resolve(week('created', 'New week'))
  await flushPromises()
  expect(submit().element.disabled).toBe(false)
  // Closing through the model also discards the draft on the next opening.
  wrapper.getComponent(DialogStub).vm.$emit('update:modelValue', false)
  await nextTick()
  dialog.open()
  await nextTick()
  expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('')
})

it('keeps a failed create closed and lets the mutation show one toast', async () => {
  const response = Promise.withResolvers<ReturnType<typeof week>>()
  api.mockReturnValue(response.promise)
  const { result: dialog, wrapper } = mountComposable(useWeekCreateDialog, {
    render: () => h(WeekCreateDialog),
    stubs: uiStubs,
    seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
  })
  dialog.open()
  await nextTick()
  await wrapper.get('input').setValue('New')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  response.reject(new Error('Creation failed'))
  await flushPromises()
  expect(dialog.isOpen.value).toBe(false)
  expect(useGlobalToast().toasts.value).toMatchObject([
    { message: 'Creation failed' },
  ])
})

it('closes and navigates before deletion finishes, then rolls back with one toast on failure', async () => {
  const response = Promise.withResolvers<null>()
  api.mockReturnValue(response.promise)
  const navigate = vi.fn()
  vi.stubGlobal('navigateTo', navigate)
  const {
    result: dialog,
    cache,
    wrapper,
  } = mountComposable(useWeekDeleteDialog, {
    render: () => h(WeekDeleteDialog),
    stubs: uiStubs,
    seed: (cache) => cache.setQueryData(WEEKS_KEY.all(), [week()]),
  })
  dialog.open(week())
  await nextTick()
  await wrapper.get('button.btn--danger').trigger('click')
  expect(dialog.isOpen.value).toBe(false)
  expect(dialog.week.value).toBeNull()
  expect(navigate).toHaveBeenCalledExactlyOnceWith({ name: 'my-weeks' })
  await flushPromises()
  expect(api).toHaveBeenCalledExactlyOnceWith('/weeks/week-1', {
    method: 'DELETE',
  })
  dialog.open(week())
  await nextTick()
  expect(
    wrapper.get<HTMLButtonElement>('button.btn--danger').element.disabled,
  ).toBe(true)
  dialog.close()
  response.reject(new Error('Deletion failed'))
  await flushPromises()
  expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week()])
  expect(useGlobalToast().toasts.value).toMatchObject([
    { message: 'Deletion failed' },
  ])
})

it('closes the delete dialog without clearing its selection', async () => {
  const { result: dialog, wrapper } = mountComposable(useWeekDeleteDialog, {
    render: () => h(WeekDeleteDialog),
    stubs: uiStubs,
  })
  dialog.open(week())
  await nextTick()
  wrapper.getComponent(DialogStub).vm.$emit('update:modelValue', false)
  await nextTick()
  expect(dialog.week.value).toEqual({ id: 'week-1', name: 'Week one' })
  expect(api).not.toHaveBeenCalled()
})
