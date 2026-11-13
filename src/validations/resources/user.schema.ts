import { z } from "zod";

import { profileSchema } from "@/validations/resources/profile.schema";

const adminCreateUserDealershipSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre del concesionario es obligatorio." }),
  email: z
    .string()
    .trim()
    .email({ message: "Introduce un correo electrónico válido." }),
  phone: z.object({
    phone_code: z
      .string()
      .min(1, { message: "El prefijo telefónico es obligatorio." }),
    phone: z
      .string()
      .regex(/^\d{6,}$/, {
        message: "El teléfono debe tener al menos 6 dígitos.",
      }),
  }),
  address: z
    .string()
    .trim()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
});

const adminCreateUserDealershipDraftSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.object({
    phone_code: z.string(),
    phone: z.string(),
  }),
  address: z.string(),
});

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
    dealership: adminCreateUserDealershipDraftSchema.optional(),
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

    const parsed = adminCreateUserDealershipSchema.safeParse(data.dealership);
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
  typeof adminCreateUserDealershipSchema
>;
