import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";

/**
 * Query params de listados de catálogo de vehículos (solo paginación / orden / búsqueda).
 * Misma forma que otros listados administrativos (p. ej. permisos sin filtros extra).
 */
export const vehicleCatalogParamsSchema = z.object({}).extend(
  paginationParamsSchema.shape,
);

export type VehicleCatalogParams = z.infer<typeof vehicleCatalogParamsSchema>;
