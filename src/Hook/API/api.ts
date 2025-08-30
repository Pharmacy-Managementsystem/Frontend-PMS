

// src/Hook/API/api.ts
import axios from 'axios';
import { tokenService } from '../../services/utils/tokenService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Define proper types for the queue items
interface QueueItem {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = []; // Fixed: Added proper type annotation

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token as string);
  });
  failedQueue = [];
};


const isTokenExpiringSoon = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expTime - currentTime <= fiveMinutes;
  } catch {
    return true;
  }
};

// Request interceptor
api.interceptors.request.use(async (config) => {
  const token = tokenService.getAccessToken();
  
  if (token) {
    if (isTokenExpiringSoon(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshToken = tokenService.getRefreshToken();
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/tokens/refresh/`,
            { refresh: refreshToken }
          );
          
          tokenService.setAccessToken(data.access);
          tokenService.setRefreshToken(data.refresh);
          config.headers.Authorization = `Bearer ${data.access}`;
          processQueue(null, data.access);
        } catch (error) {
          processQueue(error, null);
          tokenService.removeAccessToken();
          tokenService.removeRefreshToken();
          window.location.href = '/';
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Response interceptor (keeps the existing 401 handling)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/tokens/refresh/`,
          { refresh: refreshToken }
        );

        tokenService.setAccessToken(data.access);
        tokenService.setRefreshToken(data.refresh);
        processQueue(null, data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        tokenService.removeAccessToken();
        tokenService.removeRefreshToken();
        if (failedQueue.length === 0) {
          window.location.href = '/';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;