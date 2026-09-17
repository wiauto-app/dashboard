import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";

export const leadsParamsSchema = z.object({}).extend(
  paginationParamsSchema.shape,
);

export type LeadsParams = z.infer<typeof leadsParamsSchema>;
