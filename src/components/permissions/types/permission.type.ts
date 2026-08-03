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

/** Entrada del catálogo hardcodeado (`GET /v1/permissions/catalog`). */
export interface PermissionCatalogItem {
  key: string;
  name: string;
  description: string;
  kind: "capability";
}

export type PermissionParams = z.infer<typeof permissionParamsSchema>;