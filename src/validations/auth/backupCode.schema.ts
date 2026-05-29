import { z } from "zod";

export const backupCodeSchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
      error: "El código debe tener el formato XXXX-XXXX.",
    }),
});

export type BackupCodeSchema = z.infer<typeof backupCodeSchema>;

export const formatBackupCode = (raw_value: string): string => {
  const normalized = raw_value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (normalized.length <= 4) {
    return normalized;
  }
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}`;
};
