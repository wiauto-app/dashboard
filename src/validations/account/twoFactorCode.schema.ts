import { z } from "zod";

export const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .length(6, { error: "El código debe tener 6 dígitos." })
    .regex(/^\d+$/, { error: "El código debe contener solo números." }),
});

export type TwoFactorCodeSchema = z.infer<typeof twoFactorCodeSchema>;
