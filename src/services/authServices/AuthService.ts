import { apiGet, apiPost } from "../api";
import type {
  AdminLoginResponse,
  TwoFactorChallengeState,
  VerifyTwoFactorLoginResponse,
} from "@/types/auth.types";
import type { AuthUser } from "@/types/auth.types";

export const authService = {
  async login(email: string, password: string) {
    return apiPost<AdminLoginResponse>("/auth/admin/login", { email, password });
  },

  async getTwoFactorChallenge() {
    return apiGet<TwoFactorChallengeState>("/auth/admin/two-factor/challenge");
  },

  async verifyTwoFactor(code: string) {
    return apiPost<VerifyTwoFactorLoginResponse>("/auth/admin/verify-2fa", {
      code,
    });
  },

  async verifyBackupCode(code: string) {
    return apiPost<VerifyTwoFactorLoginResponse>(
      "/auth/admin/verify-backup-code",
      { code },
    );
  },

  async refreshToken() {
    return apiPost<{ token: string }>("/auth/admin/refresh", {});
  },

  async logout() {
    return apiPost<{ message: string }>("/auth/admin/logout", {});
  },

  async getMe() {
    return apiGet<AuthUser>("/auth/me");
  },
};
