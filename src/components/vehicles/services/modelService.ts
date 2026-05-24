import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogModelItem, CatalogModelPaginationParams } from "../types/catalog.types";
import { V1_CATALOG_MODELS } from "./route.constants";
import { objectToQueryString } from "@/lib/utils";






export const modelService = {
  findAll: async (params: CatalogModelPaginationParams) => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogModelItem>>(`${V1_CATALOG_MODELS}${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },
  findOne: async (id: number): Promise<CatalogModelItem> => {
    const response = await apiGet<{ model: CatalogModelItem }>(
      `${V1_CATALOG_MODELS}/${id}`,
    );
    return response.data.model;
  },
};