import z from "zod";
import { rolesParamsSchema } from "../schemas/roles-params.schema";
import type { createRoleSchema, updateRoleSchema } from "../schemas/role-form.schema";
import type { Permission } from "@/components/permissions/types/permission.type";

export interface RolePermission {
  role_id: string;
  permission_id: string;
  permission: Permission;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  is_admin: boolean;
  is_developer: boolean;
  is_default: boolean;
  roles_permissions: RolePermission[];
}

export type RolesParams = z.infer<typeof rolesParamsSchema>;

export type CreateRole = z.infer<typeof createRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;