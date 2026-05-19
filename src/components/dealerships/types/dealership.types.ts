import type z from "zod";
import type { dealershipParamsSchema } from "../schemas/dealership-params.schema";
import type { DealershipInvitation } from "./invitation.types";
import type { DealershipMember } from "./members.types";

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