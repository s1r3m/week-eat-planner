import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { PiniaColada, useMutation } from '@pinia/colada'
import { renderToString } from '@vue/server-renderer'
import { createPinia, disposePinia } from 'pinia'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { useSignupForm } from '@/modules/auth/composables/useSignupForm'

const api = mock()
let pinia: ReturnType<typeof createPinia> | undefined

async function createForm() {
  let form!: ReturnType<typeof useSignupForm>
  const app = createSSRApp(
    defineComponent({
      setup() {
        form = useSignupForm()
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
    useNuxtApp: () => ({ $api: api }),
  })
})
afterEach(() => {
  if (pinia) disposePinia(pinia)
  pinia = undefined
})

describe('useSignupForm', () => {
  it('initializes with default values', async () => {
    const form = await createForm()

    expect(form.email.value).toBe('')
    expect(form.username.value).toBe('')
    expect(form.password.value).toBe('')
    expect(form.isLoading.value).toBe(false)
    expect(form.serverError.value).toBeNull()
  })

  it('submits the values bound to the form through its own validation', async () => {
    const form = await createForm()
    form.email.value = ' test@example.com '
    form.username.value = ' testuser '
    form.password.value = 'password123'

    await form.handleSubmit(form.register)()

    expect(api).toHaveBeenCalledTimes(1)
    expect(api).toHaveBeenCalledWith('/auth/signup', {
      body: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      },
      method: 'POST',
    })
    expect(form.serverError.value).toBeNull()
    expect(form.isLoading.value).toBe(false)
  })

  it('shows validation errors without sending invalid registration data', async () => {
    const form = await createForm()
    form.email.value = 'not-an-email'
    form.username.value = ' '
    form.password.value = 'short'

    await form.handleSubmit(form.register)()

    expect(api).not.toHaveBeenCalled()
    expect(form.errors.value.email).toBe('Invalid email')
    expect(form.errors.value.username).toBe('This is required')
    expect(form.errors.value.password).toBe('At least 8 symbols')
  })

  it('waits for the signup request and keeps loading state until it finishes', async () => {
    const form = await createForm()
    const response = Promise.withResolvers<unknown>()
    const started = Promise.withResolvers<void>()
    api.mockImplementationOnce(() => {
      started.resolve()
      return response.promise
    })

    const submission = form.register({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })
    await started.promise
    expect(form.isLoading.value).toBe(true)

    response.resolve({ id: '1', username: 'testuser' })
    await submission
    expect(form.isLoading.value).toBe(false)
  })

  it.each([
    [{ data: { detail: 'User already exists' } }, 'User already exists'],
    [{ data: { detail: [] } }, 'Something went wrong'],
    [{ data: { detail: '' } }, 'Something went wrong'],
    [new Error('Network error'), 'Something went wrong'],
  ])('shows request errors on the form', async (error, message) => {
    const form = await createForm()
    form.email.value = 'test@example.com'
    form.username.value = 'testuser'
    form.password.value = 'password123'
    api.mockRejectedValueOnce(error)

    await expect(form.handleSubmit(form.register)()).rejects.toBe(error)

    expect(form.serverError.value).toBe(message)
    expect(form.isLoading.value).toBe(false)
  })
})
