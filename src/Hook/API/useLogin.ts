// hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { login } from "../../services/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};
