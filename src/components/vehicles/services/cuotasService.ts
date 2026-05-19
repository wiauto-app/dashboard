import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type apiResponse,
} from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { Cuota } from "../types/vehicles.types";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";
import { V1_CUOTAS } from "./route.constants";

export type CreateCuotaDto = {
  name: string;
  value: number;
};

export type UpdateCuotaDto = {
  id: string;
  name?: string;
  value?: number;
};

export const cuotasService = {
  findAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResult<Cuota>> => {
    const merged = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      search: params?.search,
    };
    const query_string = objectToQueryString(merged);
    const response = await apiGet<PaginatedResult<Cuota>>(
      `${V1_CUOTAS}?${query_string}`,
    );
    return response.data;
  },

  findOne: async (id: string): Promise<apiResponse<Cuota>> => {
    const response = await apiGet<{ cuota: Cuota }>(`${V1_CUOTAS}/${id}`);
    return {
      ...response,
      data: response.data.cuota,
    };
  },

  create: async (payload: CreateCuotaDto): Promise<apiResponse<Cuota>> => {
    const response = await apiPost<{ cuota: Cuota }>(V1_CUOTAS, payload);
    return {
      ...response,
      data: response.data.cuota,
    };
  },

  update: async (dto: UpdateCuotaDto): Promise<apiResponse<Cuota>> => {
    const { id, ...body } = dto;
    const response = await apiPatch<{ cuota: Cuota }>(
      `${V1_CUOTAS}/${id}`,
      body,
    );
    return {
      ...response,
      data: response.data.cuota,
    };
  },

  delete: async (id: string): Promise<apiResponse<void>> => {
    return apiDelete<void>(`${V1_CUOTAS}/${id}`);
  },
};
