import type { Profile } from "@/types/profiles.types";
import type { Dealership } from "./dealership.types";

export type DealershipMemberRole = "owner" | "admin" | "member";

export interface DealershipMemberProfile {
  id: string;
  name?: string;
  last_name?: string;
  avatar_url?: string;
  user?: {
    email: string;
  };
}

export interface DealershipMember {
  id?: string;
  dealership_id?: string;
  profile_id: string;
  role: DealershipMemberRole;
  created_at?: Date;
  updated_at?: Date;
  dealership?: Dealership;
  profile?: DealershipMemberProfile | Profile;
}

export interface DealershipMemberInput {
  profile_id: string;
  role: DealershipMemberRole;
}
