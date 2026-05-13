import type { userParamsSchema } from "@/validations/queryParams/user-params.schema";
import type z from "zod";


export interface Profile {
  id: string;
  // user: User;
  name?: string;
  last_name?: string;
  avatar_url: string;
  image_url: string;
  // vehicles: VehicleEntity[];
  role: Role | null;
  // reviews: ReviewEntity[];
  // dealership_members: DealershipMembersEntity[];
  // dealership_invitations: DealershipInvitationsEntity[];
}

export interface Role {
  id: string;
  name: string;
  is_admin: boolean;
  is_developer: boolean;
  is_default: boolean;
}

export type UserParams = z.infer<typeof userParamsSchema>;
