import { z } from "zod";

const report_target_type_enum = z.enum(["profile", "dealership", "vehicle"]);

export const createReportCategorySchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  target_type: report_target_type_enum,
});

export const updateReportCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }).optional(),
  target_type: report_target_type_enum.optional(),
});
