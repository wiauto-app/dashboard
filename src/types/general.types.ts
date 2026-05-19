import type { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";
import type { phoneSchema } from "@/validations/resources/phone.schema";
import type z from "zod";


export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export type PhoneSchema = z.infer<typeof phoneSchema>;