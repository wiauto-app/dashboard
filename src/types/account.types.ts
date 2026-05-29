export type AuthProvider = "local" | "google" | "apple";

export interface AccountSettings {
  id: string;
  email: string;
  provider: AuthProvider;
  name: string;
  last_name: string | null;
  avatar_url: string | null;
  last_sign_in: string | null;
  created_at: string;
  two_factor_enabled: boolean;
  is_email_verified: boolean;
  backup_codes_remaining: number;
}

export interface TwoFactorSetupResponse {
  qr_code_data_url: string;
  otpauth_url: string;
}

export interface TwoFactorActivateResponse {
  verified: boolean;
  message: string;
  backup_codes?: string[];
}

export interface TwoFactorRegenerateResponse {
  message: string;
  backup_codes: string[];
}
