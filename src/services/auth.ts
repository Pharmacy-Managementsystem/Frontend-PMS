

// services/auth.ts
import axios from 'axios';
import { tokenService } from './utils/tokenService';

type LoginBody = {
  username: string;
  password: string;
};

export const login = async (body: LoginBody) => {
  const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user-auth/login/`, body);

  tokenService.setAccessToken(data.access);
  tokenService.setRefreshToken(data.refresh);

  return data;
};
