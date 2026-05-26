let googleScriptPromise: Promise<void> | null = null;

/**
 * Lazily loads the Google Identity Services script.
 * Subsequent calls reuse the same promise, so the script is appended at most once.
 *
 * @returns A promise that resolves when the script is ready or rejects on load failure.
 */
export const loadGoogleScript = async (): Promise<void> => {
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    // <script src="https://accounts.google.com/gsi/client" async defer></script>
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = (error) => {
      googleScriptPromise = null;
      script.remove();
      reject(error);
    };

    document.head.append(script);
  });

  return googleScriptPromise;
};

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/**
 * Composable that exposes Google OAuth utilities for the custom button flow.
 */
export const useGoogleAuth = () => {
  /**
   * Initializes the OAuth2 Code Client for a custom button flow.
   * This flow returns an authorization code that can be exchanged for tokens on the backend.
   *
   * @param callback - Function to handle the Google OAuth2 code response.
   * @returns A promise that resolves to the initialized Google CodeClient.
   * @throws {Error} If VITE_GOOGLE_CLIENT_ID is not configured in the environment.
   */
  const createCodeClient = async (
    callback: (response: google.accounts.oauth2.CodeResponse) => void,
  ) => {
    if (!CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID in env');
    }

    await loadGoogleScript();
    return window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback,
    });
  };

  return {
    createCodeClient,
  };
};
