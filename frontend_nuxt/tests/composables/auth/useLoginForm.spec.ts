import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLoginForm } from '@/modules/auth/composables/useLoginForm'

import { mountComposable } from '../../helpers/composable'

const api = vi.fn()
const createForm = () => mountComposable(useLoginForm).result

beforeEach(() => {
  api.mockReset().mockResolvedValue({})
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
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

it('clears the previous server error when retrying', async () => {
  const form = createForm()
  const error = new Error('offline')
  api.mockRejectedValueOnce(error)
  await expect(
    form.login({ email: 'test@example.com', password: 'password123' }),
  ).rejects.toBe(error)
  expect(form.serverError.value).toBe('Something went wrong')
  await form.login({ email: 'test@example.com', password: 'password123' })
  expect(form.serverError.value).toBeNull()
})
