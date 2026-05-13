import type { User } from "@/interfaces/user.interface";
import { createContext } from "react";

export type AuthContextValue = {
  user?: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);