

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { useState } from 'react';

interface UseMutateOptions<T = any> {
  endpoint: string;
  method: 'post' | 'put' | 'patch';
  onSuccess?: (data: T) => void;
  invalidate?: any[];
  logoutOn401?: boolean;
}

export function useMutate<T = any>({
  endpoint,
  method,
  onSuccess,
  invalidate,
}: UseMutateOptions<T>) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation<T, Error, any>({
    mutationFn: async (data: any) => {
      try {
        const response = await api[method](endpoint, data);
        return response.data;
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Unexpected Error';
        setErrorMessage(errorMsg);
        throw new Error(errorMsg);
      }
    },
    onSuccess: (data) => {
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: invalidate });
      }
      if (onSuccess) onSuccess(data);
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
}
