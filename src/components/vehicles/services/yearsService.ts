import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogYearItem,
  CatalogYearPaginationParams,
} from "../types/catalog.types";
import { createCatalogCrudService } from "./catalogCrudService";
import { V1_CATALOG_YEARS } from "./route.constants";

const crud = createCatalogCrudService<CatalogYearItem>(
  V1_CATALOG_YEARS,
  "year",
);

export const yearsService = {
  ...crud,
  findAll: async (
    params: CatalogYearPaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<CatalogYearItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogYearItem>>(
      `${V1_CATALOG_YEARS}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },
};
