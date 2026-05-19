import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult, PaginationParams } from "@/types/general.types";

export const createPaginatedListService = <T>(path: string) => ({
  findAll: async (params: PaginationParams): Promise<PaginatedResult<T>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<T>>(`${path}${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },
});
