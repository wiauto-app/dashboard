import { apiDelete, apiGet, apiPatch, apiPost, type apiResponse } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type { AdminVehicleDetail, AdminVehicleListItem, Vehicle, VehicleSchema, UpdateVehicleSchema, VehiclesParams } from "../types/vehicles.types";
import type { VehicleStatus } from "../constants/vehicle-status.constants";
import { V1_ADMIN_VEHICLES, V1_VEHICLES } from "./route.constants";
import { objectToQueryString } from "@/lib/utils";
import { format } from "date-fns";
import { serializeVehiclePayload } from "../utils/serializeVehiclePayload";

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
  async findAll(params?: VehiclesParams): Promise<PaginatedResult<AdminVehicleListItem>> {
    const queryString = serializeVehiclesParams(params);
    const response = await apiGet<PaginatedResult<AdminVehicleListItem>>(
      `${V1_ADMIN_VEHICLES}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },

  async findOne(id: string): Promise<AdminVehicleDetail> {
    const response = await apiGet<{ vehicle: AdminVehicleDetail }>(
      `${V1_ADMIN_VEHICLES}/${id}`,
    );
    return response.data.vehicle;
  },

  async create(data: VehicleSchema): Promise<apiResponse<Vehicle>> {
    const response = await apiPost<Vehicle>(`${V1_VEHICLES}`, serializeVehiclePayload(data));
    return response;
  },

  async update(
    id: string,
    data: UpdateVehicleSchema,
  ): Promise<apiResponse<Vehicle>> {
    const response = await apiPatch<Vehicle>(
      `${V1_VEHICLES}/${id}`,
      serializeVehiclePayload(data, {
        only_temp_images: true,
        is_update: true,
      }),
    );
    return response;
  },

  async updateStatus(
    id: string,
    data: { status: VehicleStatus; message?: string },
  ): Promise<apiResponse<{ vehicle: Vehicle }>> {
    const response = await apiPatch<{ vehicle: Vehicle }>(
      `${V1_ADMIN_VEHICLES}/${id}/status`,
      data,
    );
    return response;
  },

  async delete(id: string): Promise<apiResponse<void>> {
    const response = await apiDelete<void>(`${V1_VEHICLES}/${id}`);
    return response;
  },
};
