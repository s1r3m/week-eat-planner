import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { apiClient } from '../client';
import {
  getWeeksQuery,
  getWeekQuery,
  addWeekMutation,
  editWeekMutation,
  deleteWeekMutation,
  WEEK_KEYS,
} from '../weeks';
import type { WeekPayload, EditWeek } from '../weeks';

// Mock @pinia/colada
const mockQueryCache = {
  cancelQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
};

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
  useQueryCache: () => mockQueryCache,
}));

vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    accessToken: 'test-token',
  })),
}));

describe('weeks api', () => {
  let mockApi: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockApi.restore();
    vi.clearAllMocks();
  });

  describe('getWeeksQuery', () => {
    it('should have correct key', () => {
      const options = getWeeksQuery();
      expect(options.key).toEqual(WEEK_KEYS.all());
    });

    it('should fetch weeks', async () => {
      const mockData = [{ id: '1', name: 'Week 1', user_id: 'user1' }];
      mockApi.onGet('/weeks').reply(200, mockData);

      const options = getWeeksQuery();
      const result = await (options.query as any)();

      expect(result).toEqual(mockData);
    });
  });

  describe('getWeekQuery', () => {
    it('should have correct dynamic key', () => {
      const id = 'week-123';
      const options = getWeekQuery(id);
      expect(options.key).toEqual(WEEK_KEYS.detail(id));
    });

    it('should fetch a single week', async () => {
      const id = '1';
      const mockData = { id: '1', name: 'Week 1', user_id: 'user1', week_days: [] };
      mockApi.onGet(`/weeks/${id}`).reply(200, mockData);

      const options = getWeekQuery(id);
      const result = await (options.query as any)();

      expect(result).toEqual(mockData);
    });
  });

  describe('addWeekMutation', () => {
    const payload: WeekPayload = { name: 'New Week' };

    it('should call POST /weeks', async () => {
      const mockResponse = { id: 'new-id', ...payload, user_id: 'user1' };
      mockApi.onPost('/weeks', payload).reply(201, mockResponse);

      const mutation = addWeekMutation();
      const result = await mutation.mutation(payload);

      expect(result).toEqual(mockResponse);
    });

    it('should perform optimistic update in onMutate', async () => {
      const mutation = addWeekMutation();
      const previousWeeks = [{ id: '1', name: 'Existing' }];
      mockQueryCache.getQueryData.mockReturnValue(previousWeeks);

      const context = await mutation.onMutate(payload);

      expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        expect.any(Function),
      );
      expect(context).toEqual({ previousWeeks });

      // Test the updater function passed to setQueryData
      const updater = mockQueryCache.setQueryData.mock.calls[0][1];
      const updated = updater(previousWeeks);
      expect(updated).toHaveLength(2);
      expect(updated[1]).toMatchObject({ ...payload, isPending: true });
    });

    it('should log success in onSuccess', () => {
      const mutation = addWeekMutation();
      const newWeek = { id: '123', name: 'Test', user_id: 'u1' };
      mutation.onSuccess(newWeek, payload, {});
      expect(console.debug).toHaveBeenCalledWith('Week 123 has been created!');
    });

    it('should handle error and restore cache in onError', () => {
      const mutation = addWeekMutation();
      const error = new Error('Failed');
      const context = { previousWeeks: [{ id: '1', name: 'W', user_id: 'u' }] };

      mutation.onError(error, payload, context);

      expect(console.error).toHaveBeenCalled();
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        context.previousWeeks,
      );
    });

    it('should handle error when previousWeeks is missing in onError', () => {
      const mutation = addWeekMutation();
      const error = new Error('Failed');

      mutation.onError(error, payload, {});

      expect(console.error).toHaveBeenCalled();
      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('should handle empty old data in updater function for onMutate', async () => {
      const mutation = addWeekMutation();
      mockQueryCache.getQueryData.mockReturnValue(null);

      await mutation.onMutate(payload);

      const updater = mockQueryCache.setQueryData.mock.calls[0][1];
      const updated = updater(); // Call with undefined
      expect(updated).toHaveLength(1);
    });

    it('should invalidate queries in onSettled', () => {
      const mutation = addWeekMutation();
      mutation.onSettled();
      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
    });
  });

  describe('editWeekMutation', () => {
    const vars: EditWeek = { id: '1', payload: { name: 'Updated' } };

    it('should call PATCH /weeks/:id', async () => {
      mockApi.onPatch(`/weeks/${vars.id}`, vars.payload).reply(200, { ...vars.payload });

      const mutation = editWeekMutation();
      const result = await mutation.mutation(vars);

      expect(result).toEqual({ ...vars.payload });
    });

    it('should perform optimistic updates in onMutate', async () => {
      const mutation = editWeekMutation();
      const previousWeek = { id: '1', name: 'Old' };
      const previousWeeks = [
        { id: '1', name: 'Old' },
        { id: '2', name: 'Other' },
      ];

      mockQueryCache.getQueryData
        .mockReturnValueOnce(previousWeek) // for detail
        .mockReturnValueOnce(previousWeeks); // for list

      const context = await mutation.onMutate(vars);

      expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.detail(vars.id) });
      expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });

      // Check detail update
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(WEEK_KEYS.detail(vars.id), {
        ...previousWeek,
        ...vars.payload,
      });

      // Check list update
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        expect.any(Function),
      );
      const listUpdater = mockQueryCache.setQueryData.mock.calls.find(
        (call) => call[0].join(',') === WEEK_KEYS.all().join(','),
      )?.[1];
      const updatedList = listUpdater(previousWeeks);
      expect(updatedList[0].name).toBe('Updated');

      expect(context).toEqual({ previous: previousWeek, previousWeeks });
    });

    it('should log success in onSuccess', () => {
      const mutation = editWeekMutation();
      mutation.onSuccess({ id: '1', name: 'U', user_id: '1' }, vars);
      expect(console.debug).toHaveBeenCalledWith('A week 1 has been updated.');
    });

    it('should restore cache on error in onError', () => {
      const mutation = editWeekMutation();
      const context = {
        previous: { id: '1', name: 'W', user_id: 'u', week_days: [] },
        previousWeeks: [{ id: '1', name: 'W', user_id: 'u' }],
      };

      mutation.onError(new Error('Fail'), vars, context);

      expect(console.error).toHaveBeenCalled();
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.detail(vars.id),
        context.previous,
      );
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        context.previousWeeks,
      );
    });

    it('should handle missing context in onError', () => {
      const mutation = editWeekMutation();
      mutation.onError(new Error('Fail'), vars, {});

      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('should handle empty old data in updater function for list in onMutate', async () => {
      const mutation = editWeekMutation();
      mockQueryCache.getQueryData.mockReturnValue(null);

      await mutation.onMutate(vars);

      const listUpdaterCall = mockQueryCache.setQueryData.mock.calls.find(
        (call) => call[0].join(',') === WEEK_KEYS.all().join(','),
      );
      const updatedList = listUpdaterCall?.[1](); // Call with undefined
      expect(updatedList).toEqual([]);
    });

    it('should invalidate queries in onSettled', () => {
      const mutation = editWeekMutation();
      mutation.onSettled(undefined as any, undefined, vars, {});
      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
        key: WEEK_KEYS.detail(vars.id),
      });
    });
  });

  describe('deleteWeekMutation', () => {
    const id = '123';

    it('should call DELETE /weeks/:id', async () => {
      mockApi.onDelete(`/weeks/${id}`).reply(200, null);

      const mutation = deleteWeekMutation();
      const result = await mutation.mutation(id);

      expect(result).toBeUndefined();
    });

    it('should perform optimistic update in onMutate', async () => {
      const mutation = deleteWeekMutation();
      const previousWeeks = [
        { id: '123', name: 'To Delete' },
        { id: '456', name: 'Keep' },
      ];
      mockQueryCache.getQueryData.mockReturnValue(previousWeeks);

      const context = await mutation.onMutate(id);

      expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        expect.any(Function),
      );

      // Test the updater function
      const updater = mockQueryCache.setQueryData.mock.calls.find(
        (call) => call[0].join(',') === WEEK_KEYS.all().join(','),
      )?.[1];
      const updated = updater(previousWeeks);
      expect(updated).toEqual([{ id: '456', name: 'Keep' }]);

      expect(context).toEqual({ previousWeeks });
    });

    it('should log success in onSuccess', () => {
      const mutation = deleteWeekMutation();
      mutation.onSuccess(undefined, id, {});
      expect(console.debug).toHaveBeenCalledWith('Week 123 has been deleted');
    });

    it('should restore cache on error in onError', () => {
      const mutation = deleteWeekMutation();
      const context = { previousWeeks: [{ id: '123', name: 'W', user_id: 'u' }] };

      mutation.onError(new Error('Fail'), id, context);

      expect(console.error).toHaveBeenCalled();
      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        context.previousWeeks,
      );
    });

    it('should handle missing context in onError', () => {
      const mutation = deleteWeekMutation();
      mutation.onError(new Error('Fail'), id, {});

      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('should handle empty old data in onMutate', async () => {
      const mutation = deleteWeekMutation();
      mockQueryCache.getQueryData.mockReturnValue(null);

      await mutation.onMutate(id);

      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.all(),
        expect.any(Function),
      );

      // Test the updater function
      const updater = mockQueryCache.setQueryData.mock.calls.find(
        (call) => call[0].join(',') === WEEK_KEYS.all().join(','),
      )?.[1];
      const updated = updater();
      expect(updated).toEqual([]);
    });

    it('should invalidate queries in onSettled', () => {
      const mutation = deleteWeekMutation();

      mutation.onSettled(undefined, undefined, id, {});

      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.detail(id) });
    });
  });
});
