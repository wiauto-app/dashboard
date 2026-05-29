import { apiGet, apiPatch, type apiResponse } from "@/services/api";
import type { AccountSettings } from "@/types/account.types";
import type { MyProfileSchema } from "@/validations/account/myProfile.schema";
import type { UpdateEmailSchema } from "@/validations/account/updateEmail.schema";
import type { UpdatePasswordSchema } from "@/validations/account/updatePassword.schema";

type ApiMessageResponse = {
  message: string;
  data: null;
};

const getResponseMessage = <T>(
  response: apiResponse<T>,
  fallback: string,
): string => {
  if (response.message) {
    return response.message;
  }
  const nested = response.data as ApiMessageResponse | null;
  return nested?.message ?? fallback;
};

export const accountService = {
  getAccountSettings(): Promise<apiResponse<AccountSettings>> {
    return apiGet<AccountSettings>("/auth/me/account");
  },

  updateMyProfile(
    payload: MyProfileSchema,
  ): Promise<apiResponse<Record<string, unknown>>> {
    return apiPatch("/auth/me/profile", payload);
  },

  async updateMyEmail(
    payload: UpdateEmailSchema,
  ): Promise<apiResponse<ApiMessageResponse>> {
    return apiPatch<ApiMessageResponse>("/auth/me/email", payload);
  },

  async updateMyPassword(
    payload: UpdatePasswordSchema,
  ): Promise<apiResponse<ApiMessageResponse>> {
    return apiPatch<ApiMessageResponse>("/auth/me/password", payload);
  },

  getResponseMessage,
};
