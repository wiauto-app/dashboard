import z from "zod";
import { paginationParamsSchema } from "./pagination-params.schema";


export const userParamsSchema = z.object({
  name: z.string().optional(),
  role_id: z.string().optional(),
  email: z.string().optional(),
}).extend(paginationParamsSchema.shape);