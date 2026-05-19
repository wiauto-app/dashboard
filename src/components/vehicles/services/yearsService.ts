import { objectToQueryString } from "@/lib/utils";
import { apiGet } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  CatalogYearItem,
  CatalogYearPaginationParams,
} from "../types/catalog.types";
import { V1_CATALOG_YEARS } from "./route.constants";

type YearResponse = { year: CatalogYearItem };

export const yearsService = {
  findAll: async (
    params: CatalogYearPaginationParams,
  ): Promise<PaginatedResult<CatalogYearItem>> => {
    const queryString = objectToQueryString(params);
    const response = await apiGet<PaginatedResult<CatalogYearItem>>(
      `${V1_CATALOG_YEARS}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  },

  findOne: async (id: number): Promise<CatalogYearItem> => {
    const response = await apiGet<YearResponse>(`${V1_CATALOG_YEARS}/${id}`);
    return response.data.year;
  },
};
