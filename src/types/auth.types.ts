import type { AuthProvider } from "./account.types";

export interface AuthUser {
  id: string;
  email: string;
  providers: AuthProvider[];
  has_password: boolean;
  last_sign_in: string;
  created_at: string;
  name: string;
  last_name: string;
  avatar_url: string;
  type: "session" | "2fa_challenge";
  isAdmin?: boolean;
}

export type AdminLoginType = "session" | "2fa_required";

export interface AdminLoginResponse {
  message: string;
  data: {
    type: AdminLoginType;
    email: string;
  };
}

export interface TwoFactorChallengeState {
  email: string;
  type: "2fa_required";
}

export interface VerifyTwoFactorLoginResponse {
  message: string;
  data: {
    type: "session";
  };
}
