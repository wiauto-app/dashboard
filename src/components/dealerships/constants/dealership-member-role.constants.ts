import type { DealershipMemberRole } from "../types/members.types";

export const DEALERSHIP_MEMBER_ROLE_OPTIONS: {
  value: DealershipMemberRole;
  label: string;
}[] = [
  { value: "owner", label: "Propietario" },
  { value: "admin", label: "Administrador" },
  { value: "member", label: "Miembro" },
];
