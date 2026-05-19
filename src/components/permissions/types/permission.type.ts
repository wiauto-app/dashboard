import type z from "zod";
import type { permissionParamsSchema } from "../schemas/permission-params.schema";


export interface Permission {
  id: string;
  name: string;
  key: string;
  value?: number;
  created_at: Date;
  updated_at: Date;
}

export type PermissionParams = z.infer<typeof permissionParamsSchema>;