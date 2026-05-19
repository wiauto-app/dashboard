import type { Profile } from "@/types/profiles.types";
import type { Dealership } from "./dealership.types";

export interface DealershipMember {
  id: string;
  dealership_id: string;
  profile_id: string;
  role: "owner" | "admin" | "member";
  created_at: Date;
  updated_at: Date;
  dealership: Dealership;
  profile: Profile;
}