import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";

export const planContactLeadsParamsSchema = z.object({}).extend(
  paginationParamsSchema.shape,
);

export type PlanContactLeadsParams = z.infer<
  typeof planContactLeadsParamsSchema
>;
