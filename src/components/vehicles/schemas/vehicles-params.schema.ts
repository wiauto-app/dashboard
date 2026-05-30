import { localDateQueryParamSchema } from "@/validations/queryParams/local-date-query-param.schema";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";
import z from "zod";
import {
  VEHICLE_PUBLISHER_TYPE_VALUES,
  VEHICLE_STATUS_VALUES,
} from "../constants/vehicle-enums.constants";

const vehicleStatusSchema = z.enum(VEHICLE_STATUS_VALUES);

const publisherTypeSchema = z.enum(VEHICLE_PUBLISHER_TYPE_VALUES);

export const vehiclesSchema = z
  .object({
    id: z.string().optional(),
    publisher_name: z.string().optional(),
    publisher_email: z.string().optional(),
    status: vehicleStatusSchema.optional(),
    since_created_at: localDateQueryParamSchema,
    until_created_at: localDateQueryParamSchema,
    since_updated_at: localDateQueryParamSchema,
    until_updated_at: localDateQueryParamSchema,
    since_expires_at: localDateQueryParamSchema,
    until_expires_at: localDateQueryParamSchema,
    is_featured: z.coerce.boolean().optional(),
    publisher_type: publisherTypeSchema.optional(),
    vehicle_type_id: z.string().optional(),
    query: z.string().optional(),
    skip: z.coerce.number().optional(),
  })
  .extend(paginationParamsSchema.shape);
