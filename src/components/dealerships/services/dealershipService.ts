import type { PaginatedResult } from "@/types/general.types";
import type { Dealership, DealershipParams } from "../types/dealership.types";
import { V1_DEALERSHIPS } from "./route.constants";
import { apiDelete, apiPatch, apiGet, apiPost, type apiResponse } from "@/services/api";
import { objectToQueryString } from "@/lib/utils";

export const dealershipService = {
  findAll: async (params?: DealershipParams): Promise<PaginatedResult<Dealership[]>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<Dealership[]>>(V1_DEALERSHIPS + `?${queryString}`);
    return response.data;
  },
  findOne: async (id: string): Promise<apiResponse<Dealership>> => {
    const response = await apiGet<Dealership>(`${V1_DEALERSHIPS}/${id}`);
    return response;
  },
  create: async (dealership: Dealership): Promise<apiResponse<Dealership>> => {
    const response = await apiPost<Dealership>(V1_DEALERSHIPS, dealership);
    return response;
  },
  update: async (id: string, dealership: Dealership): Promise<apiResponse<Dealership>> => {
    const response = await apiPatch<Dealership>(`${V1_DEALERSHIPS}/${id}`, dealership);
    return response;
  },
  delete: async (id: string): Promise<apiResponse<void>> => {
    const response = await apiDelete<void>(`${V1_DEALERSHIPS}/${id}`);
    return response;
  },
};
