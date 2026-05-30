import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";

export const supportCatalogParamsSchema = z.object({}).extend(
  paginationParamsSchema.shape,
);

export type SupportCatalogParams = z.infer<typeof supportCatalogParamsSchema>;
