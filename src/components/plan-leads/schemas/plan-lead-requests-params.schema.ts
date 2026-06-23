import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";

export const planLeadRequestsParamsSchema = z.object({}).extend(
  paginationParamsSchema.shape,
);

export type PlanLeadRequestsParams = z.infer<typeof planLeadRequestsParamsSchema>;
