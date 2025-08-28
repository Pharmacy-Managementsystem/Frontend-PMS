import { useQuery } from '@tanstack/react-query';
import api from './api';
import { useState } from 'react';

interface UseGetOptions {
  endpoint: string;
  queryKey: any[];
  params?: Record<string, any>;
  enabled?: boolean;
  logoutOn401?: boolean;
}

export function useGet<T = any>({
  endpoint,
  queryKey,
  params,
  enabled = true,
}: UseGetOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.get(endpoint, { params });
        return response.data;
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Unexpected Error';
        setErrorMessage(errorMsg);
        throw new Error(errorMsg);
      }
    },
    enabled,
  });

  return {
    ...query,
    isLoading: query.isLoading,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
}