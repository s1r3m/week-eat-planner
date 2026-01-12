import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlertStore } from './error';

describe('error store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have initial state', () => {
    const store = useAlertStore();
    expect(store.isEmpty).toBe(true);
  });

  it('should add an error', () => {
    const store = useAlertStore();
    store.addError('Something went wrong');
    expect(store.isEmpty).toBe(false);
  });

  it('should clear errors', () => {
    const store = useAlertStore();
    store.addError('Error 1');
    store.clearErrors();
    expect(store.isEmpty).toBe(true);
  });

  it('should get all errors and clear them', () => {
    const store = useAlertStore();
    store.addError('Error 1');
    store.addError('Error 2');

    const errors = store.getAllErrors();
    expect(errors).toEqual(['Error 1', 'Error 2']);
    expect(store.isEmpty).toBe(true);
  });
});
