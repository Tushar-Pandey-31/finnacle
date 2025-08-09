import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser, registerUser, setAuthToken } from '../services/backend';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      error: null,
      async register({ email, password }) {
        try {
          await registerUser({ email, password });
          set({ error: null });
          return true;
        } catch (e) {
          set({ error: e.response?.data?.error || e.message || 'Register failed' });
          return false;
        }
      },
      async login({ email, password }) {
        try {
          const res = await loginUser({ email, password });
          const token = res?.token;
          if (token) {
            setAuthToken(token);
            set({ token, email, error: null });
            return true;
          }
          set({ error: 'No token returned' });
          return false;
        } catch (e) {
          set({ error: e.response?.data?.error || e.message || 'Login failed' });
          return false;
        }
      },
      logout() {
        setAuthToken(null);
        set({ token: null, email: null });
      },
      init() {
        const t = get().token;
        if (t) setAuthToken(t);
      },
    }),
    { name: 'auth', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);