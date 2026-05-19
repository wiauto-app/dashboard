import { z } from "zod";

export const suspensionDurationSchema = z.object({
  key: z.string(),
  label: z.string(),
  duration_ms: z.string().nullable(),
  is_active: z.boolean(),
});

