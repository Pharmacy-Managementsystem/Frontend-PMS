// useApiMutate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import api from './api';
import Swal from 'sweetalert2';

interface UseMutateOptions<TData> {
  endpoint: string;
  method: 'post' | 'put' | 'patch' | 'delete';
  onSuccess?: (data: TData) => void;
  invalidate?: unknown[];
  logoutOn401?: boolean;
}

// Custom return type that includes isLoading for backward compatibility
type CustomMutationResult<TData, TVariables> = UseMutationResult<TData, Error, TVariables> & {
  isLoading: boolean;
};

export function useMutate<TData = unknown, TVariables = Record<string, unknown>>({
  endpoint,
  method,
  onSuccess,
  invalidate,
}: UseMutateOptions<TData>): CustomMutationResult<TData, TVariables> {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        let payload: unknown = variables;
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (variables && typeof variables === 'object') {
          const hasFile = Object.values(variables).some(
            (val) => val instanceof File || val instanceof Blob
          );

          if (hasFile) {
            const formData = new FormData();

            Object.entries(variables as Record<string, unknown>).forEach(([key, value]) => {
              if (value instanceof File || value instanceof Blob) {
                formData.append(key, value);
              } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
              } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
              }
            });

            payload = formData;
            headers = {};
          }
        }

        const response = await api<TData>({
          method,
          url: endpoint,
          data: payload,
          headers,
        });

        return response.data;
      } catch (error: unknown) {
        const err = error as { 
          response?: { 
            data?: { 
              errors?: Record<string, string[]> | string;
              message?: string;
            } 
          }; 
          message?: string;
        };
        
        let errorMessage = 'Unexpected Error';
        
        if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
          errorMessage = 'Please fill in all required fields correctly.';
        } 
        else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        else if (err.message) {
          errorMessage = err.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK'
        });

        console.log('API Error:', error);
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data: TData) => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Operation completed successfully!',
      });

      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: invalidate });
      }
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(data);
      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
}