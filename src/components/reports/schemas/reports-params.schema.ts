import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";
import type { ReportStatus, ReportTargetType } from "../types/report.types";

const report_status_values = [
  "open",
  "in_review",
  "resolved",
  "dismissed",
  "escalated",
] as const satisfies readonly ReportStatus[];

const report_target_type_values = [
  "profile",
  "dealership",
  "vehicle",
] as const satisfies readonly ReportTargetType[];

export const reportsParamsSchema = z
  .object({
    status: z.enum(report_status_values).optional(),
    target_type: z.enum(report_target_type_values).optional(),
    category_id: z.string().uuid().optional(),
  })
  .extend(paginationParamsSchema.shape);

export type ReportsParams = z.infer<typeof reportsParamsSchema>;
