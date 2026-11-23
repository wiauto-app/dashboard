import type { userParamsSchema } from "@/validations/queryParams/user-params.schema";
import type z from "zod";
import type { User } from "./user.types";

export interface Profile {
  id: string;
  user: User;
  name?: string;
  last_name?: string;
  avatar_url: string;
  image_url: string;
  phone_code?: string | null;
  phone?: string | null;
  /** Solo en el listado admin. */
  dealership?: ProfileDealership | null;
  /** Solo en el listado admin: acceso gratuito vigente. */
  active_grant?: ProfileActiveGrant | null;
  // vehicles: VehicleEntity[];
  // reviews: ReviewEntity[];
  // dealership_members: DealershipMembersEntity[];
  // dealership_invitations: DealershipInvitationsEntity[];
}


export type DealershipMemberRole = "owner" | "admin" | "member";

export interface ProfileDealership {
  id: string;
  name: string;
  slug: string;
  role: DealershipMemberRole;
}

export interface ProfileActiveGrant {
  plan_id: string;
  plan_name: string;
  expires_at: string | null;
}

export type UserParams = z.infer<typeof userParamsSchema>;
