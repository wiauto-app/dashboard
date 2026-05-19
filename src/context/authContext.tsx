import type { User } from "@/types/user.types";
import { createContext } from "react";

export type AuthContextValue = {
  user?: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);