import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";
import { z } from "zod";

export const dealershipParamsSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  email: z.string().optional(),
}).extend(paginationParamsSchema.shape);