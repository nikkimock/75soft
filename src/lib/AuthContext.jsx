import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) setUser(currentUser);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      logout: base44.auth.logout,
      navigateToLogin: base44.auth.redirectToLogin,
      checkAppState: async () => {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      },
    }),
    [user, isLoadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
