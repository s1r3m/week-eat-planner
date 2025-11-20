import { defineStore } from 'pinia';

export const useClientIdStore = defineStore('clientId-store', () => {
  let clientId: string | null = null;

  const loadClientId = (): string | null => localStorage.getItem('client_id');
  const getClientId = (): string => {
    if (!clientId) {
      clientId = loadClientId() || crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
    }
    return clientId;
  };

  return {
    getClientId,
  };
});
