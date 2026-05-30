import type z from "zod";
import type { dealershipParamsSchema } from "../schemas/dealership-params.schema";
import type { DealershipInvitation } from "./invitation.types";
import type { DealershipMember, DealershipMemberInput } from "./members.types";

export interface Dealership {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
  banner_url?: string;
  description: string;
  website_url?: string;
  email: string;
  phone_code: string;
  phone: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: Date;
  updated_at: Date;
  members: DealershipMember[];
  invitations: DealershipInvitation[];
}

export type DealershipParams = z.infer<typeof dealershipParamsSchema>;

export interface CreateDealershipPayload {
  name: string;
  slug: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  description: string;
  website_url?: string | null;
  email: string;
  phone_code: string;
  phone: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  members: DealershipMemberInput[];
}

export type UpdateDealershipPayload = Partial<CreateDealershipPayload>;