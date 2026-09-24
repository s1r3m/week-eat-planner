import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { PiniaColada, useMutation, useQueryCache } from '@pinia/colada'
import { renderToString } from '@vue/server-renderer'
import { createPinia, disposePinia } from 'pinia'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { useLoginForm } from '@/modules/auth/composables/useLoginForm'

const api = mock()
let pinia: ReturnType<typeof createPinia> | undefined

async function createForm() {
  let form!: ReturnType<typeof useLoginForm>
  const app = createSSRApp(
    defineComponent({
      setup() {
        form = useLoginForm()
        return () => h('form')
      },
    }),
  )
  pinia = createPinia()
  app.use(pinia).use(PiniaColada)
  await renderToString(app)
  return form
}

beforeEach(() => {
  api.mockReset()
  api.mockResolvedValue({})
  Object.assign(globalThis, {
    ref,
    useMutation,
    useQueryCache,
    useNuxtApp: () => ({ $api: api }),
  })
})
afterEach(() => {
  if (pinia) disposePinia(pinia)
  pinia = undefined
})

describe('useLoginForm', () => {
  it('submits the values bound to the form through its own validation', async () => {
    const form = await createForm()
    form.email.value = 'test@example.com'
    form.password.value = 'password123'

    await form.handleSubmit(form.login)()

    expect(api).toHaveBeenCalledTimes(1)
    expect(api).toHaveBeenCalledWith('/auth/login', {
      body: new URLSearchParams({
        password: 'password123',
        username: 'test@example.com',
      }),
      method: 'POST',
    })
    expect(form.serverError.value).toBeNull()
    expect(form.isLoading.value).toBe(false)
  })

  it('shows validation errors without sending invalid credentials', async () => {
    const form = await createForm()
    form.email.value = 'not-an-email'
    form.password.value = 'short'

    await form.handleSubmit(form.login)()

    expect(api).not.toHaveBeenCalled()
    expect(form.errors.value.email).toBe('Invalid email')
    expect(form.errors.value.password).toBe('At least 8 symbols')
  })

  it('keeps loading state on the form until the login request finishes', async () => {
    const form = await createForm()
    const response = Promise.withResolvers<unknown>()
    const started = Promise.withResolvers<void>()
    api.mockImplementationOnce(() => {
      started.resolve()
      return response.promise
    })

    const submission = form.login({
      email: 'test@example.com',
      password: 'password123',
    })
    await started.promise
    expect(form.isLoading.value).toBe(true)

    response.resolve({ status: 'success' })
    await submission
    expect(form.isLoading.value).toBe(false)
  })

  it.each([
    [{ data: { detail: 'Invalid credentials' } }, 'Invalid credentials'],
    [new Error('Network error'), 'Something went wrong'],
  ])(
    'shows request errors on the form and clears its password',
    async (error, message) => {
      const form = await createForm()
      form.email.value = 'test@example.com'
      form.password.value = 'password123'
      api.mockRejectedValueOnce(error)

      await expect(form.handleSubmit(form.login)()).rejects.toBe(error)

      expect(form.serverError.value).toBe(message)
      expect(form.password.value).toBe('')
      expect(form.isLoading.value).toBe(false)
    },
  )
})
