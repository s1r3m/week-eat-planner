import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthSocialButtons from '../AuthSocialButtons.vue';

describe('AuthSocialButtons', () => {
  const mountComponent = () => {
    return mount(AuthSocialButtons, {
      global: {
        stubs: {
          Button: {
            template:
              '<button :disabled="disabled" variant="outline" class="w-full"><slot /></button>',
            props: ['disabled', 'variant'],
          },
        },
      },
    });
  };

  it('renders the OAuth container', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('#oauth-container').exists()).toBe(true);
  });

  it('renders Google and Facebook buttons', () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain('Google');
    expect(buttons[1].text()).toContain('Facebook');
  });

  it('disables both OAuth buttons', () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll('button');

    expect(buttons[0].attributes('disabled')).toBeDefined();
    expect(buttons[1].attributes('disabled')).toBeDefined();
  });

  it('applies correct styling classes', () => {
    const wrapper = mountComponent();
    const container = wrapper.find('#oauth-container');

    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('flex-col');
    expect(container.classes()).toContain('gap-3');
  });
});
