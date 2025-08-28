import { useNavigate } from 'react-router-dom';
import { tokenService } from './utils/tokenService';

export const useLogout = () => {
  const navigate = useNavigate();

  return () => {
    tokenService.removeAccessToken();
    tokenService.removeRefreshToken();
    navigate('/', { replace: true });
  };
};