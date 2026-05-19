import { z } from "zod";
import { rolePermissionSchema } from "./role-permission.schema";


export const createRoleSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  is_admin: z.boolean(),
  is_developer: z.boolean(),
  permissions: z.array(rolePermissionSchema).optional(),
});

export const updateRoleSchema = createRoleSchema.partial();