import z from "zod";


export const rolePermissionSchema = z.object({
  role_id: z.uuid(),
  permission_id: z.uuid(),
});