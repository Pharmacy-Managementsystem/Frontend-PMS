import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  username: string;
  email: string;
  is_superuser: boolean;
}

export function useDecodedToken() {
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("access");
      if (token) {
        setDecodedToken(jwtDecode(token));
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  return decodedToken;
}
