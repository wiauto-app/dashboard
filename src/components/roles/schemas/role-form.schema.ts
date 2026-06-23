import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  is_admin: z.boolean(),
  is_developer: z.boolean(),
  /** IDs de permiso; el rol se asigna tras crear el rol en el backend. */
  permission_ids: z.array(z.uuid()).default([]),
});

export const updateRoleSchema = createRoleSchema.partial();