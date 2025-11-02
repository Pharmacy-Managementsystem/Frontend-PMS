import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import api from "./api";
import Swal from "sweetalert2";

interface UseGetOptions {
  endpoint: string;
  queryKey: unknown[];
  params?: Record<string, unknown>;
  enabled?: boolean;
  logoutOn401?: boolean;
}

export function useGet<T = unknown>({
  endpoint,
  queryKey,
  params,
  enabled = true,
}: UseGetOptions): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.get<T>(endpoint, { params });
        return response.data;
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const errorMsg =
          err.response?.data?.message || err.message || "Unexpected Error";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });

        throw new Error(errorMsg);
      }
    },
    enabled,
  });
}
