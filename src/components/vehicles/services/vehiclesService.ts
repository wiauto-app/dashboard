import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type { Vehicle, VehiclesParams } from "../types/vehicles.types";
import { V1_ADMIN_VEHICLES } from "./route.constants";
import { objectToQueryString } from "@/lib/utils";
import { format } from "date-fns";

const DATE_PARAM_KEYS = [
  "since_created_at",
  "until_created_at",
  "since_updated_at",
  "until_updated_at",
  "since_expires_at",
  "until_expires_at",
] as const;

const serializeVehiclesParams = (params?: VehiclesParams) => {
  if (!params) return "";

  const serialized: Record<string, unknown> = { ...params };
  delete serialized.skip;
  delete serialized.id;

  for (const key of DATE_PARAM_KEYS) {
    const value = serialized[key];
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      serialized[key] = format(value, "yyyy-MM-dd");
    }
  }

  return objectToQueryString(serialized);
};

export const vehiclesService = {
  async findAll(params?: VehiclesParams): Promise<PaginatedResult<Vehicle>> {
    const queryString = serializeVehiclesParams(params);
    const response = await apiGet<PaginatedResult<Vehicle>>(
      `${V1_ADMIN_VEHICLES}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },
};
