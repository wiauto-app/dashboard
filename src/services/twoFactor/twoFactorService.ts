import { apiGet, apiPost, type apiResponse } from "@/services/api";
import type {
  TwoFactorActivateResponse,
  TwoFactorRegenerateResponse,
  TwoFactorSetupResponse,
} from "@/types/account.types";

export const twoFactorService = {
  setup(): Promise<apiResponse<TwoFactorSetupResponse>> {
    return apiGet<TwoFactorSetupResponse>("/2fa/setup");
  },

  activate(code: string): Promise<apiResponse<TwoFactorActivateResponse>> {
    return apiPost<TwoFactorActivateResponse>("/2fa/activate", { code });
  },

  disable(code: string): Promise<apiResponse<{ message: string }>> {
    return apiPost<{ message: string }>("/2fa/disable", { code });
  },

  regenerateBackupCodes(): Promise<apiResponse<TwoFactorRegenerateResponse>> {
    return apiGet<TwoFactorRegenerateResponse>("/2fa/regenerate-backup-codes");
  },
};
