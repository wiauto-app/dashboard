import z from "zod";
import { paginationParamsSchema } from "../../../validations/queryParams/pagination-params.schema";


export const permissionParamsSchema = z.object({
  name: z.string().optional(),
  key: z.string().optional(),
}).extend(paginationParamsSchema.shape);