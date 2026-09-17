import { apiGet, apiPatch, apiDelete, type apiResponse } from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_ADMIN_LEADS } from "./route.constants";

export interface Lead {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  dni: string | null;
  phone: string;
  email: string;
  extra_data: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateLeadDto {
  status: string;
}

export interface FindLeadsParams extends PaginationParams {
  type?: string;
}

export const leadsService = {
  findAll: async (
    params?: FindLeadsParams,
  ): Promise<PaginatedResult<Lead>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      type: params?.type,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<Lead>>(
      `${V1_ADMIN_LEADS}?${query_string}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<Lead>> => {
    return apiGet<Lead>(`${V1_ADMIN_LEADS}/${id}`);
  },

  update: async (id: string, dto: UpdateLeadDto): Promise<apiResponse<Lead>> => {
    return apiPatch<Lead>(`${V1_ADMIN_LEADS}/${id}`, dto);
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_ADMIN_LEADS}/${id}`);
  },
};
