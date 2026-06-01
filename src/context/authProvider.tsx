import { AuthContext } from "@/context/authContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/authServices/AuthService";
import { useNavigate } from "@tanstack/react-router";
import type { AuthUser } from "@/types/auth.types";
import { isPasswordRecoveryRoute } from "@/lib/publicAuthRoutes";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      setIsLoading(true);

      if (isPasswordRecoveryRoute()) {
        setUser(undefined);
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (cancelled) {
          return;
        }
        if (
          response.ok &&
          response.data?.id &&
          response.data.type === "session"
        ) {
          setUser(response.data as AuthUser);
        } else {
          setUser(undefined);
        }
      } catch {
        if (!cancelled) {
          setUser(undefined);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (
        response.ok &&
        response.data?.id &&
        response.data.type === "session"
      ) {
        setUser(response.data);
      } else {
        setUser(undefined);
      }
    } catch {
      setUser(undefined);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(undefined);
    navigate({ to: "/signIn/" });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user: user?.id ? user : undefined,
      isLoading,
      isAuthenticated: Boolean(user?.id),
      refreshUser,
      logout,
    }),
    [user, isLoading, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
