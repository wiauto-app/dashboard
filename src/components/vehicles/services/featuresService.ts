import { apiDelete, apiGet, apiPatch, apiPost, type apiResponse } from "@/services/api"
import { V1_FEATURES } from "./route.constants"
import type { Feature } from "../types/vehicles.types"
import type { PaginatedResult, PaginationParams } from "@/types/general.types"
import { objectToQueryString } from "@/lib/utils"

export interface CreateFeatureDto {
  name: string;
}

export interface UpdateFeatureDto {
  id: string;
  name?: string;
}

export const featuresService = {
  findAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResult<Feature>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const suffix = query_string ? `?${query_string}` : "";
    const response = await apiGet<PaginatedResult<Feature>>(
      `${V1_FEATURES}${suffix}`,
    );
    return response.data;
  },
  findOne: async (id: string): Promise<apiResponse<Feature>> => {
    const response = await apiGet<Feature>(`${V1_FEATURES}/${id}`)
    return response;
  },
  create: async (feature: CreateFeatureDto): Promise<apiResponse<Feature>> => {
    const response = await apiPost<Feature>(`${V1_FEATURES}`, feature)
    return response;
  },
  update: async (feature: UpdateFeatureDto): Promise<apiResponse<Feature>> => {
    const response = await apiPatch<Feature>(`${V1_FEATURES}`, feature)
    return response;
  },
  delete: async (id: string): Promise<apiResponse<void>> => {
    const response = await apiDelete<void>(`${V1_FEATURES}/${id}`)
    return response;
  },
};