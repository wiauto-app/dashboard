import { z } from "zod";

const dealership_member_role_enum = z.enum(["owner", "admin", "member"]);

export const dealershipMemberSchema = z.object({
  profile_id: z.string().uuid({ message: "Selecciona un perfil válido" }),
  role: dealership_member_role_enum,
});

type DealershipMemberValues = z.infer<typeof dealershipMemberSchema>;

type DealershipFormData = {
  members: DealershipMemberValues[];
};

const validate_members = (data: DealershipFormData, ctx: z.RefinementCtx) => {
  const owner_count = data.members.filter(
    (member) => member.role === "owner",
  ).length;

  if (owner_count !== 1) {
    ctx.addIssue({
      code: "custom",
      message: "Debe haber exactamente un propietario",
      path: ["members"],
    });
  }

  const profile_ids = data.members.map((member) => member.profile_id);
  if (new Set(profile_ids).size !== profile_ids.length) {
    ctx.addIssue({
      code: "custom",
      message: "No puede haber miembros duplicados",
      path: ["members"],
    });
  }
};

const dealership_fields_schema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  slug: z.string().min(1, { message: "El slug es obligatorio" }),
  avatar_url: z.string().optional(),
  banner_url: z.string().optional(),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  website_url: z.string().optional(),
  email: z.string().email({ message: "Introduce un email válido" }),
  phone_code: z.string().min(1, { message: "El código de país es obligatorio" }),
  phone: z.string().min(1, { message: "El teléfono es obligatorio" }),
  address: z.string().min(1, { message: "La dirección es obligatoria" }),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  is_featured: z.boolean().optional(),
  members: z
    .array(dealershipMemberSchema)
    .min(1, { message: "Debe haber al menos un miembro" }),
});

export const createDealershipSchema = dealership_fields_schema.superRefine(
  validate_members,
);

export const updateDealershipSchema = dealership_fields_schema.superRefine(
  validate_members,
);

export type DealershipMemberFormValues = DealershipMemberValues;
export type CreateDealershipFormValues = z.infer<typeof createDealershipSchema>;
export type UpdateDealershipFormValues = z.infer<typeof updateDealershipSchema>;
