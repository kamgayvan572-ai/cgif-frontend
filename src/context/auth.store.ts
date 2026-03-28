import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// ── Types ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BANNED';
  kycStatus: 'NONE' | 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  cluster?: { id: string; name: string } | null;
  clusterId?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  login:  (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setUser: (user: User) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// ── Axios instance avec intercepteur ────────────────────────
export const api = axios.create({ baseURL: API, withCredentials: false });

// Intercepteur : injecte le token et gère le refresh
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newToken = await useAuthStore.getState().refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

// ── Store ─────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch { /* silent */ }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;
        try {
          const { data } = await axios.post(`${API}/auth/refresh`, { refreshToken });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          return data.accessToken;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          return null;
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'cgif-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// ── Hooks ─────────────────────────────────────────────────────
export const useAuth = () => useAuthStore();
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN');
