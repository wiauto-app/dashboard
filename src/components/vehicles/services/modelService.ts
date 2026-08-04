import { apiGet } from "@/services/api";
import { objectToQueryString } from "@/lib/utils";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogModelItem,
  CatalogModelPaginationParams,
} from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_CATALOG_MODELS } from "./route.constants";

const crud = createCatalogCrudService<CatalogModelItem>(
  V1_CATALOG_MODELS,
  "model",
);

export const modelService = {
  ...crud,
  findAll: async (
    params: CatalogModelPaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<CatalogModelItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogModelItem>>(
      `${V1_CATALOG_MODELS}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },
};
