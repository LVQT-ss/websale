import { create } from 'zustand';
import api from '@/lib/api';
import type { User } from '@/lib/types';

// --------------- Types ---------------

interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

// --------------- Store ---------------

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  // State
  user: null,
  accessToken: null,
  isLoading: true,

  // Actions

  login: async (email, password) => {
    const res = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    const { user, accessToken } = res.data.data;
    set({ user, accessToken });
  },

  register: async (email, password, fullName, phone) => {
    const res = await api.post<LoginResponse>('/auth/register', {
      email,
      password,
      fullName,
      ...(phone ? { phone } : {}),
    });
    const { user, accessToken } = res.data.data;
    set({ user, accessToken });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — we clear state regardless
    } finally {
      set({ user: null, accessToken: null });
    }
  },

  refreshToken: async () => {
    try {
      const res = await api.post<LoginResponse>('/auth/refresh');
      const { accessToken } = res.data.data;
      set({ accessToken });
    } catch {
      get().clearAuth();
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      // Attempt a silent refresh first — the httpOnly cookie will be sent
      // automatically by the browser.
      const refreshRes = await api.post<LoginResponse>('/auth/refresh');
      const { user, accessToken } = refreshRes.data.data;
      set({ user, accessToken });
    } catch {
      // Not authenticated — that's fine
      set({ user: null, accessToken: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => set({ user: null, accessToken: null }),
}));
