import { z } from "zod";

import { profileSchema } from "@/validations/resources/profile.schema";
import {
  dealershipMinimalDraftSchema,
  dealershipMinimalSchema,
} from "@/validations/resources/dealership-minimal.schema";

export const userSchema = z.object({
  email: z.email({ error: "Introduce un correo electrónico válido." }),
  password: z.string().min(8, {
    error: "La contraseña debe tener al menos 8 caracteres.",
  }),
});

export const updateUserSchema = z.object({
  email: z.email({ error: "Introduce un correo electrónico válido." }),
  password: z.string().optional(),
});

export const adminCreateUserFormSchema = userSchema
  .merge(profileSchema)
  .extend({
    createDealershipProfile: z.boolean(),
    dealership: dealershipMinimalDraftSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.createDealershipProfile) {
      return;
    }

    if (!data.dealership) {
      ctx.addIssue({
        code: "custom",
        message: "Completa los datos del concesionario.",
        path: ["dealership"],
      });
      return;
    }

    const parsed = dealershipMinimalSchema.safeParse(data.dealership);
    if (parsed.success) {
      return;
    }

    for (const issue of parsed.error.issues) {
      ctx.addIssue({
        ...issue,
        path: ["dealership", ...issue.path],
      });
    }
  });

export type UserSchema = z.infer<typeof userSchema>;
export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserFormSchema>;
export type AdminCreateUserDealershipFormValues = z.infer<
  typeof dealershipMinimalSchema
>;
