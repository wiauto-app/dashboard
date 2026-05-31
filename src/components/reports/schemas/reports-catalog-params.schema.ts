import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";
import type { ReportTargetType } from "../types/report.types";

const report_target_type_values = [
  "profile",
  "dealership",
  "vehicle",
] as const satisfies readonly ReportTargetType[];

export const reportsCatalogParamsSchema = z
  .object({
    target_type: z.enum(report_target_type_values).optional(),
  })
  .extend(paginationParamsSchema.shape);

export type ReportsCatalogParams = z.infer<typeof reportsCatalogParamsSchema>;
