import type { suspendUserSchema } from "@/validations/resources/suspend-user.schema";
import { z } from "zod";

export interface User {
  id: string;
  email: string;
  last_sign_in: Date;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_backup_codes: string[] | null;
  is_suspended: boolean;
  suspended_at: Date | null;
  suspension_reason: string | null;
  suspension_end_time: Date | null;
  created_at: string;
}

export type SuspendUserSchema =  z.infer<typeof suspendUserSchema>