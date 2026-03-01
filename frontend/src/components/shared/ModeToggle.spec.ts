import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import * as vueuse from '@vueuse/core';
import type { UseColorModeReturn, BasicColorSchema } from '@vueuse/core';
import ModeToggle from './ModeToggle.vue';
import { MoonIcon, SunIcon } from 'lucide-vue-next';

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual('@vueuse/core');
  return {
    ...actual,
    useColorMode: vi.fn(),
  };
});

describe('ModeToggle', () => {
  it('updates theme when an option is selected', async () => {
    const store = ref<BasicColorSchema>('auto');
    const useColorModeMock = vi.mocked(vueuse.useColorMode).mockReturnValue({
      store,
    } as UseColorModeReturn<BasicColorSchema>);

    const wrapper = mount(ModeToggle);

    const vm = wrapper.vm as { menuValue: BasicColorSchema };
    expect(useColorModeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        selector: 'html',
        attribute: 'class',
        initialValue: 'auto',
        storageKey: 'week-eat-planner.theme',
      }),
    );
    expect(vm.menuValue).toBe('auto'); // Default value
    vm.menuValue = 'dark';
    expect(store.value).toBe('dark');
    vm.menuValue = 'light';
    expect(store.value).toBe('light');
  });

  it.each([
    { mode: 'light', component: SunIcon },
    { mode: 'dark', component: MoonIcon },
  ])('renders icons correctly for mode: $mode', ({ mode, component }) => {
    vi.mocked(vueuse.useColorMode).mockReturnValue({
      store: ref<BasicColorSchema>(mode as BasicColorSchema),
    } as UseColorModeReturn<BasicColorSchema>);

    const wrapper = mount(ModeToggle);

    expect(wrapper.findComponent(component).exists()).toBe(true);
  });

  it('renders dropdown menu items', () => {
    const store = ref<BasicColorSchema>('auto');
    vi.mocked(vueuse.useColorMode).mockReturnValue({
      store,
    } as UseColorModeReturn<BasicColorSchema>);

    const wrapper = mount(ModeToggle, {
      global: {
        stubs: {
          DropdownMenu: { template: '<div><slot /></div>' },
          DropdownMenuTrigger: { template: '<div><slot /></div>' },
          DropdownMenuContent: { template: '<div><slot /></div>' },
          DropdownMenuRadioGroup: {
            template: '<div class="radio-group-stub"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          DropdownMenuRadioItem: {
            template: '<div class="radio-item-stub"><slot /></div>',
            props: ['value'],
          },
        },
      },
    });

    expect(wrapper.html()).toContain('Light');
    expect(wrapper.html()).toContain('Dark');
    expect(wrapper.html()).toContain('System');

    const radioGroupComp = wrapper.find('.radio-group-stub');
    expect(radioGroupComp.exists()).toBe(true);

    const radioItems = wrapper.findAll('.radio-item-stub');
    expect(radioItems).toHaveLength(3);
    expect(radioItems[0].text()).toBe('Light');
    expect(radioItems[1].text()).toBe('Dark');
    expect(radioItems[2].text()).toBe('System');

    const radioGroupVm = wrapper.findComponent<any>('.radio-group-stub').vm;
    radioGroupVm.$emit('update:modelValue', 'dark');
    expect(store.value).toBe('dark');
  });
});
