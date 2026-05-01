import { describe, it, expect, vi, beforeEach } from 'vitest';

const appendSpy = vi.spyOn(document.head, 'append');

describe('useGoogleAuth', () => {
  beforeEach(() => {
    appendSpy.mockReset();
    vi.resetModules();
  });

  describe('loadGoogleScript', () => {
    it('appends the Google script tag to document.head on first call', async () => {
      appendSpy.mockImplementation((script: any) => {
        script.onload();
      });

      const { loadGoogleScript } = await import('../useGoogleAuth');
      await loadGoogleScript();

      expect(appendSpy).toHaveBeenCalledOnce();
      const script = appendSpy.mock.calls[0][0] as HTMLScriptElement;
      expect(script.src).toContain('accounts.google.com/gsi/client');
      expect(script.async).toBe(true);
      expect(script.defer).toBe(true);
    });

    it('reuses the existing promise on subsequent calls', async () => {
      appendSpy.mockImplementation((script: any) => {
        script.onload();
      });

      const { loadGoogleScript } = await import('../useGoogleAuth');
      await loadGoogleScript();
      await loadGoogleScript();

      expect(appendSpy).toHaveBeenCalledOnce();
    });

    it('rejects when the script fails to load', async () => {
      appendSpy.mockImplementation((script: any) => {
        script.onerror(new Error('network error'));
      });

      const { loadGoogleScript } = await import('../useGoogleAuth');
      await expect(loadGoogleScript()).rejects.toBeDefined();
    });
  });

  describe('createCodeClient', () => {
    it('calls initCodeClient after loading the Google script', async () => {
      appendSpy.mockImplementation((script: any) => {
        script.onload();
      });
      const initCodeClient = vi.fn().mockReturnValue({ requestCode: vi.fn() });
      Object.assign(window, {
        google: { accounts: { oauth2: { initCodeClient } } },
      });

      const { useGoogleAuth } = await import('../useGoogleAuth');
      const { createCodeClient } = useGoogleAuth();
      const callback = vi.fn();
      const client = await createCodeClient(callback);

      expect(initCodeClient).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback,
        }),
      );
      expect(client).toBeDefined();
    });
  });
});
