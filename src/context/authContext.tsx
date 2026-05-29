import type { AuthUser } from "@/types/auth.types";
import { createContext } from "react";

export type AuthContextValue = {
  user?: AuthUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);