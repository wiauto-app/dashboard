import { apiGet, apiPost, fetchOptionalAuth } from "../api";
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
    return fetchOptionalAuth<TwoFactorChallengeState>(
      "/auth/admin/two-factor/challenge",
    );
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

  async requestAdminPasswordRecovery(email: string) {
    return apiPost<{ message: string }>("/auth/admin/password-recovery/request", {
      email,
    });
  },

  async changeAdminPasswordRecovery(token: string, password: string) {
    return apiPost<{ message: string }>("/auth/admin/password-recovery/change", {
      token,
      password,
    });
  },

  async logout() {
    return apiPost<{ message: string }>("/auth/admin/logout", {});
  },

  async getMe() {
    return apiGet<AuthUser>("/auth/me");
  },
};
