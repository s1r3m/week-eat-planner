import { defineStore } from 'pinia';

export const useClientIdStore = defineStore('clientId-store', {
  state: () => ({
    _clientId: null as string | null,
  }),
  actions: {
    getClientId(): string | null {
      if (!this._clientId) {
        this._clientId = crypto.randomUUID();
      }
      return this._clientId;
    },
  },
  persist: true,
});
