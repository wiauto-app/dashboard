import { z } from "zod";

import { DEFAULT_CENTER } from "@/constants/map.constants";
import {
  isValidWebsiteUrlInput,
  normalizeWebsiteUrlForStorage,
} from "@/lib/validations/websiteUrl";

import type { Dealership, CreateDealershipPayload } from "../types/dealership.types";

const dealership_member_role_enum = z.enum(["owner", "admin", "member"]);

export const dealershipMemberSchema = z.object({
  profile_id: z.string().uuid({ message: "Selecciona un perfil válido" }),
  role: dealership_member_role_enum,
});

type DealershipMemberValues = z.infer<typeof dealershipMemberSchema>;

interface DealershipFormData {
  members: DealershipMemberValues[];
}

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
  name: z
    .string()
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  avatar_url: z
    .string()
    .trim()
    .min(1, { message: "La imagen de avatar es obligatoria" }),
  banner_url: z
    .string()
    .trim()
    .min(1, { message: "La imagen de banner es obligatoria" }),
  description: z.string().trim(),
  website_url: z
    .string()
    .trim()
    .refine((value) => isValidWebsiteUrlInput(value), {
      message: "Introduce una URL o dominio válido",
    }),
  email: z
    .string()
    .trim()
    .email({ message: "Introduce un correo electrónico válido" }),
  phone: z.object({
    phone_code: z
      .string()
      .min(1, { message: "El prefijo telefónico es obligatorio" }),
    phone: z
      .string()
      .min(6, { message: "El teléfono debe tener al menos 6 dígitos" }),
  }),
  show_phone: z.boolean(),
  address: z
    .string()
    .trim()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  lat: z.number({ error: "Selecciona una ubicación en el mapa" }),
  lng: z.number({ error: "Selecciona una ubicación en el mapa" }),
  is_featured: z.boolean().optional(),
  max_listings: z.coerce.number<number>().int().min(0).optional(),
  max_photos: z.coerce.number<number>().int().min(0).optional(),
  allow_videos: z.boolean().optional(),
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

export const EMPTY_DEALERSHIP_LOCATION = {
  lat: DEFAULT_CENTER.lat,
  lng: DEFAULT_CENTER.lng,
};

export const EMPTY_DEALERSHIP_FORM_VALUES: CreateDealershipFormValues = {
  name: "",
  avatar_url: "",
  banner_url: "",
  description: "",
  website_url: "",
  email: "",
  phone: { phone_code: "+34", phone: "" },
  show_phone: true,
  address: "",
  lat: DEFAULT_CENTER.lat,
  lng: DEFAULT_CENTER.lng,
  is_featured: false,
  max_listings: 3,
  max_photos: 6,
  allow_videos: false,
  members: [],
};

export const mapDealershipToFormValues = (
  dealership: Dealership,
): CreateDealershipFormValues => ({
  name: dealership.name,
  avatar_url: dealership.avatar_url ?? "",
  banner_url: dealership.banner_url ?? "",
  description: dealership.description ?? "",
  website_url: dealership.website_url ?? "",
  email: dealership.email,
  phone: {
    phone_code: dealership.phone_code?.trim() || "+34",
    phone: dealership.phone ?? "",
  },
  show_phone: dealership.show_phone ?? true,
  address: dealership.address,
  lat: dealership.lat ?? DEFAULT_CENTER.lat,
  lng: dealership.lng ?? DEFAULT_CENTER.lng,
  is_featured: dealership.is_featured,
  max_listings: dealership.max_listings ?? 3,
  max_photos: dealership.max_photos ?? 6,
  allow_videos: dealership.allow_videos ?? false,
  members: (dealership.members ?? []).map((member) => ({
    profile_id: member.profile_id,
    role: member.role,
  })),
});

export const mapDealershipFormToApiPayload = (
  values: CreateDealershipFormValues | UpdateDealershipFormValues,
): CreateDealershipPayload => {
  const websiteNormalized = normalizeWebsiteUrlForStorage(values.website_url);

  return {
    name: values.name.trim(),
    avatar_url: values.avatar_url.trim(),
    banner_url: values.banner_url.trim(),
    description: values.description.trim(),
    website_url: websiteNormalized ? websiteNormalized : null,
    email: values.email.trim(),
    phone_code: values.phone.phone_code,
    phone: values.phone.phone,
    show_phone: values.show_phone,
    address: values.address.trim(),
    lat: values.lat,
    lng: values.lng,
    is_featured: values.is_featured ?? false,
    max_listings: values.max_listings ?? 3,
    max_photos: values.max_photos ?? 6,
    allow_videos: values.allow_videos ?? false,
    members: values.members,
  };
};
