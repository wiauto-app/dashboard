import type { Profile } from "@/types/profiles.types";
import type { Dealership } from "./dealership.types";


export interface DealershipInvitation {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  token_hash: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: Date;
  accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  dealership_id: string;
  invited_by_id: string;
  invited_by: Profile;
  dealership: Dealership;
}