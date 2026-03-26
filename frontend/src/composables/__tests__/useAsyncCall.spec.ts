import { describe, it, expect, vi } from 'vitest';
import { useAsyncCall } from '../useAsyncCall';

describe('useAsyncCall', () => {
  it('should have initial state', () => {
    const task = vi.fn();
    const { isLoading, error } = useAsyncCall(task);

    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(null);
  });

  it('should handle successful task', async () => {
    const task = vi.fn().mockResolvedValue('success');
    const { call, isLoading, error } = useAsyncCall(task);

    const callPromise = call();
    expect(isLoading.value).toBe(true);

    const result = await callPromise;

    expect(result).toBe('success');
    expect(isLoading.value).toBe(false);
    expect(error.value).toBe(null);
  });

  it('should handle failed task', async () => {
    const task = vi.fn().mockRejectedValue(new Error('failure'));
    const { call, isLoading, error } = useAsyncCall(task);

    await call();

    expect(isLoading.value).toBe(false);
    expect(error.value).toEqual(new Error('failure'));
  });

  it('should reset error on subsequent call', async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error('failure'))
      .mockResolvedValueOnce('success');
    const { call, error } = useAsyncCall(task);

    await call();
    expect(error.value).toBeInstanceOf(Error);

    const callPromise = call();
    expect(error.value).toBe(null);

    await callPromise;
    expect(error.value).toBe(null);
  });
});
