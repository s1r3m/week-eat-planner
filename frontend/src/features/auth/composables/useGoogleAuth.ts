let googleScriptPromise: Promise<void> | null = null;

export const loadGoogleScript = async (): Promise<void> => {
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    // <script src="https://accounts.google.com/gsi/client" async defer></script>
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = reject;

    document.head.append(script);
  });

  return googleScriptPromise;
};

const CLIENT_ID =
  '218612793791-n92qmv43m970cnp03qhtflchkrp6s8fr.apps.googleusercontent.com' as const;

export const useGoogleAuth = () => {
  /**
   * Initializes the OAuth2 Code Client for a custom button flow.
   * This flow returns an authorization code that can be exchanged for tokens on the backend.
   */
  const createCodeClient = async (
    callback: (response: google.accounts.oauth2.CodeResponse) => void,
  ) => {
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
