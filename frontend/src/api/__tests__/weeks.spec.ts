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
    vi.restoreAllMocks();
  });

  describe('getWeeksQuery', () => {
    it('uses the correct cache key', () => {
      const options = getWeeksQuery() as any;
      expect(options.key).toEqual(WEEK_KEYS.all());
    });

    it('fetches the list of weeks', async () => {
      const mockData = [{ id: '1', name: 'Week 1', user_id: 'user1' }];
      mockApi.onGet('/weeks').reply(200, mockData);

      const options = getWeeksQuery() as any;
      const result = await options.query();
      expect(result).toEqual(mockData);
    });
  });

  describe('getWeekQuery', () => {
    it('uses a key scoped to the week id', () => {
      const id = 'week-123';
      const options = getWeekQuery(id) as any;
      expect(options.key).toEqual(WEEK_KEYS.detail(id));
    });

    it('fetches a single week by id', async () => {
      const id = '1';
      const mockData = { id: '1', name: 'Week 1', user_id: 'user1', week_days: [] };
      mockApi.onGet(`/weeks/${id}`).reply(200, mockData);

      const options = getWeekQuery(id) as any;
      const result = await options.query();
      expect(result).toEqual(mockData);
    });
  });

  describe('addWeekMutation', () => {
    const payload: WeekPayload = { name: 'New Week' };

    it('posts to /weeks and returns the created week', async () => {
      const mockResponse = { id: 'new-id', ...payload, user_id: 'user1' };
      mockApi.onPost('/weeks', payload).reply(201, mockResponse);

      const config = addWeekMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual(mockResponse);
    });

    describe('onMutate', () => {
      it('cancels in-flight queries and optimistically appends the new week', async () => {
        const previousWeeks = [{ id: '1', name: 'Existing', user_id: 'u' }];
        mockQueryCache.getQueryData.mockReturnValue(previousWeeks);

        const config = addWeekMutation() as any;
        const context = await config.onMutate(payload);

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
        expect(context).toEqual({ previousWeeks });

        const updater = mockQueryCache.setQueryData.mock.calls[0][1];
        const updated = updater(previousWeeks);
        expect(updated).toHaveLength(2);
        expect(updated[1]).toMatchObject({ ...payload, isPending: true });
      });

      it('treats missing cache data as an empty list', async () => {
        mockQueryCache.getQueryData.mockReturnValue(null);

        const config = addWeekMutation() as any;
        await config.onMutate(payload);

        const updater = mockQueryCache.setQueryData.mock.calls[0][1];
        const updated = updater(undefined);
        expect(updated).toHaveLength(1);
      });
    });

    describe('onError', () => {
      it('restores the previous cache when context is available', () => {
        const context = { previousWeeks: [{ id: '1', name: 'W', user_id: 'u' }] };

        const config = addWeekMutation() as any;
        config.onError(new Error('Failed'), payload, context);

        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
          WEEK_KEYS.all(),
          context.previousWeeks,
        );
      });

      it('does nothing when context is missing', () => {
        const config = addWeekMutation() as any;
        config.onError(new Error('Failed'), payload, {});
        expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
      });
    });

    describe('onSettled', () => {
      it('invalidates the weeks list', () => {
        const config = addWeekMutation() as any;
        config.onSettled();
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
      });
    });
  });

  describe('editWeekMutation', () => {
    const vars: EditWeek = { id: '1', payload: { name: 'Updated' } };

    it('patches /weeks/:id and returns the updated week', async () => {
      mockApi.onPatch(`/weeks/${vars.id}`, vars.payload).reply(200, { ...vars.payload });

      const config = editWeekMutation() as any;
      const result = await config.mutation(vars);
      expect(result).toEqual({ ...vars.payload });
    });

    describe('onMutate', () => {
      it('optimistically updates both the detail and list caches', async () => {
        const previousWeek = { id: '1', name: 'Old', user_id: 'u', week_days: [] };
        const previousWeeks = [
          { id: '1', name: 'Old', user_id: 'u' },
          { id: '2', name: 'Other', user_id: 'u' },
        ];
        mockQueryCache.getQueryData
          .mockReturnValueOnce(previousWeek)
          .mockReturnValueOnce(previousWeeks);

        const config = editWeekMutation() as any;
        const context = await config.onMutate(vars);

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({
          key: WEEK_KEYS.detail(vars.id),
        });
        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(WEEK_KEYS.detail(vars.id), {
          ...previousWeek,
          ...vars.payload,
        });
        expect(context).toEqual({ previous: previousWeek, previousWeeks });
      });

      it('maps updated name into the list', async () => {
        const previousWeeks = [
          { id: '1', name: 'Old', user_id: 'u' },
          { id: '2', name: 'Other', user_id: 'u' },
        ];
        mockQueryCache.getQueryData.mockReturnValue(previousWeeks);

        const config = editWeekMutation() as any;
        await config.onMutate(vars);

        const listUpdater = mockQueryCache.setQueryData.mock.calls.find(
          (call: any[]) => call[0].join(',') === WEEK_KEYS.all().join(','),
        )?.[1];
        const updatedList = listUpdater(previousWeeks);
        expect(updatedList[0].name).toBe('Updated');
        expect(updatedList[1].name).toBe('Other');
      });

      it('treats missing list cache as an empty array', async () => {
        mockQueryCache.getQueryData.mockReturnValue(null);

        const config = editWeekMutation() as any;
        await config.onMutate(vars);

        const listUpdater = mockQueryCache.setQueryData.mock.calls.find(
          (call: any[]) => call[0].join(',') === WEEK_KEYS.all().join(','),
        )?.[1];
        expect(listUpdater(undefined)).toEqual([]);
      });
    });

    describe('onError', () => {
      it('restores both caches when context is available', () => {
        const context = {
          previous: { id: '1', name: 'W', user_id: 'u', week_days: [] },
          previousWeeks: [{ id: '1', name: 'W', user_id: 'u' }],
        };

        const config = editWeekMutation() as any;
        config.onError(new Error('Fail'), vars, context);

        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
          WEEK_KEYS.detail(vars.id),
          context.previous,
        );
        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
          WEEK_KEYS.all(),
          context.previousWeeks,
        );
      });

      it('does nothing when context is missing', () => {
        const config = editWeekMutation() as any;
        config.onError(new Error('Fail'), vars, {});
        expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
      });
    });

    describe('onSettled', () => {
      it('invalidates both the list and the week detail', () => {
        const config = editWeekMutation() as any;
        config.onSettled(undefined, undefined, vars, {});

        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
          key: WEEK_KEYS.detail(vars.id),
        });
      });
    });
  });

  describe('deleteWeekMutation', () => {
    const id = '123';

    it('sends DELETE /weeks/:id', async () => {
      mockApi.onDelete(`/weeks/${id}`).reply(204, null);

      const config = deleteWeekMutation() as any;
      const result = await config.mutation(id);
      expect(result).toBeUndefined();
    });

    describe('onMutate', () => {
      it('optimistically removes the week from the list', async () => {
        const previousWeeks = [
          { id: '123', name: 'To Delete', user_id: 'u' },
          { id: '456', name: 'Keep', user_id: 'u' },
        ];
        mockQueryCache.getQueryData.mockReturnValue(previousWeeks);

        const config = deleteWeekMutation() as any;
        const context = await config.onMutate(id);

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
        expect(context).toEqual({ previousWeeks });

        const updater = mockQueryCache.setQueryData.mock.calls.find(
          (call: any[]) => call[0].join(',') === WEEK_KEYS.all().join(','),
        )?.[1];
        expect(updater(previousWeeks)).toEqual([{ id: '456', name: 'Keep', user_id: 'u' }]);
      });

      it('treats missing cache data as an empty list', async () => {
        mockQueryCache.getQueryData.mockReturnValue(null);

        const config = deleteWeekMutation() as any;
        await config.onMutate(id);

        const updater = mockQueryCache.setQueryData.mock.calls.find(
          (call: any[]) => call[0].join(',') === WEEK_KEYS.all().join(','),
        )?.[1];
        expect(updater(undefined)).toEqual([]);
      });
    });

    describe('onError', () => {
      it('restores the previous cache when context is available', () => {
        const context = { previousWeeks: [{ id: '123', name: 'W', user_id: 'u' }] };

        const config = deleteWeekMutation() as any;
        config.onError(new Error('Fail'), id, context);

        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
          WEEK_KEYS.all(),
          context.previousWeeks,
        );
      });

      it('does nothing when context is missing', () => {
        const config = deleteWeekMutation() as any;
        config.onError(new Error('Fail'), id, {});
        expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
      });
    });

    describe('onSettled', () => {
      it('invalidates both the list and the deleted week detail', () => {
        const config = deleteWeekMutation() as any;
        config.onSettled(undefined, undefined, id, {});

        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: WEEK_KEYS.all() });
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
          key: WEEK_KEYS.detail(id),
        });
      });
    });
  });
});
