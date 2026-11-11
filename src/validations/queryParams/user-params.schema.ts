import z from "zod";
import { paginationParamsSchema } from "./pagination-params.schema";


export const userParamsSchema = z.object({
  name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
}).extend(paginationParamsSchema.shape);
