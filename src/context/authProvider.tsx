import { AuthContext } from "@/context/authContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/authServices/AuthService";
import type { AuthUser } from "@/types/auth.types";
import { isPasswordRecoveryRoute } from "@/lib/publicAuthRoutes";

const rejectNonAdminSession = async (user: AuthUser | undefined) => {
  if (!user || user.type !== "session") {
    return undefined;
  }

  if (!user.isAdmin) {
    await authService.logout();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/signIn")) {
      window.location.href = "/signIn";
    }
    return undefined;
  }

  return user;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOut, setIsLoginOut] = useState(false);
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
          const sessionUser = await rejectNonAdminSession(response.data);
          if (cancelled) {
            return;
          }
          setUser(sessionUser);
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
        const sessionUser = await rejectNonAdminSession(response.data);
        setUser(sessionUser);
      } else {
        setUser(undefined);
      }
    } catch {
      setUser(undefined);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoginOut(true);
      await authService.logout();
      setUser(undefined);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoginOut(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user: user?.id ? user : undefined,
      isLoading,
      isAuthenticated: Boolean(user?.id),
      refreshUser,
      logout,
      isLoginOut,
    }),
    [user, isLoading, refreshUser, logout, isLoginOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
