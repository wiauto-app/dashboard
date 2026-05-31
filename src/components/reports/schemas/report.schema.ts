import { z } from "zod";

const report_target_type_enum = z.enum(["profile", "dealership", "vehicle"]);

const report_status_enum = z.enum([
  "open",
  "in_review",
  "resolved",
  "dismissed",
  "escalated",
]);

export const createReportSchema = z.object({
  title: z.string().min(1, { message: "El título es obligatorio" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  category_id: z.string().uuid({ message: "Selecciona una categoría" }),
  target_type: report_target_type_enum,
  target_id: z.string().uuid({ message: "Selecciona un objetivo" }),
  file_url: z.string().optional(),
});

export const updateReportSchema = z.object({
  title: z.string().min(1, { message: "El título es obligatorio" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  file_url: z.string().optional(),
  status: report_status_enum,
  admin_notes: z.string().optional(),
});
