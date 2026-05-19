import { z } from "zod";


export const paginationParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  order_by: z.string().optional(),
  order_direction: z.enum(["ASC", "DESC"]).optional(),
  search: z.string().optional(),
});