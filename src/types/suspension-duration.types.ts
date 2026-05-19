import type { suspensionDurationSchema } from "@/validations/resources/suspension-duration.schema";
import type z from "zod";


export interface SuspensionDurationType {
  id: string;
  key: string;
  label: string;
  duration_ms: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export type SuspensionDurationTypeSchema = z.infer<typeof suspensionDurationSchema>;