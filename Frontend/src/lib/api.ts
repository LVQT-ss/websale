import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------- Request interceptor ---------------
// Attach the in-memory access token to every request if available.

api.interceptors.request.use((config) => {
  // Lazy-import to avoid circular dependency with auth-store
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require('@/lib/stores/auth-store');
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --------------- Response interceptor ---------------
// On 401, attempt a silent token refresh. If that also fails, clear auth
// state and redirect to /login.

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that are NOT the refresh call itself
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthStore } = require('@/lib/stores/auth-store');

      const res = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken: string = res.data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthStore } = require('@/lib/stores/auth-store');
      useAuthStore.getState().clearAuth();

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
