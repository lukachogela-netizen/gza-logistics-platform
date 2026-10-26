import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../services/authService';
import { writeAccessToken } from '../services/tokenStorage';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setSession: (token: string, user: AuthUser) => void;
  updateBalance: (balance: number) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    token: null,
    setSession: (token, user) => {
      writeAccessToken(token);
      set({ token, user });
    },
    updateBalance: (balance) => set((state) => ({ user: state.user ? { ...state.user, balance } : null })),
    signOut: () => {
      writeAccessToken(null);
      set({ token: null, user: null });
    },
  }),
  {
    name: 'gza.auth.state.v1',
    partialize: (state) => ({ token: state.token, user: state.user }) as AuthState,
    onRehydrateStorage: () => (state) => {
      writeAccessToken(state?.token ?? null);
    },
  },
));
