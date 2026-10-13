import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { computed, h, reactive, ref } from 'vue'

import { useSidebar } from '@/common/composables/useSidebar'
import BaseSidePanel from '@/common/ui/BaseSidePanel.vue'
import { AUTH_KEY } from '@/modules/auth/constants'
import * as navigation from '@/modules/main/composables/useAppNavigation'
import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
import AppHeader from '@/modules/main/ui/AppHeader.vue'
import AppLogo from '@/modules/main/ui/AppLogo.vue'
import AppMobileSidePanel from '@/modules/main/ui/AppMobileSidePanel.vue'
import AppNavigation from '@/modules/main/ui/AppNavigation.vue'
import AppSidebar from '@/modules/main/ui/AppSidebar.vue'
import AppUser from '@/modules/main/ui/AppUser.vue'
import GuestHeader from '@/modules/main/ui/GuestHeader.vue'
import GuestMobileSidePanel from '@/modules/main/ui/GuestMobileSidePanel.vue'
import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../helpers/composable'
import { user, week } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const api = vi.fn()
const route = reactive({ name: 'index' })
const colorMode = reactive({ value: 'light', preference: 'system' })
const stubs = {
  ...uiStubs,
  ClientOnly: { template: '<slot />' },
  BaseDropdown: { template: '<div><slot name="trigger" /><slot /></div>' },
  DropdownMenuItem: { template: '<button type="button"><slot /></button>' },
  BaseSidePanel: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<aside><slot name="title" /><slot /><slot name="footer" /></aside>',
  },
}
beforeEach(() => {
  route.name = 'index'
  colorMode.value = 'light'
  colorMode.preference = 'system'
  api.mockReset().mockResolvedValue([])
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
  vi.stubGlobal('useRoute', () => route)
  vi.stubGlobal('useColorMode', () => colorMode)
})

it('hides the current authentication route and emits navigation after it finishes', async () => {
  const pending = Promise.withResolvers<void>()
  vi.stubGlobal(
    'navigateTo',
    vi.fn(() => pending.promise),
  )
  const { wrapper } = mountComposable(() => null, {
    render: () => h(AppAuthControls),
    stubs,
  })
  expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
    'Login',
    'Register',
  ])
  await wrapper.findAll('button')[0]!.trigger('click')
  expect(
    wrapper.getComponent(AppAuthControls).emitted('navigate'),
  ).toBeUndefined()
  pending.resolve()
  await flushPromises()
  expect(navigateTo).toHaveBeenCalledWith({ name: 'login' })
  expect(
    wrapper.getComponent(AppAuthControls).emitted('navigate'),
  ).toHaveLength(1)
  route.name = 'login'
  await flushPromises()
  expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
    'Register',
  ])
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(navigateTo).toHaveBeenCalledWith({ name: 'signup' })
  route.name = 'signup'
  await flushPromises()
  expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
    'Login',
  ])
})

it('renders expanded week links, hides children when collapsed, and propagates link clicks', async () => {
  const collapsed = ref(false)
  const { cache, wrapper } = mountComposable(() => null, {
    render: () => h(AppNavigation, { collapsed: collapsed.value }),
    stubs,
    seed: (cache) => cache.setQueryData(WEEKS_KEY.all(), [week()]),
  })
  expect(wrapper.get('.nav__children').text()).toContain('Week one')
  await wrapper.get('.nav__children a').trigger('click')
  await wrapper.get('.nav__item > a').trigger('click')
  expect(wrapper.getComponent(AppNavigation).emitted('navigate')).toHaveLength(
    2,
  )
  collapsed.value = true
  await flushPromises()
  expect(wrapper.find('.nav__children').exists()).toBe(false)
  expect(wrapper.get('.nav__title').classes()).toContain(
    'nav__title--collapsed',
  )
  collapsed.value = false
  cache.setQueryData(WEEKS_KEY.all(), [])
  await flushPromises()
  expect(wrapper.find('.nav__children').exists()).toBe(false)
})

it('keeps the logo home link and changes its collapsed title', async () => {
  const collapsed = ref(false)
  const { wrapper } = mountComposable(() => null, {
    render: () => h(AppLogo, { collapsed: collapsed.value }),
    stubs,
  })
  expect(wrapper.text()).toContain('Week Eat Planner')
  await wrapper.get('a').trigger('click')
  expect(wrapper.getComponent(AppLogo).emitted('navigate')).toHaveLength(1)
  collapsed.value = true
  await flushPromises()
  expect(wrapper.get('h1').classes()).toContain('app_logo__title--collaped')
})

it('toggles the desktop sidebar and opens the mobile menu from the app header', async () => {
  const { result, wrapper } = mountComposable(
    () => ({ desktop: useSidebar(), mobile: useMobileSidebar() }),
    {
      render: () => h(AppHeader),
      stubs: { ...stubs, ModeSwitch: true },
    },
  )
  await wrapper.get('.app-header__left-side button').trigger('click')
  expect(result.desktop.collapsed.value).toBe(true)
  await wrapper.get('.app-header__left-side button').trigger('click')
  expect(result.desktop.collapsed.value).toBe(false)
  await wrapper.get('button[aria-label="Open mobile menu"]').trigger('click')
  expect(result.mobile.isOpen.value).toBe(true)
})

it('passes the shared collapsed state to all desktop sidebar sections', async () => {
  const { result, wrapper } = mountComposable(useSidebar, {
    render: () => h(AppSidebar),
    stubs: { AppLogo: true, AppNavigation: true, AppUser: true },
  })
  for (const component of [AppLogo, AppNavigation, AppUser]) {
    expect(wrapper.getComponent(component).props('collapsed')).toBe(false)
  }
  result.toggleCollapsed()
  await flushPromises()
  for (const component of [AppLogo, AppNavigation, AppUser]) {
    expect(wrapper.getComponent(component).props('collapsed')).toBe(true)
  }
})

it('opens the guest mobile menu and closes it when a header link navigates', async () => {
  const { result, wrapper } = mountComposable(useMobileSidebar, {
    render: () => h(GuestHeader),
    stubs: { ...stubs, GuestMobileSidePanel: true },
  })
  await wrapper.get('button[aria-label="Open mobile menu"]').trigger('click')
  expect(result.isOpen.value).toBe(true)
  wrapper.getComponent(AppLogo).vm.$emit('navigate')
  await flushPromises()
  expect(result.isOpen.value).toBe(false)
  result.open()
  wrapper.getComponent(AppAuthControls).vm.$emit('navigate')
  await flushPromises()
  expect(result.isOpen.value).toBe(false)
})

it.each([AppMobileSidePanel, GuestMobileSidePanel])(
  'closes a mobile panel after its sections navigate',
  async (component) => {
    const { result, wrapper } = mountComposable(useMobileSidebar, {
      render: () => h(component),
      stubs: { ...stubs, AppNavigation: true, AppUser: true },
    })
    const sections =
      component === AppMobileSidePanel
        ? [AppLogo, AppNavigation, AppUser]
        : [AppLogo, AppAuthControls]
    for (const section of sections) {
      result.open()
      await flushPromises()
      expect(wrapper.find('aside').exists()).toBe(true)
      wrapper.getComponent(section).vm.$emit('navigate')
      await flushPromises()
      expect(result.isOpen.value).toBe(false)
    }
    result.open()
    await flushPromises()
    wrapper.getComponent(BaseSidePanel).vm.$emit('update:modelValue', false)
    await flushPromises()
    expect(result.isOpen.value).toBe(false)
  },
)

it('switches between light, dark, and system preferences and updates selected choices', async () => {
  const { wrapper } = mountComposable(() => null, {
    render: () => h(ModeSwitch),
    stubs,
  })
  for (const [index, preference] of ['dark', 'light', 'system'].entries()) {
    await wrapper.findAll('button.dropdown__item')[index]!.trigger('click')
    expect(colorMode.preference).toBe(preference)
    expect(wrapper.findAll('.dropdown__item--selected')).toHaveLength(1)
  }
  colorMode.value = 'dark'
  await flushPromises()
  expect(wrapper.html()).toContain('lucide:moon')
})

it('renders user data and navigates home only after successful logout', async () => {
  const response = Promise.withResolvers<null>()
  api.mockReturnValue(response.promise)
  const collapsed = ref(false)
  const { wrapper, cache } = mountComposable(() => null, {
    render: () => h(AppUser, { collapsed: collapsed.value }),
    stubs,
    seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
  })
  expect(wrapper.get('.user-info__name').text()).toBe(user.username)
  collapsed.value = true
  await flushPromises()
  expect(wrapper.get('.user-info__name').classes()).toContain(
    'user-info__name--collapsed',
  )
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(wrapper.text()).toContain('Logging out...')
  expect(navigateTo).not.toHaveBeenCalled()
  response.resolve(null)
  await flushPromises()
  expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'index' })
  expect(wrapper.getComponent(AppUser).emitted('navigate')).toHaveLength(1)
  cache.setQueryData(AUTH_KEY.user(), null)
  await flushPromises()
  expect(wrapper.find('.user-info').exists()).toBe(false)
})

it('keeps the current route and emits no navigation when logout fails', async () => {
  api.mockImplementation((path) =>
    path === '/user'
      ? Promise.resolve(user)
      : Promise.reject(new Error('Logout failed')),
  )
  const { wrapper } = mountComposable(() => null, {
    render: () => h(AppUser),
    stubs,
    seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
  })
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(navigateTo).not.toHaveBeenCalled()
  expect(wrapper.getComponent(AppUser).emitted('navigate')).toBeUndefined()
  expect(wrapper.text()).toContain('Logout')
})

it('renders an optional navigation item without requiring an icon or children', () => {
  vi.spyOn(navigation, 'useAppNavigation').mockReturnValueOnce({
    navLinks: computed(() => [
      { id: 'custom', title: 'Settings', to: '/settings' },
    ]),
  })
  const { wrapper } = mountComposable(() => null, {
    render: () => h(AppNavigation),
    stubs,
  })
  expect(wrapper.get('a').text()).toBe('Settings')
  expect(wrapper.find('icon-stub').exists()).toBe(false)
  expect(wrapper.find('.nav__children').exists()).toBe(false)
})

it('renders a neutral theme icon during the ClientOnly placeholder phase', () => {
  const { wrapper } = mountComposable(() => null, {
    render: () => h(ModeSwitch),
    stubs: {
      ...stubs,
      ClientOnly: { template: '<slot name="placeholder" />' },
    },
  })
  expect(wrapper.get('button.btn--icon icon-stub').attributes('name')).toBe(
    'lucide:palette',
  )
})
