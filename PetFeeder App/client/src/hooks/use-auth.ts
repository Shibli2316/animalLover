import { useState, useEffect } from "react";
import { authService, type AuthState } from "@/lib/auth";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    signInWithGoogle: authService.signInWithGoogle.bind(authService),
    signOut: authService.signOut.bind(authService)
  };
}
