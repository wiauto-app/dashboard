import z from "zod";

import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";

import type {
  AppraisalRequestPriority,
  AppraisalRequestStatus,
} from "../types/appraisal-request.types";

const appraisal_request_status_values = [
  "pending",
  "answered",
  "closed",
] as const satisfies readonly AppraisalRequestStatus[];

const appraisal_request_priority_values = [
  "low",
  "high",
] as const satisfies readonly AppraisalRequestPriority[];

export const appraisalRequestsParamsSchema = z
  .object({
    status: z.enum(appraisal_request_status_values).optional(),
    priority: z.enum(appraisal_request_priority_values).optional(),
  })
  .extend(paginationParamsSchema.shape);

export type AppraisalRequestsParams = z.infer<
  typeof appraisalRequestsParamsSchema
>;
