import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useWeekStore } from './weeks';
import { apiClient } from '@/app/api/client';
import MockAdapter from 'axios-mock-adapter';
import type { UserWeek, UserWeekMinimal } from '@/app/api/types';

describe('weeks store', () => {
  let mockApiClient: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiClient = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mockApiClient.restore();
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const store = useWeekStore();
    expect(store.weeks).toEqual([]);
    expect(store.error).toBe(null);
    expect(store.isLoading).toBe(false);
    expect(store.isFetchingWeeks).toBe(false);
  });

  describe('fetchWeeks', () => {
    it('should fetch weeks successfully', async () => {
      const store = useWeekStore();
      const mockWeeks: UserWeekMinimal[] = [
        { id: '1', name: 'Week 1', user_id: 'u1' },
        { id: '2', name: 'Week 2', user_id: 'u1' },
      ];
      mockApiClient.onGet('/weeks').reply(200, mockWeeks);

      await store.fetchWeeks();

      expect(store.weeks).toEqual(mockWeeks);
      expect(store.isFetchingWeeks).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should handle error when fetching weeks fails', async () => {
      const store = useWeekStore();
      mockApiClient.onGet('/weeks').reply(500, { detail: 'Server Error' });

      await store.fetchWeeks();

      expect(store.weeks).toEqual([]);
      expect(store.isFetchingWeeks).toBe(false);
      expect(store.error).toBe('Server Error');
    });
  });

  describe('addWeek', () => {
    it('should add a week successfully', async () => {
      const store = useWeekStore();
      const newWeek: UserWeekMinimal = { id: '3', name: 'New Week', user_id: 'u1' };
      mockApiClient.onPost('/weeks', { name: 'New Week' }).reply(200, newWeek);

      await store.addWeek('New Week');

      expect(store.weeks).toContainEqual(newWeek);
      expect(store.error).toBe(null);
    });

    it('should handle error when adding a week fails', async () => {
      const store = useWeekStore();
      mockApiClient.onPost('/weeks').reply(400, { detail: 'Invalid name' });

      await store.addWeek('Invalid Week');

      expect(store.weeks).toEqual([]);
      expect(store.error).toBe('Invalid name');
    });
  });

  describe('removeWeek', () => {
    it('should remove a week successfully', async () => {
      const store = useWeekStore();
      const weekId = '1';
      store.weeks = [{ id: weekId, name: 'Week to remove', user_id: 'u1' }];
      mockApiClient.onDelete(`/weeks/${weekId}`).reply(200);

      await store.removeWeek(weekId);

      expect(store.weeks).toEqual([]);
      expect(store.error).toBe(null);
    });

    it('should handle error when removing a week fails', async () => {
      const store = useWeekStore();
      const weekId = '1';
      store.weeks = [{ id: weekId, name: 'Week', user_id: 'u1' }];
      mockApiClient.onDelete(`/weeks/${weekId}`).reply(500, { detail: 'Delete failed' });

      await store.removeWeek(weekId);

      expect(store.weeks).toHaveLength(1);
      expect(store.error).toBe('Delete failed');
    });
  });

  describe('updateWeek', () => {
    it('should update a week successfully', async () => {
      const store = useWeekStore();
      const weekId = '1';
      store.weeks = [
        { id: weekId, name: 'Week 1', user_id: 'u1' },
        { id: '2', name: 'Week 2', user_id: 'u1' },
      ];
      const updatedWeek: UserWeekMinimal = { id: weekId, name: 'New Name', user_id: 'u1' };
      mockApiClient.onPatch(`/weeks/${weekId}`, { name: 'New Name' }).reply(200, updatedWeek);

      const result = await store.updateWeek(weekId, 'New Name');

      expect(result).toEqual(updatedWeek);
      expect(store.weeks[0].name).toBe('New Name');
      expect(store.error).toBe(null);
    });

    it('should handle error when updating a week fails', async () => {
      const store = useWeekStore();
      const weekId = '1';
      store.weeks = [{ id: weekId, name: 'Old Name', user_id: 'u1' }];
      mockApiClient.onPatch(`/weeks/${weekId}`).reply(400, { detail: 'Update failed' });

      await store.updateWeek(weekId, 'New Name');

      expect(store.weeks[0].name).toBe('Old Name');
      expect(store.error).toBe('Update failed');
    });
  });

  describe('getWeek', () => {
    it('should get a week successfully', async () => {
      const store = useWeekStore();
      const weekId = '1';
      const mockWeek: UserWeek = {
        id: weekId,
        name: 'Fetched Week',
        user_id: 'u1',
        meal_slots: [],
      };
      mockApiClient.onGet(`/weeks/${weekId}`).reply(200, mockWeek);

      const result = await store.getWeek(weekId);

      expect(result).toEqual(mockWeek);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('should handle error when getting a week fails', async () => {
      const store = useWeekStore();
      const weekId = '1';
      mockApiClient
        .onGet(`/weeks/${weekId}`)
        .reply(409, { detail: `Week ${weekId} does not exist` });

      const result = await store.getWeek(weekId);

      expect(result).toBeUndefined();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(`Week ${weekId} does not exist`);
    });
  });

  describe('getWeekNameById', () => {
    it('should return the correct week name', () => {
      const store = useWeekStore();
      store.weeks = [
        { id: '1', name: 'Week One', user_id: 'u1' },
        { id: '2', name: 'Week Two', user_id: 'u1' },
      ];

      expect(store.getWeekNameById('1')).toBe('Week One');
      expect(store.getWeekNameById('2')).toBe('Week Two');
    });

    it('should return "404" if week is not found', () => {
      const store = useWeekStore();
      store.weeks = [{ id: '1', name: 'Week One', user_id: 'u1' }];

      expect(store.getWeekNameById('non-existent')).toBe('404');
    });
  });
});
