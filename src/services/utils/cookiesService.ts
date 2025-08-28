// utils/cookiesService.ts
import Cookies from 'js-cookie';

export const cookieService = {
  getCookie: (key: string) => Cookies.get(key),
  setCookie: (key: string, value: string, options = {}) =>
    Cookies.set(key, value, { path: '/', ...options }),
  deleteCookie: (key: string) => Cookies.remove(key),
};
