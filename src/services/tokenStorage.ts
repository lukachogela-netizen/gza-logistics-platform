const TOKEN_KEY = 'gza.auth.token.v1';

export function readAccessToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function writeAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // The app can still operate in demo mode when browser storage is disabled.
  }
}
