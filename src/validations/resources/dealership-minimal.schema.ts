import { z } from "zod";

import { DEFAULT_PHONE_CODE } from "@/components/ui/phoneInput";

/** Datos mínimos para crear un concesionario desde el admin (alta de usuario o asignación de plan). */
export const dealershipMinimalSchema = z.object({
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

/** Borrador sin validar (el formulario lo valida solo cuando aplica). */
export const dealershipMinimalDraftSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.object({
    phone_code: z.string(),
    phone: z.string(),
  }),
  address: z.string(),
});

export type DealershipMinimalFormValues = z.infer<typeof dealershipMinimalSchema>;
export type DealershipMinimalDraft = z.infer<typeof dealershipMinimalDraftSchema>;

export const createEmptyDealershipMinimalDraft = (): DealershipMinimalDraft => ({
  name: "",
  email: "",
  phone: { phone_code: DEFAULT_PHONE_CODE, phone: "" },
  address: "",
});

/** Payload plano que espera el backend (`AdminDealershipMinimalDto`). */
export interface DealershipMinimalPayload {
  name: string;
  email: string;
  phone_code: string;
  phone: string;
  address: string;
}

export const toDealershipMinimalPayload = (
  draft: DealershipMinimalDraft,
): DealershipMinimalPayload => ({
  name: draft.name.trim(),
  email: draft.email.trim(),
  phone_code: draft.phone.phone_code,
  phone: draft.phone.phone,
  address: draft.address.trim(),
});
