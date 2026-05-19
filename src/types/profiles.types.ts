import type { userParamsSchema } from "@/validations/queryParams/user-params.schema";
import type z from "zod";
import type { User } from "./user.types";
import type { Role } from "@/components/roles/types/role.types";


export interface Profile {
  id: string;
  user: User;
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


export type UserParams = z.infer<typeof userParamsSchema>;
