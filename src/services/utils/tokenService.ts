

// utils/tokenService.ts
import { cookieService } from './cookiesService';

export const tokenService = {
  getAccessToken: () => localStorage.getItem('access'),
  setAccessToken: (token: string) => localStorage.setItem('access', token),
  removeAccessToken: () => localStorage.removeItem('access'),

  getRefreshToken: () => cookieService.getCookie('refresh'),
  setRefreshToken: (token: string) => cookieService.setCookie('refresh', token),
  removeRefreshToken: () => cookieService.deleteCookie('refresh'),
};
