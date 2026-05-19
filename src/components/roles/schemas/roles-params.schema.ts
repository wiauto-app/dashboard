import z from "zod";
import { paginationParamsSchema } from "../../../validations/queryParams/pagination-params.schema";


export const rolesParamsSchema = z.object({
  name: z.string().optional(),
  is_admin: z.boolean().optional(), 
  is_developer: z.boolean().optional(),
}).extend(paginationParamsSchema.shape);